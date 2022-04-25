import {
  after as mochaAfter,
  afterEach as mochaAfterEach,
  before as mochaBefore,
  type HookFunction as MochaHook,
} from 'mocha';
import playwright, { LaunchOptions, type Browser } from 'playwright';
import { LocalPortManager } from './local-port-manager';
import { runService, serve } from './serve';

interface TestHooks {
  after?: MochaHook;
  afterEach?: MochaHook;
  before?: MochaHook;
}
interface ProjectRunnerOptions {
  launchOptions?: LaunchOptions;
  timeout?: number;
  isClientOnly?: boolean;
  path: string;
}

export class ProjectRunner {
  private destroyCallbacks = new Set<() => void>();
  private browser: Browser | undefined;
  private browserContexts: playwright.BrowserContext[] = [];
  private portManager = new LocalPortManager(9000, 8000);
  public port: number | undefined;

  private constructor(private options: ProjectRunnerOptions) {}

  static create(runnerOptions: ProjectRunnerOptions) {
    runnerOptions.timeout ??= 40_000;

    const runner = new this(runnerOptions);
    const response = {
      runner,
    };

    return {
      ...response,
      beforeAndAfter,
    };

    function beforeAndAfter({ after = mochaAfter, afterEach = mochaAfterEach, before = mochaBefore }: TestHooks = {}) {
      before('bundle and serve project', async function () {
        this.timeout(runnerOptions.timeout!);

        await runner.run();
      });

      afterEach('cleanup open pages', async () => {
        await runner.closeAllPages();

        runner.portManager.releasePorts();
      });

      after('destroy runner', async () => {
        await runner.destroy();
      });

      return response;
    }
  }

  public baseUrl() {
    if (!this.port) {
      throw new Error('Cannot get base url before runner is started');
    }

    return `http://localhost:${this.port}`;
  }

  public async run() {
    this.port = await this.portManager.ensurePort();

    const pathToServe = this.options.path;
    const { close } = await (this.options.isClientOnly
      ? serve(pathToServe, this.port)
      : runService(pathToServe, this.port));

    this.destroyCallbacks.add(() => close());

    await this.createBrowser();
  }

  public async closeAllPages() {
    for (const browserContext of this.browserContexts) {
      await browserContext.close();
    }
    this.browserContexts.length = 0;
  }

  public async openPage(url: string, { captureResponses }: { captureResponses?: boolean } = {}) {
    await this.createBrowser();

    const browserContext = await this.browser!.newContext();
    this.browserContexts.push(browserContext);

    const page = await browserContext.newPage();

    const responses: playwright.Response[] = [];
    if (captureResponses) {
      page.on('response', (response) => responses.push(response));
    }
    await page.goto(url, { waitUntil: captureResponses ? 'networkidle' : 'load' });
    return { page, responses };
  }

  public async destroy() {
    await this.closeAllPages();

    for (const cb of this.destroyCallbacks) {
      cb();
    }
  }

  private async createBrowser() {
    if (!this.browser) {
      if (process.env.PLAYWRIGHT_SERVER) {
        this.browser = await playwright.chromium.connect(process.env.PLAYWRIGHT_SERVER, this.options.launchOptions);
      } else {
        this.browser = await playwright.chromium.launch(this.options.launchOptions);
      }
    }
  }
}
