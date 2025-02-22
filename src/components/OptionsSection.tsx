import Constants from "../constants";
import { Clip } from "../utils/NumberUtils";
import "./OptionsSection.css";

interface OptionsSectionParams {
    revsAtATime: number,
    setRevsAtATime: React.Dispatch<React.SetStateAction<number>>
}

function OptionsSection({ revsAtATime, setRevsAtATime }: OptionsSectionParams) {

    function onBlur() {
        Clip(revsAtATime, Constants.minRevsAtATime, Constants.maxRevsAtATime);
    }

    return <div className="options-section">
        <label>
            Revs at a time: <input type="number" min={Constants.minRevsAtATime} max={Constants.maxRevsAtATime} value={revsAtATime} onChange={e => setRevsAtATime(Number(e.target.value))} onBlur={onBlur}/>
        </label>
    </div>
}

export default OptionsSection;