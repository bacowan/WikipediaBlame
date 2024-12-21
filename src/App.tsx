import { useState, useMemo } from 'react'
import './App.css'
import { Err, Ok, Result } from './Result';
import * as Diff from 'diff';
import BlameItem from './BlameItem';

function App() {

  const [articleName, setArticleName] = useState("");
  const [articleSource, setArticleSource] = useState<BlameItem[]>([]);

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
    return articleSource.map((b, i) => {
      let text;
      if (b.type === "remove") {
        text = "\u00A0\u00A0\u00A0";
      }
      else {
        text = b.text;
      }
      return <span key={i} className={'blame-' + b.type}>{text}</span>
    })
  }, [articleSource]);

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
        <div className='main-right'/>
      </div>
    </>
  )
}

function getBlameItems(oldRev: string, newRev: string): BlameItem[] {
  const diff = Diff.diffChars(oldRev, newRev);
  return diff.map(d => ({
    text: d.value,
    type: d.added ? "add" : d.removed ? "remove" : "unchanged"
  }));
}

async function getRevisionsForArticle(articleName: string) : Promise<Result<string[], string>> {
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
    return(Ok<string[]>(revisions));
  }
}

function getRevisionsFromFetch(jsonObj: any) : string[] {
  const pages = jsonObj?.query?.pages;
  const pageId = Object.keys(pages)[0];
  return (pages[pageId].revisions as []).map(r => r["*"] as string);
}

export default App
