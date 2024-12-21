import BlameItem from "./BlameItem";
import "./DiffElement.css";
import Revision from "./Revision";

interface DiffElementProps {
    blameItem: BlameItem,
    isSelectedRevision: boolean,
    setSelectedRevision: (revision: Revision | null) => void,
}

function DiffElement({ blameItem, isSelectedRevision, setSelectedRevision }: DiffElementProps) {
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

    return <span
            className={`blame-${blameItem.type} ${isSelectedRevision ? "selected" : ""}`}
            onClick={onClick}>
        {text}
    </span>
}

export default DiffElement