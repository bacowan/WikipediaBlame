import RevisionDiff from "../structures/RevisionDiff";
import { BlankOk, Err, Result } from "../structures/Result";
import Revision from "../structures/Revision";
import { diffCharsAsync, diffCharsWebworkersAsync } from "./DiffUtils";

export async function getRevisionDiffs(
    latestRev: Revision | null,
    revsToDiff: Revision[],
    previousRevisionDiffs: RevisionDiff[],
    postUpdate: (completed: number, total: number, revisionDiffs: RevisionDiff[], revsCompared: number, comparedRevId: number) => void,
    isAsync: boolean,
    abortSignal: AbortSignal) : Promise<Result<void, string>> {

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

  postUpdate(0, revsToDiff.length - 1, previousRevisionDiffs, 1, revsToDiff[0].id);

  try {
    for (let i = 1; i < revsToDiff.length; i++) {
      const olderRev = revsToDiff[i];
      const newerRev = revsToDiff[i - 1];
      previousRevisionDiffs = await getRevisionDiff(previousRevisionDiffs, olderRev, newerRev, latestRev, isAsync);
      postUpdate(i, revsToDiff.length - 1, previousRevisionDiffs, i + 1, revsToDiff[i].id);
      if (abortSignal.aborted) {
        return Err<string>("aborted");
      }
    }
  } catch (e) {
    return Err<string>("Error while diffing");
  }

  return BlankOk();
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
    await diffCharsAsync(olderRev.content, latestRev.content) :
    await diffCharsWebworkersAsync(olderRev.content, latestRev.content);

  const diff: RevisionDiff[] = rawDiff.map(d => ({
                      text: d.value,
                      type: d.added ? "add" : d.removed ? "remove" : "unchanged",
                      revision: null
                    }));

  let blameIndex = { itemIndex: 0, charIndex: 0 }
  let diffIndex = { itemIndex: 0, charIndex: 0 }
  
  while (blameIndex.itemIndex < previousRevisionDiffs.length) {
    const blameItem = previousRevisionDiffs[blameIndex.itemIndex];
    const diffItem = diff[diffIndex.itemIndex];
    if (blameItem.type === "unchanged") {
      if (diffItem.type === "remove") {
        newBlameItems.push({
          text: "",
          type: "remove",
          revision: newerRev
        });
        diffIndex.charIndex = 0;
        diffIndex.itemIndex++;
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
          array[itemIndex].type === "remove" ||
          charIndex >= array[itemIndex].text.length
        )) {
    if (array[itemIndex].type !== "remove") {
      charIndex -= array[itemIndex].text.length;
    }
    itemIndex++;
  }

  return { itemIndex, charIndex };
}