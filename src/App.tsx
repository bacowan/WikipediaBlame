import { useState, useMemo } from 'react'
import './App.css'
import BlameItem from './structures/BlameItem';
import DiffElement from './components/DiffElement';
import Revision from './structures/Revision';
import RevisionDetails from './components/RevisionDetails';
import SearchSection from './components/SearchSection';
import SearchProgressBar, { Progress } from './components/SearchProgressBar';
import { getBlameItems } from './utils/Blame';
import { getRevisionsForArticle } from './utils/WikipediaApiUtils';

interface ArticleSource {
  blameItems: BlameItem[],
  oldestComparedRevId: number | null
}

function App() {

  const [articleName, setArticleName] = useState("");
  const [articleSource, setArticleSource] = useState<ArticleSource>({blameItems: [], oldestComparedRevId: null});
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
  const [hoveredRevision, setHoveredRevision] = useState<Revision | null>(null);
  const [diffProgress, setDiffProgress] = useState<Progress | null>(null);
  const [latestRev, setLatestRev] = useState<Revision | null>(null);

  async function Blame(name: string) {
    setDiffProgress({state: "indeterminate"})
    const revisions = await getRevisionsForArticle(name, articleSource.oldestComparedRevId);

    if (!revisions.ok) {
      // TODO: Error handling
    }
    else {
      setLatestRev((r) => r === null ? revisions.value[0] : r);
      await getBlameItems(latestRev, revisions.value, (completed, total, blames, oldestComparedRevId) => {
        setDiffProgress({completed, total, state: "determinate"});
        setArticleSource({
          blameItems: blames,
          oldestComparedRevId
        });
      });
    }
  }

  const formattedBlames = useMemo(() => {
    return articleSource.blameItems.map((b, i) => <DiffElement
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
        {diffProgress === null ?
          <SearchSection articleName={articleName} setArticleName={setArticleName} onSearch={Blame}/> :
          <SearchProgressBar articleName={articleName} progress={diffProgress}/>
        }
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

export default App
