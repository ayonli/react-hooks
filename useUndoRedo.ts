import { useCallback, useRef, useState } from "react"

/**
 * This hook returns an object containing a `state` and a `setState` functions,
 * along with an `undo`, `redo`, and `clear` function to manage undo and redo
 * functionality for the state.
 */
export function useUndoRedo<T>(initial: T): {
    state: T
    setState: React.Dispatch<React.SetStateAction<T>>
    undo: () => void
    redo: () => void
    clear: () => void
} {
    const [state, setState] = useState(initial)
    const [history, setHistory] = useState([initial])
    const index = useRef(0)

    return {
        state,
        setState: useCallback((newState) => {
            if (typeof newState === "function") {
                newState = (newState as (prev: T) => T)(state)
            }

            let _history = history
            if (index.current < _history.length - 1) {
                _history = _history.slice(0, index.current + 1)
            }

            index.current++
            setState(newState)
            setHistory([..._history, newState])
        }, [state, history, setState, setHistory]),
        undo: useCallback(() => {
            if (index.current > 0) {
                index.current--
                setState(history[index.current])
            }
        }, [history, setState]),
        redo: useCallback(() => {
            if (index.current < history.length - 1) {
                index.current++
                setState(history[index.current])
            }
        }, [history, setState]),
        clear: useCallback(() => {
            index.current = 0
            setState(initial)
            setHistory([initial])
        }, [initial, setState, setHistory]),
    }
}
