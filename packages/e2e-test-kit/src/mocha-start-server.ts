import { BrowserServer, chromium } from 'playwright';

export const mochaGlobalSetup = async function (this: { server?: BrowserServer }) {
  try {
    await chromium.connectOverCDP(process.env.ENDPOINT_URL!).then((browser) => browser.close());
    console.log(`Chrome debugger instance found, trying to connect ${process.env.ENDPOINT_URL!}`);
  } catch (e) {
    this.server = await chromium.launchServer();
    process.env.PLAYWRIGHT_SERVER = this.server.wsEndpoint();
    console.log(`Browser server running on ${process.env.PLAYWRIGHT_SERVER}`);
  }
};

export const mochaGlobalTeardown = async function (this: { server?: BrowserServer }) {
  if (this.server) {
    await this.server.close();
    console.log('Browser server stopped!');
  }
};
