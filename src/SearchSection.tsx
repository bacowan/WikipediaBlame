interface SearchSectionParams {
    articleName: string,
    setArticleName: React.Dispatch<React.SetStateAction<string>>,
    onSearch: (searchVal: string) => void
}

function SearchSection({articleName, setArticleName, onSearch}: SearchSectionParams) {
    return <>
        <label>
          Article Name: <input value={articleName} onChange={(e) => setArticleName(e.target.value)}/>
        </label>
        <button className='blame-button' onClick={() => onSearch(articleName)}>
          Blame
        </button>
    </>
}

export default SearchSection;