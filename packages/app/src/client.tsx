import ReactDOM from 'react-dom';
import { App } from './app';

const container = globalThis.document?.getElementById('root')!;

if (container) {
  initialApp();
}

function initialApp() {
  if (container.hasAttribute('data-ssr')) {
    ReactDOM.hydrate(<App text="Hello World (hydrated)" />, container);
  } else {
    ReactDOM.render(<App text="Hello World (client-only)" />, container);
  }
}
