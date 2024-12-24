import * as Diff from 'diff'

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
  