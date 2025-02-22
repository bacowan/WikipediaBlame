import Revision from "../structures/Revision";
import { diffChars, diffCharsWebworkersAsync } from "./DiffUtils";
import AbortedError from "../errors/AbortedError";

export interface RevisionAttributionProgress {
  completed: number,
  total: number,
  attributions: TextAttributions
}

export interface TextAttribution {
  char: string,
  revision: Revision | null
}

export interface TextAttributions {
  latestText: string,
  lastComparedRevision: Revision | null,
  attributions: TextAttribution[]
}

export async function* getRevisionAttributions(
    revisions: Revision[],
    existingAttributions?: TextAttributions,
    abortSignal?: AbortSignal,
    isAsync?: boolean) : AsyncGenerator<RevisionAttributionProgress, void, void> {

  if (isAsync === undefined) {
    isAsync = true;
  }
  
  let firstRevToCompare: number;
  if (!existingAttributions) {
    existingAttributions = {
      latestText: revisions[0].content,
      attributions: Array.from(revisions[0].content, c => ({ char: c, revision: null })),
      lastComparedRevision: revisions[0]
    };
    firstRevToCompare = 1;
  }
  else {
    firstRevToCompare = 0;
  }

  let completedCount = 0;
  yield {
    completed: 0,
    total: revisions.length - firstRevToCompare,
    attributions: existingAttributions
  }

  for (let revision of revisions.slice(firstRevToCompare)) {
    const diff = isAsync
      ? await diffCharsWebworkersAsync(revision.content, existingAttributions.latestText)
      : diffChars(revision.content, existingAttributions.latestText);
    const charDiffs = diff
      .flatMap(d => Array.from(d.value).map(char => ({ char, added: d.added, removed: d.removed })))
      .filter(d => !d.removed);
    for (let i = 0; i < charDiffs.length; i++) {
      if (existingAttributions.attributions[i].revision === null && charDiffs[i].added) {
        existingAttributions.attributions[i].revision = existingAttributions.lastComparedRevision;
      }
    }
    existingAttributions.lastComparedRevision = revision;
    
    if (abortSignal?.aborted) {
      throw new AbortedError("Diff process was aborted");
    }

    yield {
      completed: ++completedCount,
      total: revisions.length - firstRevToCompare,
      attributions: existingAttributions
    }
  }
}

