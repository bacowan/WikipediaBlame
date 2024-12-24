import './SearchProgressBar.css';

interface IndeterminateProgress {
    state: "indeterminate"
}

interface DeterminateProgress {
    state: "determinate",
    completed: number,
    total: number,
}

export type Progress = IndeterminateProgress | DeterminateProgress;

interface SearchProgressBarParams {
    articleName: string,
    progress: Progress
}

function SearchProgressBar({articleName, progress}: SearchProgressBarParams) {
    let progressBar: JSX.Element;
    let labelText = `Diffing ${articleName}`;
    if (progress.state === "determinate") {
        labelText += ` (${progress.completed}/${progress.total})`;
        progressBar = <progress value={progress.completed} max={progress.total}/>
    }
    else {
        progressBar = <progress/>
    }
    return <>
        <label>{labelText} {progressBar}</label>
        <button className='cancel-button'>Cancel</button>
    </>
}

export default SearchProgressBar;