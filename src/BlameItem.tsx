interface BlameItem {
    text: string,
    type: "add" | "remove" | "change" | "unchanged"
}
export default BlameItem