// @deno-types="npm:@types/react@18"
import { type Dispatch, type SetStateAction, useCallback, useEffect, useState } from "react"

/**
 * Represents the state of an asynchronous data request, returned by the
 * {@link useAsyncData} hook.
 */
export interface AsyncDataState<T, E> {
    /**
     * Whether the data is still loading.
     */
    loading: boolean
    /**
     * The data if available, `undefined` if not.
     */
    data: T | undefined
    /**
     * The error occurred during the request, if any.
     */
    error: E | undefined
    /**
     * Aborts the request manually.
     */
    abort: (reason?: E) => void
    /**
     * Manually updates the data.
     */
    setData: Dispatch<SetStateAction<T>>
}

/**
 * Asynchronously loads remote data, usually used with {@link fetch} API.
 *
 * @param fn The request function, it should return a promise that resolves to
 * the data, or rejects with an error.
 * @param deps The dependencies that will trigger a new request when changed.
 * @param shouldRequest Additional condition to determine whether to make a
 * request, if returns `false`, the request will not be made.
 *
 * @example
 * ```tsx
 * import { useAsyncData } from "@ayonli/react-hooks"
 *
 * export function UserComponent() {
 *     const { loading, data, error } = useAsyncData(async signal => {
 *         const res = await fetch("/api/users/me", { signal })
 *         const result = await res.json() as {
 *             success: boolean
 *             message?: string
 *             data?: {
 *                 name: string
 *                 email: string
 *             }
 *         }
 * 
 *         if (result.success) {
 *             return result.data!
 *         } else {
 *             throw new Error(result.message!)
 *         }
 *     })
 * 
 *     if (loading) {
 *         return <div>Loading...</div>
 *     }
 *
 *     return (
 *         <div role="user-panel">
 *             {error ? <div>Error: {(error as Error).message}</div> : null}
 *             {data && (
 *                 <div>
 *                     <h1>Name: {data.name}</h1>
 *                     <p>Email: {data.email}</p>
 *                 </div>
 *             )}
 *         </div>
 *     )
 * }
 * ```
 */
export default function useAsyncData<T, D extends unknown[] = [], E extends unknown = unknown>(
    fn: (signal: AbortSignal, deps: D, setData: Dispatch<SetStateAction<T>>) => Promise<T>,
    deps: D = [] as unknown as D,
    shouldRequest: ((...deps: D) => boolean) | undefined = undefined
): AsyncDataState<T, E> {
    const [state, setState] = useState({
        loading: false,
        data: undefined as T | undefined,
        error: undefined as E | undefined,
        abort: (reason: E | undefined = undefined) => void reason as void,
    })
    const setData = useCallback((data: SetStateAction<T>) => setState(state => {
        if (typeof data === "function") {
            data = (data as (prev: T) => T)(state.data as T)
        }

        return {
            ...state,
            loading: false,
            data,
            error: undefined,
        }
    }), [setState])

    useEffect(() => {
        if (shouldRequest && !shouldRequest(...deps))
            return

        const ctrl = new AbortController()
        const { signal } = ctrl

        setState({
            loading: true,
            data: undefined,
            error: undefined,
            abort: (reason = undefined) => ctrl.abort(reason),
        })

        fn(signal, deps, setData).then(data => {
            setState({
                loading: false,
                data,
                error: undefined,
                abort: (reason = undefined) => void reason as void
            })
        }).catch(err => {
            setState({
                loading: false,
                data: undefined,
                error: err as E,
                abort: (reason = undefined) => void reason as void
            })
        })

        return () => {
            ctrl.abort()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)

    return { ...state, setData }
}
