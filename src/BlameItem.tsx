import Revision from "./Revision"

interface BlameItem {
    text: string,
    type: "add" | "remove" | "change" | "unchanged"
    revision: Revision | null
}
export default BlameItem