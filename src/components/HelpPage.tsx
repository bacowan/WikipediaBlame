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
            hi
        </div>
    </div>
}

export default HelpPage;