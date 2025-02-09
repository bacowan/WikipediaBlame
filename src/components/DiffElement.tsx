import RevisionDiff from "../structures/RevisionDiff";
import Revision from "../structures/Revision";
import "./DiffElement.css";

interface DiffElementProps {
    blameItem: RevisionDiff,
    isSelectedRevision: boolean,
    isHoveredRevision: boolean,
    setSelectedRevision: (revision: Revision | null) => void,
    setHoveredRevision: (revision: Revision | null) => void
}

function DiffElement({ blameItem, isSelectedRevision, isHoveredRevision, setSelectedRevision, setHoveredRevision }: DiffElementProps) {
    let text;
    if (blameItem.type === "remove") {
      text = "\u00A0\u00A0\u00A0";
    }
    else {
      text = blameItem.text;
    }

    function onClick() {
        setSelectedRevision(blameItem.revision);
    }

    function onMouseEnter() {
      setHoveredRevision(blameItem.revision);
    }

    function onMouseLeave() {
      setHoveredRevision(null);
    }

    return <span
            className={`blame-${blameItem.type} ${isSelectedRevision ? "selected" : ""} ${isHoveredRevision ? "hovered" : ""}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}>
        {text}
    </span>
}

export default DiffElement