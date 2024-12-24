import { useRef, useState } from "react"

export default function useAbortController()
        : [signal: AbortSignal, boolean, cancel: () => void, reset: () => void] {
    const abortController = useRef<AbortController>(); // for aborting promises
    const [isCancelled, setIsCancelled] = useState(false); // for render information
    if (abortController.current == null) {
        abortController.current = new AbortController();
    }
    const cancel = () => {
        abortController.current?.abort();
        setIsCancelled(true);
    };
    const reset = () => {
        abortController.current = new AbortController();
        setIsCancelled(false);
    };
    return [abortController.current?.signal as AbortSignal, isCancelled, cancel, reset];
}