import { PropsWithChildren, useState } from "react";
import "./Collapsable.css";

interface CollableProps {
    text: string,
    className?: string
}

function Collapsable({ text, className, children }: PropsWithChildren<CollableProps>) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const arrow = isCollapsed ? "▶" : "▼";

    function onClick() {
        setIsCollapsed(c => !c);
    }

    return <div className={`collapsable ${className}`}>
        <div onClick={onClick} className="collapsable-header">
            {text} {arrow}
        </div>
        {isCollapsed || children}
    </div>
}

export default Collapsable;