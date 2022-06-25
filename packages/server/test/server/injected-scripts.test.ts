import { expect } from 'expect';
import { ProjectRunner } from 'e2e-test-kit';
import { dirname } from 'path';
import { after, afterEach, before } from 'mocha';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

describe('Server Headers', () => {
  const { runner } = ProjectRunner.create({
    launchOptions: {
      // headless: false,
    },
    path: dirname(require.resolve('server')),
  }).beforeAndAfter({ after, afterEach, before });

  it('should include react server side scripts', async () => {
    const { page } = await runner.openPage(runner.baseUrl());

    const scripts = await page
      .locator('script')
      .evaluateAll((scripts) => scripts.map((script) => script.getAttribute('src')));

    expect(scripts).toEqual(
      expect.arrayContaining(['react/umd/react.production.min.js', 'react-dom/umd/react-dom.production.min.js'])
    );
  });
});
