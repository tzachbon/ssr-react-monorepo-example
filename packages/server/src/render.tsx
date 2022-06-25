import ReactDOMServer from 'react-dom/server';
import { App } from 'app';
import { on } from 'events';
import type { Express, Request, Response } from 'express';
import fs from 'fs';
import { htmlPath } from './consts.js';

export function createAppRenderer(app: Express) {
  /**
   * Expose the rendered App from any path that is not resolved (as SPA application).
   */
  app.get('*', (req, res) => {
    void render(req, res);
  });
}

async function render(_request: Request, response: Response) {
  try {
    response.writeHead(200, {
      'Content-Type': 'text/html',
      'content-transfer-encoding': 'chunked',
      'x-content-type-options': 'nosniff',
    });

    const html = await fs.promises.readFile(htmlPath, 'utf8');

    for await (const { chunk, shouldFlush } of renderChunks(html)) {
      response.write(chunk);
      if (shouldFlush) {
        response.flush();
      }
    }

    return response.end();
  } catch (error) {
    console.error(error);
    return response.status(500).send(error instanceof Error ? error.message : error);
  }
}

function injectScripts(html: string) {
  /**
   * Remove the "unpkg" script tag from the html.
   */
  html = html.replace(/(<!-- Client Scripts -- start -->)([\s\S]*?)(<!-- Client Scripts -- end -->)/gm, '');
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

async function* renderChunks(html: string): AsyncGenerator<{ chunk: string; shouldFlush: boolean }> {
  const abortController = new AbortController();

  html = injectScripts(html);

  const stream = ReactDOMServer.renderToStaticNodeStream(<App text="Hello World (hydrated)" />);
  const [start, end, openDiv] = [...html.split('<div id="root">'), '<div id="root" data-ssr>'];

  yield { chunk: start, shouldFlush: false };
  yield { chunk: openDiv, shouldFlush: true };

  stream.on('end', () => {
    abortController.abort('Finished rendering');
  });

  try {
    for await (const chunk of on(stream, 'data', { signal: abortController.signal })) {
      yield { chunk: String(chunk), shouldFlush: false };
    }
  } catch (errorOrAbort) {
    if (!abortController.signal.aborted) {
      throw errorOrAbort; // It's an error.
    }
  }

  yield { chunk: end, shouldFlush: true };
}
