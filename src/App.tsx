import { useState, useMemo, useRef } from 'react'
import './App.css'
import RevisionDiff from './structures/RevisionDiff';
import DiffElement from './components/DiffElement';
import Revision from './structures/Revision';
import RevisionDetails from './components/RevisionDetails';
import SearchSection from './components/SearchSection';
import SearchProgressBar, { Progress } from './components/SearchProgressBar';
import { getRevisionDiffs } from './utils/GetRevisionDiffs';
import { getRevisionsForArticle } from './utils/WikipediaApiUtils';
import HelpPage from './components/HelpPage';
import Constants from './constants';
import { Clip } from './utils/NumberUtils';

interface ArticleSource {
  revisionDiffs: RevisionDiff[],
  oldestComparedRevId: number | null
  revsCompared: number
}

function App() {

  const [articleName, setArticleName] = useState("");
  const [articleSource, setArticleSource] = useState<ArticleSource>({revisionDiffs: [], revsCompared: 0, oldestComparedRevId: null});
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
  const [hoveredRevision, setHoveredRevision] = useState<Revision | null>(null);
  const [diffProgress, setDiffProgress] = useState<Progress | null>(null);
  const [latestRev, setLatestRev] = useState<Revision | null>(null);
  const [isHelpShown, setIsHelpShown] = useState(false);
  const [isAsync, setIsAsync] = useState(true);
  const [revsAtATime, setRevsAtATime] = useState(Constants.maxRevsAtATime);

  const abortController = useRef<AbortController>();

  if (abortController.current === null) {
    abortController.current = new AbortController();
  }

  function cancel() {
    if (abortController.current !== null) {
      abortController.current?.abort();
      setDiffProgress(null);
    }
  }

  const formattedBlames = useMemo(() => {
    return articleSource.revisionDiffs.map((b, i) => <DiffElement
      key={i}
      blameItem={b}
      isSelectedRevision={b.revision != null && selectedRevision != null && b.revision.id === selectedRevision.id}
      isHoveredRevision={b.revision != null && hoveredRevision != null && b.revision.id === hoveredRevision.id}
      setSelectedRevision={setSelectedRevision}
      setHoveredRevision={setHoveredRevision}/>)
  }, [articleSource, selectedRevision, hoveredRevision]);

  async function Blame(name: string) {
    if (abortController.current !== null) {
      abortController.current?.abort();
      abortController.current = new AbortController();

      setDiffProgress({state: 'indeterminate'});

      try {
        const revisions = await getRevisionsForArticle(
          name,
          articleSource.oldestComparedRevId,
          { isAsync, revsAtATime: Clip(revsAtATime, Constants.minRevsAtATime, Constants.maxRevsAtATime) },
          abortController.current.signal
        );

        if (!revisions.ok) {
          // TODO: Error handling
        }
        else {
          setLatestRev((r) => r === null ? revisions.value[0] : r);
          const revisionDiffsGenerator = getRevisionDiffs(latestRev, revisions.value, articleSource.revisionDiffs, isAsync, abortController.current.signal);
          for await (const diffProgress of revisionDiffsGenerator) {
            setDiffProgress({
              completed: diffProgress.completed,
              total: diffProgress.total,
              state: "determinate"
            });
            setArticleSource({
              revisionDiffs: diffProgress.revisionDiffs,
              oldestComparedRevId: diffProgress.comparedRevId,
              revsCompared: diffProgress.revsCompared
            });
          }
          setDiffProgress(null);
        }
      }
      catch (e) {
        // TODO
        alert(e);
      }
    }
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
