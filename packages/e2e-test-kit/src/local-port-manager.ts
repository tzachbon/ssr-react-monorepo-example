import findCacheDir from 'find-cache-dir';
import { nodeFs } from '@file-services/node';
import { safeListeningHttpServer } from 'create-listening-server';

export class LocalPortManager {
  private portsPath: string;
  private visitedPorts: Set<number> = new Set();

  constructor(private end: number, private start: number) {
    const tempDir = findCacheDir({ name: 'e2e-test-kit', create: true });
    if (tempDir) {
      nodeFs.ensureDirectorySync(tempDir);
    }

    if (!tempDir) {
      throw new Error('Could not find a "e2e-test-kit" temp directory');
    }

    this.portsPath = nodeFs.resolve(tempDir, 'ports');
  }

  public async ensurePort() {
    const preferredPort = this.getPort();
    const { port, httpServer } = await safeListeningHttpServer(preferredPort);

    if (port !== preferredPort) {
      this.setPort(port);
    }

    await new Promise((resolve, reject) => httpServer.close((error) => (error ? reject(error) : resolve(void 0))));

    return port;
  }

  public getPort(): number {
    const port = this.getNextPort();

    this.setPort(port);

    return port;
  }

  public releasePorts(currentPorts?: number[]) {
    this.updatePersistentPorts((ports) => {
      for (const port of [...(currentPorts ?? this.visitedPorts)]) {
        ports.delete(port);
        this.visitedPorts.delete(port);
      }
    });
  }

  public setPort(port: number) {
    this.visitedPorts.add(port);
    this.updatePersistentPorts((ports) => {
      ports.add(port);
    });
  }

  public clean(): void {
    this.visitedPorts.clear();
    nodeFs.rmSync(this.portsPath, { force: true });
  }

  private getNextPort(): number {
    const maxIterations = this.end - this.start;
    let iteration = 0;
    let port = randomNumberBetween(this.start, this.end);

    while (this.getPersistentPorts().has(port)) {
      port = randomNumberBetween(this.start, this.end);

      if (++iteration > maxIterations) {
        throw new Error(`Could not find a free port between ${this.start} and ${this.end}`);
      }
    }

    return port;
  }

  private updatePersistentPorts(callback: (ports: Set<number>) => void) {
    const ports = this.getPersistentPorts();
    const newPorts = new Set(ports);

    callback(newPorts);

    nodeFs.ensureDirectorySync(this.portsPath);

    for (const port of ports) {
      if (newPorts.has(port)) {
        newPorts.delete(port);
        continue;
      }

      nodeFs.rmSync(nodeFs.join(this.portsPath, String(port)), { force: true });
    }

    for (const port of newPorts) {
      nodeFs.writeFileSync(nodeFs.join(this.portsPath, String(port)), '');
    }
  }

  private getPersistentPorts(): Set<number> {
    nodeFs.ensureDirectorySync(this.portsPath);
    const ports = new Set(nodeFs.readdirSync(this.portsPath).map(Number));
    return ports;
  }
}

function randomNumberBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
