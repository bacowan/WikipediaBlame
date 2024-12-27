import "./OptionsSection.css";

function OptionsSection() {
    return <div className="options-section">
        <label>
            Async: <input type="checkbox"/>
        </label>
        <label>
            Revs at a time: <input type="number"/>
        </label>
    </div>
}

export default OptionsSection;