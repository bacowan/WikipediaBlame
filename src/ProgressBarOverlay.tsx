import './ProgressBarOverlay.css'

interface IndeterminateProgress {
    state: "indeterminate"
}

interface DeterminateProgress {
    state: "determinate",
    completed: number,
    total: number,
}

export type Progress = IndeterminateProgress | DeterminateProgress;

interface ProgressBarOverlayParams {
    progress: Progress
}

function ProgressBarOverlay({ progress }: ProgressBarOverlayParams) {
    let bar: JSX.Element;
    let labelText: string;
    if (progress.state === "determinate") {
        bar = <progress max={progress.total} value={progress.completed}/>
        labelText = `Diffing Items (${progress.completed}/${progress.total})`
    }
    else {
        bar = <progress/>
        labelText='Diffing Items'
    }
    return <div className="progress-bar-overlay">
        <label>{labelText}<br/>
            {bar}
        </label>
        <button>Cancel</button>
    </div>
}

export default ProgressBarOverlay;