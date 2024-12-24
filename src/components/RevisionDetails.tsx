import Revision from "../structures/Revision";

interface RevisionDetailsProps {
    selectedRevision: Revision | null
}

function RevisionDetails({ selectedRevision } : RevisionDetailsProps) {
    if (selectedRevision === null) {
        return <p>Select a diff to view revision details</p>
    }
    else {
        return <p>
            Revision ID: <a href={`https://en.wikipedia.org/w/index.php?oldid=${selectedRevision.id}`}>{selectedRevision.id}</a><br/>
            Time: {selectedRevision.timestamp.toLocaleDateString()}<br/>
            User: {selectedRevision.user}<br/>
            Comment: {selectedRevision.comment}<br/>
        </p>
    }
}

export default RevisionDetails;