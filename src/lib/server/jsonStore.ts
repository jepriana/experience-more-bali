import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * Tiny JSON-file stores for the MVP (trips, check-ins, partner network, connect).
 * Files live in DATA_DIR (default `.data/` in the project). Each store serialises its writes
 * and replaces the file atomically, so concurrent requests can't corrupt it.
 * Swapping to Firestore later means re-implementing createStore only.
 */

// (the turbopackIgnore hint stops the build from tracing the whole project for this runtime path)
export const DATA_DIR = process.env.DATA_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), '.data');

export function createStore<T>(fileName: string, initial: () => T) {
  const file = path.join(DATA_DIR, fileName);
  let queue: Promise<unknown> = Promise.resolve();

  async function read(): Promise<T> {
    try {
      return JSON.parse(await fs.readFile(file, 'utf8')) as T;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') console.error(`[store] could not read ${fileName}:`, err);
      return initial();
    }
  }

  async function save(data: T) {
    await fs.mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 1), 'utf8');
    await fs.rename(tmp, file);
  }

  /** Read-modify-write under a lock. Return value of `fn` is passed through. */
  function update<R>(fn: (data: T) => R | Promise<R>): Promise<R> {
    const run = queue.then(async () => {
      const data = await read();
      const result = await fn(data);
      await save(data);
      return result;
    });
    queue = run.catch(() => undefined);
    return run;
  }

  return { read, update };
}
