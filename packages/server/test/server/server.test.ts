import expect from 'expect';
import { ProjectRunner } from 'e2e-test-kit';
import { dirname } from 'path';
import { after, afterEach, before } from 'mocha';

describe('Server', () => {
  const { runner } = ProjectRunner.create({
    launchOptions: {
      // headless: false,
    },
    path: dirname(require.resolve('server')),
  }).beforeAndAfter({ after, afterEach, before });

  it('should render server project', async () => {
    const { page } = await runner.openPage(runner.baseUrl());

    expect(await page.locator('h1').innerText()).toEqual('Hello World (hydrated)');
  });
});
