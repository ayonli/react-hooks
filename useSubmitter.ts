import { useEffect, useState } from "react"

/**
 * This hook is used to submit data to a remote server and track the status of
 * the request. It returns an object containing the `submit` function to send
 * the data, the `pending` state to indicate whether the request is in progress,
 * the `result` if available, and the `error` if occurred.
 * 
 * @param fn The request function, it should return a promise that resolves to
 * the result, or rejects with an error.
 * 
 * @example
 * ```tsx
 * import useSubmitter from "./useSubmitter.ts"
 * 
 * export default function MyForm() {
 *     const {
 *         submit,
 *         pending,
 *         result,
 *         error,
 *     } = useSubmitter(async (signal, data: FormData) => {
 *         const res = await fetch("/api/submit", {
 *             method: "POST",
 *             body: data,
 *             signal,
 *         })
 *         return await res.json()
 *     })
 * 
 *     return (
 *         <form onSubmit={e => {
 *            e.preventDefault()
 *            submit(new FormData(e.target))
 *         }}>
 *             <input type="text" name="name" disabled={pending} />
 *             <button type="submit" disabled={pending}>Submit</button>
 *             {pending ? <div>Pending...</div> : null}
 *             {result ? <div>Result: {result}</div> : null}
 *             {error ? <div>Error: {(error as Error).message}</div> : null}
 *         </form>
 *     )
 * }
 * ```
 */
export default function useSubmitter<T, R, E extends unknown = unknown>(
    fn: (signal: AbortSignal, data: T) => Promise<R>
): {
    submit: (data: T) => void
    pending: boolean
    result: R | undefined,
    error: E | undefined
    abort: (reason?: E) => void
} {
    const [data, setData] = useState<T | undefined>(undefined)
    const [state, setState] = useState({
        pending: false,
        result: undefined as R | undefined,
        error: undefined as E | undefined,
        abort: (reason: E | undefined = undefined) => void reason as void,
    })

    useEffect(() => {
        if (data === undefined || state.pending) {
            return
        }

        const ctrl = new AbortController()
        const { signal } = ctrl

        setState({
            pending: true,
            abort: (reason = undefined) => ctrl.abort(reason),
            result: undefined,
            error: undefined,
        })

        fn(signal, data as T).then(result => {
            setState(state => ({
                ...state,
                pending: false,
                result,
                error: undefined,
            }))
        }).catch(err => {
            setState(state => ({
                ...state,
                pending: false,
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
