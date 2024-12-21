import { useState } from 'react'
import './App.css'

function App() {

  const [articleName, setArticleName] = useState("");
  const [articleSource, setArticleSource] = useState("");

  async function Blame(name: string) {
    name = name.trim();
    name.replace(" ", "_");
    // TODO: loading spinner
    const url = "https://en.wikipedia.org/w/api.php?action=query&titles=" + encodeURI(name) + "&prop=revisions&rvprop=ids|content|timestamp|user|comment&rvlimit=50&format=json&origin=*";
    const response = await fetch(url);
    if (!response.ok) {
      // TODO: Error handling
    }
    else {
      const json = await response.json();
      const revisions = getRevisionsFromFetch(json);
      // TODO: Error handling
      setArticleSource(revisions[0]);
    }
  }

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
        <textarea readOnly className='main-left' value={articleSource}/>
        <div className='main-right'/>
      </div>
    </>
  )
}

function getRevisionsFromFetch(jsonObj: any) : string[] {
  const pages = jsonObj?.query?.pages;
  const pageId = Object.keys(pages)[0];
  return (pages[pageId].revisions as []).map(r => r["*"] as string);
}

export default App
