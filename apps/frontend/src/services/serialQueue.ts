export class SerialQueue<TResult> {
  private operations: Array<() => Promise<void>> = [];
  private isRunning = false;

  constructor(private request: (id: string) => Promise<TResult>) {}

  enqueue(id: string): Promise<TResult> {
    return new Promise((resolve, reject) => {
      this.operations.push(async () => {
        try {
          resolve(await this.request(id));
        } catch (error) {
          reject(error);
        }
      });
      void this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    try {
      while (this.operations.length > 0) {
        const operation = this.operations.shift();
        if (!operation) {
          continue;
        }
        await operation();
      }
    } finally {
      this.isRunning = false;
      if (this.operations.length > 0) {
        await this.processQueue();
      }
    }
  }
}
