import { useState, useMemo } from 'react'
import './App.css'
import { Err, Ok, Result } from './Result';
import * as Diff from 'diff';
import BlameItem from './BlameItem';
import DiffElement from './DiffElement';
import Revision from './Revision';
import RevisionDetails from './RevisionDetails';

function App() {

  const [articleName, setArticleName] = useState("");
  const [articleSource, setArticleSource] = useState<BlameItem[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
  const [hoveredRevision, setHoveredRevision] = useState<Revision | null>(null);

  async function Blame(name: string) {
    const revisions = await getRevisionsForArticle(name);

    if (!revisions.ok) {
      // TODO: Error handling
    }
    else {
      const blames = getBlameItems(revisions.value);
      setArticleSource(blames);
    }
  }

  const formattedBlames = useMemo(() => {
    return articleSource.map((b, i) => <DiffElement
      key={i}
      blameItem={b}
      isSelectedRevision={b.revision != null && selectedRevision != null && b.revision.id === selectedRevision.id}
      isHoveredRevision={b.revision != null && hoveredRevision != null && b.revision.id === hoveredRevision.id}
      setSelectedRevision={setSelectedRevision}
      setHoveredRevision={setHoveredRevision}/>)
  }, [articleSource, selectedRevision, hoveredRevision]);

  return (
    <>
      <h1>Wikipedia Blame</h1>
      <div className='search-area'>
        <label>
          Article Name: <input value={articleName} onChange={(e) => setArticleName(e.target.value)}/>
        </label>
        <button className='blame-button' onClick={() => Blame(articleName)}>
          Blame
        </button>
      </div>
      <div className='rev-area'>
        <div className='main-left'>
          <p className='diff-text'>
            {formattedBlames}
          </p>
        </div>
        <div className='main-right'>
          <RevisionDetails selectedRevision={selectedRevision}/>
        </div>
      </div>
    </>
  )
}

function getBlameItems(revisions: Revision[]): BlameItem[] {
  const latestRev = revisions[0];
  let blameItems: BlameItem[] = [{
    text: revisions[0].content,
    revision: revisions[0],
    type: "unchanged"
  }]

  for (let i = 1; i < revisions.length; i++) {
    const olderRev = revisions[i];
    const newerRev = revisions[i - 1];
    blameItems = getBlameItem(blameItems, olderRev, newerRev, latestRev);
  }

  return blameItems;
}

/*function getLatestBlameItems(oldRev: Revision, newRev: Revision): BlameItem[] {
  const diff = Diff.diffChars(oldRev.content, newRev.content);
  return diff.map(d => ({
    text: d.value,
    type: d.added ? "add" : d.removed ? "remove" : "unchanged",
    revision: d.added || d.removed ? newRev : null
  }));
}*/

interface ArrayCharIndex {
  itemIndex: number,
  charIndex: number
}

function getBlameItem(blameItems: BlameItem[], olderRev: Revision, newerRev: Revision, latestRev: Revision): BlameItem[] {
  let newBlameItems: BlameItem[] = [];
  const diff: BlameItem[] = Diff.diffChars(olderRev.content, latestRev.content) // TODO: call with callback for async
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

  try {
  while (itemIndex < array.length && (
          array[itemIndex].type === "remove" ||
          charIndex >= array[itemIndex].text.length
        )) {
    if (array[itemIndex].type !== "remove") {
      charIndex -= array[itemIndex].text.length;
    }
    itemIndex++;
  }
    
}
catch (e) {
  console.log(e);
}

  return { itemIndex, charIndex };
}

async function getRevisionsForArticle(articleName: string) : Promise<Result<Revision[], string>> {
  articleName = articleName.trim();
  // TODO: loading spinner

  const url = "https://en.wikipedia.org/w/api.php?action=query&titles=" + encodeURI(articleName) + "&prop=revisions&rvprop=ids|content|timestamp|user|comment&rvlimit=50&format=json&origin=*";
  const response = await fetch(url);
  if (!response.ok) {
    return Err<string>("failed to fetch");
    // TODO: Error handling
  }
  else {
    const json = await response.json();
    const revisions = getRevisionsFromFetch(json);
    // TODO: Error handling
    return(Ok<Revision[]>(revisions));
  }
}

function getRevisionsFromFetch(jsonObj: any) : Revision[] {
  const pages = jsonObj?.query?.pages;
  const pageId = Object.keys(pages)[0];
  return (pages[pageId].revisions as any[]).map(r => ({
    id: r["revid"] as number,
    content: r["*"] as string,
    timestamp: new Date(r["timestamp"]),
    user: r["user"] as string,
    comment: r["comment"] as string
  }));
}

export default App
