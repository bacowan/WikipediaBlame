import { PropsWithChildren } from "react";
import "./TooltipText.css";

interface TooltipTextProps {
    tooltip: JSX.Element
}

function TooltipText({ tooltip, children }: PropsWithChildren<TooltipTextProps>) {
    return children;
}

export default TooltipText;