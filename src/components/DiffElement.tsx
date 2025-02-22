import RevisionDiff from "../structures/RevisionDiff";
import Revision from "../structures/Revision";
import "./DiffElement.css";
import { TextAttribution } from "../utils/GetRevisionAttributions";

interface DiffElementProps {
    attribution: TextAttribution,
    isSelectedRevision: boolean,
    isHoveredRevision: boolean,
    setSelectedRevision: (revision: Revision | null) => void,
    setHoveredRevision: (revision: Revision | null) => void
}

function DiffElement({ attribution, isSelectedRevision, isHoveredRevision, setSelectedRevision, setHoveredRevision }: DiffElementProps) {
    function onClick() {
        setSelectedRevision(attribution.revision);
    }

    function onMouseEnter() {
      setHoveredRevision(attribution.revision);
    }

    function onMouseLeave() {
      setHoveredRevision(null);
    }

    return <span
            className={`blame-${attribution.revision === null ? "add" : "unchanged"} ${isSelectedRevision ? "selected" : ""} ${isHoveredRevision ? "hovered" : ""}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}>
        {attribution.char}
    </span>
}

export default DiffElement