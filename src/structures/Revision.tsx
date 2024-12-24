interface Revision {
    id: number,
    content: string,
    timestamp: Date,
    user: string,
    comment: string
}
export default Revision;