import Constants from "../constants";
import { Clip } from "../utils/NumberUtils";
import "./OptionsSection.css";

interface OptionsSectionParams {
    isAsync: boolean,
    revsAtATime: number,
    setIsAsync: React.Dispatch<React.SetStateAction<boolean>>,
    setRevsAtATime: React.Dispatch<React.SetStateAction<number>>
}

function OptionsSection({ isAsync, revsAtATime, setIsAsync, setRevsAtATime }: OptionsSectionParams) {

    function onBlur() {
        Clip(revsAtATime, Constants.minRevsAtATime, Constants.maxRevsAtATime);
    }

    return <div className="options-section">
        <label>
            Async: <input type="checkbox" checked={isAsync} onChange={() => setIsAsync(x => !x)}/>
        </label>
        <label>
            Revs at a time: <input type="number" min={Constants.minRevsAtATime} max={Constants.maxRevsAtATime} value={revsAtATime} onChange={e => setRevsAtATime(Number(e.target.value))} onBlur={onBlur}/>
        </label>
    </div>
}

export default OptionsSection;