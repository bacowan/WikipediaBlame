import * as Diff from 'diff'

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
  