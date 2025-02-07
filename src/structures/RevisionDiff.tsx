import Revision from "./Revision"

interface RevisionDiff {
    text: string,
    type: "add" | "remove" | "change" | "unchanged"
    revision: Revision | null
}
export default RevisionDiff