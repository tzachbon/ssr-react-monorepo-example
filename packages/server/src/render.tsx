import ReactDOMServer from 'react-dom/server';
import { App } from 'app';
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

    return renderChunks(response);
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

async function renderChunks(response: Response) {
  const initialHtml = await fs.promises.readFile(htmlPath, 'utf8');
  const html = injectScripts(initialHtml);

  let didError = false;

  const [start, _end, openDiv] = [...html.split('<div id="root">'), '<div id="root" data-ssr>'];

  const stream = ReactDOMServer.renderToPipeableStream(<App text="Hello World (hydrated)" />, {
    onShellReady() {
      response.statusCode = didError ? 500 : 200;

      response.write(start);
      response.write(openDiv);

      stream.pipe(response);

      // Missing closing part of the div tag.
    },
    onShellError(error) {
      response.statusCode = 500;
      response.send(
        initialHtml.replace(
          '</body>',
          `<script>console.error('SSR Error - Fallback to client render', JSON.stringify('${String(
            error
          )}'))</script></body>`
        )
      );
    },
    onError(error) {
      didError = true;
      response.statusCode = 500;
      console.error(error);
    },
  });
}