/*export interface TextAttribution {
  char: string,
  change: "added" | "removed" | "unchanged",
  revision: Revision
}

export interface Blame {
  newestText: string,
  oldestText: string,
  additions: { char: string, revision: Revision, changed: boolean }[],
  removals: { char: string, revision: Revision }[]
}

export interface RevisionDiffProgress {
  completed: number,
  total: number,
  blame: Blame
}

export async function* getRevisionDiffs(
  revisions: Revision[],
  existingBlame: Blame | null,
  abortSignal?: AbortSignal) : AsyncGenerator<RevisionDiffProgress, void, void> {
    let blame: Blame;
    let firstRevToCompare: number;
    
    if (existingBlame) {
      blame = existingBlame;
      firstRevToCompare = 0;
    }
    else {
      blame = {
        newestText: revisions[0].content,
        oldestText: revisions[0].content,
        additions: Array.from(revisions[0].content, char => ({ char, revision: revisions[0], changed: false })),
        removals: []
      };
      firstRevToCompare = 1;
    }

    for (let revIndex = firstRevToCompare; revIndex < revisions.length; revIndex++) {
      const previousRev = revisions[revIndex];
      const previousText = previousRev.content;
      const diff = await diffCharsWebworkersAsync(previousText, blame.newestText);
      const charDiffs = diff.flatMap(d => Array.from(d.value).map(char => ({ char, added: d.added, removed: d.removed })));
      let newChanges: Revision[] = [];
      let textIndex = 0;
      let blameIndex = 0;
      let diffIndex = 0;
      while (diffIndex < charDiffs.length) {
        const charDiff = charDiffs[diffIndex];
        const blameItem
      }



        if (part.removed) {
          newChanges.push(...Array.from(part.value, () => previousRev));
        }
        else if (part.added) {
          attribution.removals.push(...Array.from(part.value, (char) => ({ char, removedAt: revIndex - 1 })));
          textIndex += part.value.length;
        }
      }
    }
}





export interface RevisionDiffProgressxxx {
  completed: number,
  total: number,
  revisionDiffs: RevisionDiff[],
  revsCompared: number,
  comparedRevId: number
}

export async function* getRevisionDiffsxxx(
    latestRev: Revision | null,
    revsToDiff: Revision[],
    previousRevisionDiffs: RevisionDiff[],
    isAsync: boolean,
    abortSignal?: AbortSignal) : AsyncGenerator<RevisionDiffProgress, void, void> {

  if (latestRev === null) {
    latestRev = revsToDiff[0];
  }
  if (previousRevisionDiffs.length === 0) {
    previousRevisionDiffs = [{
      text: revsToDiff[0].content,
      revision: revsToDiff[0],
      type: "unchanged"
    }];
  }
  else {
    previousRevisionDiffs = previousRevisionDiffs;
  }

  yield {
    completed: 0,
    total: revsToDiff.length - 1,
    revisionDiffs: previousRevisionDiffs,
    revsCompared: 1,
    comparedRevId: revsToDiff[0].id
  };

  for (let i = 1; i < revsToDiff.length; i++) {
    const olderRev = revsToDiff[i];
    const newerRev = revsToDiff[i - 1];
    previousRevisionDiffs = await getRevisionDiff(previousRevisionDiffs, olderRev, newerRev, latestRev, isAsync);
    yield {
      completed: i,
      total: revsToDiff.length - 1,
      revisionDiffs: previousRevisionDiffs,
      revsCompared: i + 1,
      comparedRevId: revsToDiff[i].id
    }
    if (abortSignal?.aborted) {
      throw new AbortedError("Diff process was aborted");
    }
  }
}

interface ArrayCharIndex {
  itemIndex: number,
  charIndex: number
}

async function getRevisionDiff(
    previousRevisionDiffs: RevisionDiff[],
    olderRev: Revision,
    newerRev: Revision,
    latestRev: Revision,
    isAsync: boolean): Promise<RevisionDiff[]> {
  let newBlameItems: RevisionDiff[] = [];

  const rawDiff = isAsync ?
    await diffCharsWebworkersAsync(olderRev.content, latestRev.content) :
    diffChars(olderRev.content, latestRev.content);

  const diff: RevisionDiff[] = rawDiff.map(d => ({
                      text: d.value,
                      type: d.added ? "add" : d.removed ? "remove" : "unchanged",
                      revision: null
                    }));

  let blameIndex = { itemIndex: 0, charIndex: 0 }
  let diffIndex = { itemIndex: 0, charIndex: 0 }
  
  while (blameIndex.itemIndex < previousRevisionDiffs.length || diffIndex.itemIndex < diff.length) {
    const blameItem = previousRevisionDiffs[blameIndex.itemIndex];
    const diffItem = diff[diffIndex.itemIndex];
    if (blameItem === undefined || blameItem.type === "unchanged") {
      if (diffItem.type === "remove") {
        newBlameItems.push({
          text: diffItem.text,
          type: "remove",
          revision: newerRev
        });
        diffIndex.charIndex = 0;
        diffIndex.itemIndex++;
        blameIndex = advanceIndex(blameIndex, previousRevisionDiffs, 0);
      }
      else {
        const textLength = Math.min(
          blameItem.text.length - blameIndex.charIndex,
          diffItem.text.length - diffIndex.charIndex);
        newBlameItems.push({
          text: blameItem.text.slice(blameIndex.charIndex, blameIndex.charIndex + textLength),
          type: diffItem.type,
          revision: diffItem.type === "add" ? newerRev : null
        });
        blameIndex = advanceIndex(blameIndex, previousRevisionDiffs, textLength);
        diffIndex = advanceIndex(diffIndex, diff, textLength);
      }
    }
    else {
      newBlameItems.push(blameItem);
      blameIndex = advanceIndex(blameIndex, previousRevisionDiffs, blameItem.text.length);
      diffIndex = advanceIndex(diffIndex, diff, blameItem.text.length);
    }
  }

  return newBlameItems;
}

function advanceIndex(oldIndex: ArrayCharIndex, array: RevisionDiff[], count: number): ArrayCharIndex {
  let itemIndex = oldIndex.itemIndex;
  let charIndex = oldIndex.charIndex;

  charIndex += count;

  while (itemIndex < array.length && (
          //array[itemIndex].type === "remove" ||
          charIndex >= array[itemIndex].text.length
        )) {
    if (array[itemIndex].type !== "remove") {
      charIndex -= array[itemIndex].text.length;
    }
    itemIndex++;
  }

  return { itemIndex, charIndex };
}*/