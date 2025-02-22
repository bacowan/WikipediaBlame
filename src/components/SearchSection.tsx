import Revision from "../structures/Revision";
import { AttachNumberOrdinal } from "../utils/StringUtils";
import Collapsable from "./Collapsable";
import OptionsSection from "./OptionsSection";
import "./SearchSection.css";

interface SearchSectionParams {
    articleName: string,
    displayedArticleName: string,
    setArticleName: React.Dispatch<React.SetStateAction<string>>,
    onSearch: (searchVal: string) => void,
    isAsync: boolean,
    revsAtATime: number,
    lastComparedRevision: Revision | null,
    setIsAsync: React.Dispatch<React.SetStateAction<boolean>>,
    setRevsAtATime: React.Dispatch<React.SetStateAction<number>>
}

function SearchSection({articleName, displayedArticleName, setArticleName, onSearch, isAsync, revsAtATime, lastComparedRevision, setIsAsync, setRevsAtATime}: SearchSectionParams) {
    return <div className="search-column">
      <div className='search-row'>
        <label>
          Article Name: <input value={articleName} onChange={(e) => setArticleName(e.target.value)}/>
        </label>
        <button className='blame-button' onClick={() => onSearch(articleName)}>
          {
            lastComparedRevision === null || displayedArticleName !== articleName
              ? "Blame"
              : "Continue from revision " + lastComparedRevision.id }
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