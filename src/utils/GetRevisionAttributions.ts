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
  let newAttributions: TextAttributions;
  if (!existingAttributions || existingAttributions.attributions.length === 0) {
    newAttributions = {
      latestText: revisions[0].content,
      attributions: Array.from(revisions[0].content, c => ({ char: c, revision: null })),
      lastComparedRevision: revisions[0]
    };
    firstRevToCompare = 1;
  }
  else {
    newAttributions = {
      latestText: existingAttributions.latestText,
      attributions: Array.from(existingAttributions.attributions),
      lastComparedRevision: existingAttributions.lastComparedRevision
    }; // copy attributions since we will be yielding copys of it later
    firstRevToCompare = 0;
  }

  let completedCount = 0;
  yield {
    completed: 0,
    total: revisions.length - firstRevToCompare,
    attributions: newAttributions
  }

  for (let revision of revisions.slice(firstRevToCompare)) {
    newAttributions = {
      latestText: newAttributions.latestText,
      attributions: Array.from(newAttributions.attributions),
      lastComparedRevision: newAttributions.lastComparedRevision
    }; // copy attributions since we will be yielding copys of it later
    const diff = isAsync
      ? await diffCharsWebworkersAsync(revision.content, newAttributions.latestText)
      : diffChars(revision.content, newAttributions.latestText);
    const charDiffs = diff
      .flatMap(d => Array.from(d.value).map(char => ({ char, added: d.added, removed: d.removed })))
      .filter(d => !d.removed);
    for (let i = 0; i < charDiffs.length; i++) {
      if (newAttributions.attributions[i].revision === null && charDiffs[i].added) {
        newAttributions.attributions[i].revision = newAttributions.lastComparedRevision;
      }
    }
    newAttributions.lastComparedRevision = revision;
    
    if (abortSignal?.aborted) {
      throw new AbortedError("Diff process was aborted");
    }

    yield {
      completed: ++completedCount,
      total: revisions.length - firstRevToCompare,
      attributions: newAttributions
    }
  }
}