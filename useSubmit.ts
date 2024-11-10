// @deno-types="npm:@types/react@18"
import { useEffect, useState } from "react"

/**
 * Represents the state of an asynchronous submission request, returned by the
 * {@link useSubmit} hook.
 */
export interface SubmitState<T, R, E> {
    /**
     * Submits the data to the server.
     */
    submit: (data: T) => void
    /**
     * Whether the request is in progress.
     */
    pending: boolean
    /**
     * Whether the request has completed.
     */
    done: boolean
    /**
     * The result of the request, if available.
     */
    result: R | undefined,
    /**
     * The error occurred during the request, if any.
     */
    error: E | undefined
    /**
     * Aborts the request manually.
     */
    abort: (reason?: E) => void
}

/**
 * This hook is used to submit data to a remote server and track the status of
 * the request.
 * 
 * @param fn The request function, it should return a promise that resolves to
 * the result, or rejects with an error.
 * @param deps The dependencies that will renew the submit function and state
 * when changed.
 * 
 * @example
 * ```tsx
 * import { useSubmit } from "@ayonli/react-hooks"
 * 
 * export default function MyForm() {
 *     const {
 *         submit,
 *         pending,
 *         done,
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
 *     if (done) {
 *         if (error) {
 *             return <div>Error: {(error as Error).message}</div>
 *         } else {
 *             return <div>Result: {result}</div>
 *         }
 *     }
 * 
 *     return (
 *         <form onSubmit={e => {
 *             e.preventDefault();
 *             submit(new FormData(e.target as HTMLFormElement));
 *         }}>
 *             <input type="text" name="name" disabled={pending} />
 *             <button type="submit" disabled={pending}>
 *                 {pending ? "Submitting..." : "Submit"}
 *             </button>
 *         </form>
 *     )
 * }
 * ```
 */
export default function useSubmit<T, R, E extends unknown = unknown>(
    fn: (signal: AbortSignal, data: T) => Promise<R>,
    deps: readonly unknown[] = [] as unknown[]
): SubmitState<T, R, E> {
    const [data, setData] = useState<T | undefined>(undefined)
    const [state, setState] = useState({
        pending: false,
        done: false,
        result: undefined as R | undefined,
        error: undefined as E | undefined,
        abort: (reason: E | undefined = undefined) => void reason as void,
    })

    useEffect(() => {
        setData(undefined)
        setState({
            pending: false,
            done: false,
            result: undefined,
            error: undefined,
            abort: (reason = undefined) => void reason as void,
        })
    }, deps)

    useEffect(() => {
        if (data === undefined || state.pending || state.done) {
            return
        }

        const ctrl = new AbortController()
        const { signal } = ctrl

        setState({
            pending: true,
            done: false,
            result: undefined,
            error: undefined,
            abort: (reason = undefined) => ctrl.abort(reason),
        })

        fn(signal, data as T).then(result => {
            setState({
                pending: false,
                done: true,
                result,
                error: undefined,
                abort: (reason = undefined) => void reason as void,
            })
        }).catch(err => {
            setState({
                pending: false,
                done: true,
                result: undefined,
                error: err as E,
                abort: (reason = undefined) => void reason as void,
            })
        })

        return () => {
            ctrl.abort()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data])

    return {
        submit: setData,
        ...state,
    }
}
