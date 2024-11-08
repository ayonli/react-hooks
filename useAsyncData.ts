import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react"

/**
 * Asynchronously load remote data, usually used with {@link fetch} API, returns
 * an object containing the `loading` state, the `data` if available, an `error`
 * if occurred, and a `setData` function to manually update the data.
 *
 * @param fn The request function, it should return a promise that resolves to
 * the data, or rejects with an error.
 * @param deps The dependencies that will trigger a new request when changed.
 * @param shouldRequest Additional condition to determine whether to make a
 * request, if returns `false`, the request will not be made.
 *
 * @example
 * ```tsx
 * import useAsyncData from "./useAsyncData.ts"
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
): {
    loading: boolean
    data: T | undefined
    error: E | undefined
    abort: (reason?: E) => void
    setData: Dispatch<SetStateAction<T>>
} {
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
            abort: (reason = undefined) => ctrl.abort(reason),
            data: undefined,
            error: undefined,
        })

        fn(signal, deps, setData).then(data => {
            setState(state => ({
                ...state,
                loading: false,
                data,
                error: undefined,
            }))
        }).catch(err => {
            setState(state => ({
                ...state,
                loading: false,
                data: undefined,
                error: err as E,
            }))
        })

        return () => {
            ctrl.abort()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)

    return { ...state, setData }
}
