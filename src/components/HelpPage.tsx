import { useRef } from "react";
import "./HelpPage.css";

interface HelpPageParams {
    close: () => void
}

function HelpPage({ close }: HelpPageParams) {
    const contentRef = useRef<HTMLDivElement>(null);

    function modalClicked(e: React.MouseEvent<HTMLDivElement>) {
        if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
            close();
        }
    }

    return <div className="modal" onClick={modalClicked}>
        <div ref={contentRef}>
            This tool determines what revisions were responsible for any given piece of text in a wikipedia
            article. To use, type in the name of the article and click "Blame". The tool will check revision
            by revision for changes. Click on green highlighted text to see details of the revision.
            <br/>
            This tool is very much a work in progress, so feel free to <a href="https://github.com/bacowan/WikipediaBlame">fork me on github!</a>
        </div>
    </div>
}

export default HelpPage;