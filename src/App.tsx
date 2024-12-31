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
import useCancellationToken from './utils/UseAbortController';
import HelpPage from './components/HelpPage';
import Constants from './constants';
import { Clip } from './utils/NumberUtils';

interface ArticleSource {
  blameItems: BlameItem[],
  oldestComparedRevId: number | null
  revsCompared: number
}

function App() {

  const [articleName, setArticleName] = useState("");
  const [articleSource, setArticleSource] = useState<ArticleSource>({blameItems: [], revsCompared: 0, oldestComparedRevId: null});
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
  const [hoveredRevision, setHoveredRevision] = useState<Revision | null>(null);
  const [diffProgress, setDiffProgress] = useState<Progress | null>(null);
  const [latestRev, setLatestRev] = useState<Revision | null>(null);
  const [abortSignal, isCancelled, cancel, resetAbort] = useCancellationToken();
  const [isHelpShown, setIsHelpShown] = useState(false);
  const [isAsync, setIsAsync] = useState(false);
  const [revsAtATime, setRevsAtATime] = useState(Constants.maxRevsAtATime);

  const formattedBlames = useMemo(() => {
    return articleSource.blameItems.map((b, i) => <DiffElement
      key={i}
      blameItem={b}
      isSelectedRevision={b.revision != null && selectedRevision != null && b.revision.id === selectedRevision.id}
      isHoveredRevision={b.revision != null && hoveredRevision != null && b.revision.id === hoveredRevision.id}
      setSelectedRevision={setSelectedRevision}
      setHoveredRevision={setHoveredRevision}/>)
  }, [articleSource, selectedRevision, hoveredRevision]);

  function reset() {
    resetAbort();
    setDiffProgress(null);
  }

  async function Blame(name: string) {
    setDiffProgress({state: "indeterminate"})
    const revisions = await getRevisionsForArticle(
      name,
      articleSource.oldestComparedRevId,
      { isAsync, revsAtATime: Clip(revsAtATime, Constants.minRevsAtATime, Constants.maxRevsAtATime) },
      abortSignal
    );

    if (!abortSignal.aborted) {
      if (!revisions.ok) {
        // TODO: Error handling
      }
      else {
        setLatestRev((r) => r === null ? revisions.value[0] : r);
        await getBlameItems(latestRev, revisions.value, articleSource.blameItems, (completed, total, blames, revsCompared, oldestComparedRevId) => {
          setDiffProgress({completed, total, state: "determinate"});
          setArticleSource({
            blameItems: blames,
            oldestComparedRevId,
            revsCompared
          });
        }, isAsync, abortSignal);
      }
    }

    reset();
  }

  function showHelp() {
    setIsHelpShown(true);
  }

  return (
    <>
      <h1>Wikipedia Blame <span className='help-icon' onClick={showHelp}>ℹ️</span></h1>
      {diffProgress === null ?
        <SearchSection
          articleName={articleName}
          setArticleName={setArticleName}
          onSearch={Blame}
          revsCompared={articleSource.revsCompared}
          isAsync={isAsync}
          revsAtATime={revsAtATime}
          setIsAsync={setIsAsync}
          setRevsAtATime={setRevsAtATime}/> :
        isCancelled ?
          <label>Cancelling... <progress/></label> :
          <SearchProgressBar articleName={articleName} progress={diffProgress} onCancel={cancel}/>
      }
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
      { isHelpShown && <HelpPage close={() => setIsHelpShown(false)}/> }
    </>
  )
}

export default App
