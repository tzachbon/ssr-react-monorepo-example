import ReactDOMClient from 'react-dom/client';
import { App } from './app.js';

const container = globalThis.document?.getElementById('root');

if (container) {
  if (container.hasAttribute('data-ssr')) {
    ReactDOMClient.hydrateRoot(container, <App text="Hello World (hydrated)" />);
  } else {
    ReactDOMClient.createRoot(container).render(<App text="Hello World (client-only)" />);
  }
}
