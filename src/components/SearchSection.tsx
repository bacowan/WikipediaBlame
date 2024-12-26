import { AttachNumberOrdinal } from "../utils/StringUtils";
import "./SearchSection.css";

interface SearchSectionParams {
    articleName: string,
    setArticleName: React.Dispatch<React.SetStateAction<string>>,
    onSearch: (searchVal: string) => void,
    revsCompared: number
}

function SearchSection({articleName, setArticleName, onSearch, revsCompared}: SearchSectionParams) {
    return <>
        <label>
          Article Name: <input value={articleName} onChange={(e) => setArticleName(e.target.value)}/>
        </label>
        <button className='blame-button' onClick={() => onSearch(articleName)}>
          { revsCompared === 0 ? "Blame" : `Continue (from ${AttachNumberOrdinal(revsCompared)} rev)` }
        </button>
    </>
}

export default SearchSection;