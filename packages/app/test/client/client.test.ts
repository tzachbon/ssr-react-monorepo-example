import { expect } from 'expect';
import { ProjectRunner } from 'e2e-test-kit';
import { dirname } from 'path';
import { after, afterEach, before } from 'mocha';

describe('Client', () => {
  const { runner } = ProjectRunner.create({
    launchOptions: {
      // headless: false,
    },
    path: dirname(require.resolve('app')),
    isClientOnly: true,
  }).beforeAndAfter({ after, afterEach, before });

  it('should render client project', async () => {
    const { page } = await runner.openPage(runner.baseUrl());

    expect(await page.locator('h1').innerText()).toEqual('Hello World (client-only)');
  });
});
