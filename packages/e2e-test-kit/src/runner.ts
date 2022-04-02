import { fork } from 'child_process';
import { after, afterEach, before } from 'mocha';
import playwright, { LaunchOptions, type Browser } from 'playwright';
import { serve } from './serve';

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

  public port: number = 8080;

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

    function beforeAndAfter() {
      before('bundle and serve project', async function () {
        this.timeout(runnerOptions.timeout!);

        await runner.run();
      });

      afterEach('cleanup open pages', async () => {
        await runner.closeAllPages();
      });

      after('destroy runner', async () => {
        await runner.destroy();
      });

      return response;
    }
  }

  public baseUrl() {
    return `http://localhost:${this.port}`;
  }

  public async run() {
    const pathToServe = this.options.path;
    const getPort = (await dynamicImport<typeof import('get-port')>('get-port')).default;
    this.port = await getPort({ port: this.port });

    if (this.options.isClientOnly) {
      const server = await serve(pathToServe, this.port);
      this.destroyCallbacks.add(() => server.close());
    } else {
      const childProcess = fork(pathToServe, [this.port.toString()], {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
      });

      this.destroyCallbacks.add(() => childProcess.kill());
    }

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

// TODO: remove this when typescript support "module": "node12" and replace with dynamic import
function dynamicImport<J>(request: string) {
  return Function(`return import("${request}")`)() as Promise<J>;
}
