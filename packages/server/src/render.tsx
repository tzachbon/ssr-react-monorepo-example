import ReactDOMServer from 'react-dom/server';
import { App } from 'app';
import fs from 'fs';
import path from 'path';
import type { Request, Response } from 'express';

export async function render(appRootPath: string, _request: Request, response: Response) {
  try {
    const renderedApp = ReactDOMServer.renderToString(<App text="ssr" />);
    const html = await fs.promises.readFile(path.join(appRootPath, 'index.html'), 'utf8');

    return response.status(200).send(
      injectScripts(html).replace(
        '<div id="root"></div>',
        `
      <div id="root" data-ssr>${renderedApp}</div>
      `
      )
    );
  } catch (error) {
    return response.status(500).send(error instanceof Error ? error.message : error);
  }
}

function injectScripts(html: string) {
  /**
   * Remove the "unpkg" script tag from the html.
   */
  html = html.replace(new RegExp(`<script src="https://unpkg.com/(.*?)"><\/script>`, 'g'), '');

  for (const scriptRequest of ['react/umd/react.production.min.js', 'react-dom/umd/react-dom.production.min.js']) {
    /**
     * Add the request to the html as scripts.
     */
    html = html.replace('</head>', `<script src="${scriptRequest}"></script></head>`);
  }

  return html;
}
