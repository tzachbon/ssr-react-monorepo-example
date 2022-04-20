import ReactDOMServer from 'react-dom/server';
import { App } from 'app';
import fs from 'fs';
import path from 'path';
import type { Request, Response } from 'express';
import { on } from 'events';

export async function render(appRootPath: string, _request: Request, response: Response) {
  try {
    response.setHeader('Content-Type', 'text/html; charset=utf-8');

    const html = await fs.promises.readFile(path.join(appRootPath, 'index.html'), 'utf8');

    for await (const chunk of renderChunks(html)) {
      response.write(chunk);
      response.flush();
    }

    return response.status(200).end();
  } catch (error) {
    console.error(error);
    return response.status(500).send(error instanceof Error ? error.message : error);
  }
}

function injectScripts(html: string) {
  /**
   * Remove the "unpkg" script tag from the html.
   */
  html = html.replace(new RegExp(`<script crossorigin src="https://unpkg.com/(.*?)"><\/script>`, 'g'), '');
  for (const scriptRequest of ['react/umd/react.production.min.js', 'react-dom/umd/react-dom.production.min.js']) {
    /**
     * Add the request to the html as scripts.
     */
    html = html.replace('</head>', `<script src="${scriptRequest}"></script></head>`);
  }

  if (process.env.ENV === 'development') {
    html = html.replace(/production.min/g, 'development');
  }

  return html;
}

async function* renderChunks(html: string) {
  const abortController = new AbortController();

  html = injectScripts(html);

  const stream = ReactDOMServer.renderToStaticNodeStream(<App text="ssr" />);
  const [start, end, openDiv] = [...html.split('<div id="root">'), '<div id="root" data-ssr>'];

  yield start;
  yield openDiv;

  stream.on('end', () => {
    abortController.abort('Finished rendering');
  });

  try {
    for await (const chunk of on(stream, 'data', { signal: abortController.signal })) {
      yield chunk.toString();
    }
  } catch (errorOrAbort) {
    if (!abortController.signal.aborted) {
      throw errorOrAbort; // It's an error.
    }
  }

  yield end;
}
