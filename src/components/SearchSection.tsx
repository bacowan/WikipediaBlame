import { AttachNumberOrdinal } from "../utils/StringUtils";
import Collapsable from "./Collapsable";
import OptionsSection from "./OptionsSection";
import "./SearchSection.css";

interface SearchSectionParams {
    articleName: string,
    setArticleName: React.Dispatch<React.SetStateAction<string>>,
    onSearch: (searchVal: string) => void,
    revsCompared: number,
    isAsync: boolean,
    revsAtATime: number,
    setIsAsync: React.Dispatch<React.SetStateAction<boolean>>,
    setRevsAtATime: React.Dispatch<React.SetStateAction<number>>
}

function SearchSection({articleName, setArticleName, onSearch, revsCompared, isAsync, revsAtATime, setIsAsync, setRevsAtATime}: SearchSectionParams) {
    return <div className="search-column">
      <div className='search-row'>
        <label>
          Article Name: <input value={articleName} onChange={(e) => setArticleName(e.target.value)}/>
        </label>
        <button className='blame-button' onClick={() => onSearch(articleName)}>
          { revsCompared === 0 ? "Blame" : `Continue (from ${AttachNumberOrdinal(revsCompared)} rev)` }
        </button>
      </div>
      <div className="search-row">
        <Collapsable text="Advanced Options" className="options-collapsable">
          <OptionsSection isAsync={isAsync} revsAtATime={revsAtATime} setIsAsync={setIsAsync} setRevsAtATime={setRevsAtATime}/>
        </Collapsable>
      </div>
    </div>
}

export default SearchSection;