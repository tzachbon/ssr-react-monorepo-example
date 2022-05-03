import {
  after as mochaAfter,
  afterEach as mochaAfterEach,
  before as mochaBefore,
  type HookFunction as MochaHook,
} from 'mocha';
import playwright, { LaunchOptions, type Browser } from 'playwright';
import { Ports } from 'ensure-port';
import { runService, serve } from './serve';
import type { IFileSystem } from '@file-services/types';
import { nodeFs } from '@file-services/node';

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
  log?: boolean;
  fs?: IFileSystem;
  port?: number;
}

export class ProjectRunner {
  private destroyCallbacks = new Set<() => void>();
  private browser: Browser | undefined;
  private browserContexts: playwright.BrowserContext[] = [];
  private ports: Ports;
  private fs: IFileSystem;

  public log: (...messages: string[]) => void;
  public port: number | undefined;

  private constructor(private options: ProjectRunnerOptions) {
    this.fs = this.options.fs ?? nodeFs;
    this.log = this.options.log ? console.log.bind(console, '[ProjectRunner]') : () => void 0;
    this.ports = new Ports({ startPort: 8000, endPort: 9000 }, { fs: this.fs });
  }

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
        await runner.ports.release();
      });

      after('destroy runner', async () => {
        await runner.destroy();
        await runner.ports.dispose();
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
    this.port = this.options.port ?? (await this.ports.ensure());

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
    await page.goto(url, { waitUntil: 'networkidle' });
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
      if (process.env.ENDPOINT_URL) {
        this.browser = await playwright.chromium.connectOverCDP(process.env.ENDPOINT_URL, this.options.launchOptions);
      } else {
        this.browser = await playwright.chromium.launch(this.options.launchOptions);
      }
    }
  }
}
