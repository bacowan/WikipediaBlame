import * as Diff from 'diff'
import DiffWorker from './DiffWorker?worker'

export function diffChars(oldStr: string, newStr: string, options?: Diff.BaseOptions): Diff.Change[] {
    return Diff.diffChars(oldStr, newStr, options);
}

export async function diffCharsAsync(oldStr: string, newStr: string, options?: Diff.BaseOptions): Promise<Diff.Change[]> {
    return new Promise((resolve, _) => {
        Diff.diffChars(oldStr, newStr, {
            ...options,
            callback: (changes: Diff.Change[]) => {
                resolve(changes);
            }
        });
      });
}

export async function diffCharsWebworkersAsync(oldStr: string, newStr: string, options?: Diff.BaseOptions): Promise<Diff.Change[]> {
    const promise = new Promise<Diff.Change[]>((resolve, reject) => {
        const worker = new DiffWorker();
        worker.onmessage = (e) => {
            if (e.data.ok === true) {
                resolve(e.data.value);
            }
            else if (typeof e.data.value === 'string') {
                reject(e.data.value);
            }
            else {
                reject("unknown error");
            }
        }
        worker.postMessage({oldStr, newStr, options});
    });
    return promise;
}