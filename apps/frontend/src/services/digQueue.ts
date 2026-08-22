import { dig } from "../api/structures";
import { Bug } from "../types/bug";
import { Item } from "../types/item";

export class DigQueueService {
  private operations: Array<() => Promise<void>> = [];
  private isRunning = false;

  constructor(private digRequest: (structureId: string) => Promise<Item | Bug> = dig) {}

  enqueue(structureId: string): Promise<Item | Bug> {
    return new Promise((resolve, reject) => {
      this.operations.push(async () => {
        try {
          resolve(await this.digRequest(structureId));
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

export const digQueue = new DigQueueService();
