import RevisionDiff from "../structures/RevisionDiff";
import { BlankOk, Err, Result } from "../structures/Result";
import Revision from "../structures/Revision";
import { diffChars, diffCharsWebworkersAsync } from "./DiffUtils";
import AbortedError from "../errors/AbortedError";

export interface RevisionDiffProgress {
  completed: number,
  total: number,
  revisionDiffs: RevisionDiff[],
  revsCompared: number,
  comparedRevId: number
}

export async function* getRevisionDiffs(
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
}