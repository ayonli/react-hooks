// @deno-types="npm:@types/react@18"
import { useEffect, useState } from "react"

export enum SubmitState {
    NOT_STARTED = 0,
    IN_PROGRESS = 1,
    COMPLETED = 2,
}

/**
 * This hook is used to submit data to a remote server and track the status of
 * the request. It returns an object containing the `submit` function to send
 * the data, the `state` to indicate whether the request is in progress or
 * completed, the `result` if available, and the `error` if occurred.
 * 
 * @param fn The request function, it should return a promise that resolves to
 * the result, or rejects with an error.
 * 
 * @example
 * ```tsx
 * import useSubmit from "./useSubmit.ts"
 * 
 * export default function MyForm() {
 *     const {
 *         submit,
 *         state,
 *         result,
 *         error,
 *     } = useSubmit(async (signal, data: FormData) => {
 *         const res = await fetch("/api/submit", {
 *             method: "POST",
 *             body: data,
 *             signal,
 *         })
 *         return await res.json()
 *     })
 * 
 *     if (state === 2) {
 *         if (error) {
 *             return <div>Error: {(error as Error).message}</div>
 *         } else {
 *             return <div>Result: {result}</div>
 *         }
 *     }
 * 
 *     return (
 *         <form action={submit}>
 *             <input type="text" name="name" disabled={state === 1} />
 *             <button type="submit" disabled={state === 1}>
 *                 {state === 1 ? "Submitting..." : "Submit"}
 *             </button>
 *         </form>
 *     )
 * }
 * ```
 */
export default function useSubmit<T, R, E extends unknown = unknown>(
    fn: (signal: AbortSignal, data: T) => Promise<R>
): {
    submit: (data: T) => void
    state: SubmitState
    result: R | undefined,
    error: E | undefined
    abort: (reason?: E) => void
} {
    const [data, setData] = useState<T | undefined>(undefined)
    const [state, setState] = useState({
        state: SubmitState.NOT_STARTED as SubmitState,
        result: undefined as R | undefined,
        error: undefined as E | undefined,
        abort: (reason: E | undefined = undefined) => void reason as void,
    })

    useEffect(() => {
        if (data === undefined || state.state !== SubmitState.NOT_STARTED) {
            return
        }

        const ctrl = new AbortController()
        const { signal } = ctrl

        setState({
            state: SubmitState.IN_PROGRESS,
            result: undefined,
            error: undefined,
            abort: (reason = undefined) => ctrl.abort(reason),
        })

        fn(signal, data as T).then(result => {
            setState(state => ({
                ...state,
                state: SubmitState.COMPLETED,
                result,
                error: undefined,
            }))
        }).catch(err => {
            setState(state => ({
                ...state,
                state: SubmitState.COMPLETED,
                result: undefined,
                error: err as E,
            }))
        })
    }, [data])

    return {
        submit: setData,
        ...state,
    }
}
