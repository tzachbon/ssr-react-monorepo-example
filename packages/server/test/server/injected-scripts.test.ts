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

  it('should include react server side scripts', async () => {
    const { page } = await runner.openPage(runner.baseUrl());

    const scripts = await page
      .locator('script')
      .evaluateAll((scripts) =>
        scripts
          .map((script) => script.getAttribute('src'))
          .filter((scriptSource) => scriptSource && !/^client.js/.test(scriptSource) /* Remove client side script */)
      );

    expect(scripts).toEqual(['react/umd/react.production.min.js', 'react-dom/umd/react-dom.production.min.js']);
  });
});
