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

  async function Blame(name: string) {
    const revisions = await getRevisionsForArticle(name);

    if (!revisions.ok) {
      // TODO: Error handling
    }
    else {
      const blames = getBlameItems(revisions.value[1], revisions.value[0]);
      setArticleSource(blames);
    }
  }

  const formattedBlames = useMemo(() => {
    return articleSource.map((b, i) => <DiffElement
      key={i}
      blameItem={b}
      isSelectedRevision={b.revision != null && selectedRevision != null && b.revision.id === selectedRevision.id}
      setSelectedRevision={setSelectedRevision}/>)
  }, [articleSource, selectedRevision]);

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

function getBlameItems(oldRev: Revision, newRev: Revision): BlameItem[] {
  const diff = Diff.diffChars(oldRev.content, newRev.content);
  return diff.map(d => ({
    text: d.value,
    type: d.added ? "add" : d.removed ? "remove" : "unchanged",
    revision: d.added || d.removed ? newRev : null
  }));
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
