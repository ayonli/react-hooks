// @deno-types="npm:@types/react@18"
import { type Dispatch, type SetStateAction, useCallback, useRef, useState } from "react"

/**
 * Contains the actions that can be performed on the state history, returned by
 * the {@link useRevertibleState} hook.
 */
export interface RevertActions {
    /**
     * Reverts to the previous state.
     */
    undo: () => void
    /**
     * Reverts to the next state that was previously undone by `undo`.
     */
    redo: () => void
    /**
     * Clears the history and sets the state to the initial state.
     */
    clear: () => void
}

/**
 * This hook adds additional functions to the `useState` hook, allowing us to
 * undo and redo state changes.
 * 
 * ```tsx
 * import { useRevertibleState } from "@ayonli/react-hooks"
 * 
 * export default function MyComponent() {
 *     const [text, setText, { undo, redo }] = useRevertibleState("")
 * 
 *     return (
 *         <div>
 *             <input value={text} onChange={e => setText(e.target.value)} />
 *             <button onClick={undo}>Undo</button>
 *             <button onClick={redo}>Redo</button>
 *         </div>
 *     )
 * }
 * ```
 */
export default function useRevertibleState<T>(initial: T): [T, Dispatch<SetStateAction<T>>, RevertActions] {
    const [state, setState] = useState(initial)
    const [history, setHistory] = useState([initial])
    const index = useRef(0)

    return [
        state,
        useCallback((newState) => {
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
        {
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
        }]
}
