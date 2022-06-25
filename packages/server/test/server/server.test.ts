import { expect } from 'expect';
import { ProjectRunner } from 'e2e-test-kit';
import { dirname } from 'path';
import { after, afterEach, before } from 'mocha';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

describe('Server', () => {
  const { runner } = ProjectRunner.create({
    launchOptions: {
      // headless: false,
    },
    path: dirname(require.resolve('server')),
  }).beforeAndAfter({ after, afterEach, before });

  it('should render server project', async () => {
    const { page, responses } = await runner.openPage(runner.baseUrl(), { captureResponses: true });
    const firstResponseBody = (await responses[0]?.body())?.toString();

    // Initial HTML
    expect(firstResponseBody).toContain('<div id="root" data-ssr><h1>Hello World (hydrated)</h1></div>');

    // After hydration
    expect(await page.locator('h1').innerText()).toEqual('Hello World (hydrated)');
  });
});
