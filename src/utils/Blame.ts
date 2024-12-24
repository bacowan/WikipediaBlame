import BlameItem from "../structures/BlameItem";
import Revision from "../structures/Revision";
import { diffCharsAsync } from "./DiffUtils";

export async function getBlameItems(
    revisions: Revision[],
    postUpdate: (completed: number, total: number, blameItems: BlameItem[]) => void)
    : Promise<void> {
  const latestRev = revisions[0];
  let blameItems: BlameItem[] = [{
    text: revisions[0].content,
    revision: revisions[0],
    type: "unchanged"
  }];
  postUpdate(0, revisions.length - 1, blameItems);

  for (let i = 1; i < revisions.length; i++) {
    const olderRev = revisions[i];
    const newerRev = revisions[i - 1];
    blameItems = await getBlameItem(blameItems, olderRev, newerRev, latestRev);
    postUpdate(i, revisions.length - 1, blameItems);
  }
}

interface ArrayCharIndex {
  itemIndex: number,
  charIndex: number
}

async function getBlameItem(blameItems: BlameItem[], olderRev: Revision, newerRev: Revision, latestRev: Revision): Promise<BlameItem[]> {
  let newBlameItems: BlameItem[] = [];
  const diff: BlameItem[] = (await diffCharsAsync(olderRev.content, latestRev.content))
                    .map(d => ({
                      text: d.value,
                      type: d.added ? "add" : d.removed ? "remove" : "unchanged",
                      revision: null
                    }));

  let blameIndex = { itemIndex: 0, charIndex: 0 }
  let diffIndex = { itemIndex: 0, charIndex: 0 }
  
  while (blameIndex.itemIndex < blameItems.length) {
    const blameItem = blameItems[blameIndex.itemIndex];
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
        blameIndex = advanceIndex(blameIndex, blameItems, textLength);
        diffIndex = advanceIndex(diffIndex, diff, textLength);
      }
    }
    else {
      newBlameItems.push(blameItem);
      blameIndex = advanceIndex(blameIndex, blameItems, blameItem.text.length);
      diffIndex = advanceIndex(diffIndex, diff, blameItem.text.length);
    }
  }

  return newBlameItems;
}

function advanceIndex(oldIndex: ArrayCharIndex, array: BlameItem[], count: number): ArrayCharIndex {
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