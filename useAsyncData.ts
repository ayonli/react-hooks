import { SetStateAction, useCallback, useEffect, useState } from "react"

/**
 * Asynchronously load remote data, usually used with {@link fetch} API, returns
 * an object containing the `loading` state, the `data` if available, an `error`
 * if occurred, and a `set` function to manually update the data.
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
 * import { render, waitFor } from "@testing-library/react"
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
 *             {error ? <div>Error: {error.message}</div> : null}
 *             {data && (
 *                 <div>
 *                     <h1>Name: {data.name}</h1>
 *                     <p>Email: {data.email}</p>
 *                 </div>
 *             )}
 *         </div>
 *     )
 * }
 * 
 * const dom = render(<UserComponent />)
 * dom.debug()
 * console.log("\n")
 * 
 * await waitFor(() => dom.getByRole("user-panel"))
 * dom.debug()
 * ```
 */
export function useAsyncData<T, D extends unknown[] = [], E extends unknown = unknown>(
    fn: (signal: AbortSignal, deps: D, set: (data: SetStateAction<T>) => void) => Promise<T>,
    deps: D = [] as any,
    shouldRequest: ((...deps: D) => boolean) | undefined = undefined
): {
    loading: boolean
    data: T | undefined
    error: E | undefined
    abort: (reason?: E) => void
    set: (data: SetStateAction<T>) => void
} {
    const [state, setState] = useState({
        loading: false,
        data: undefined as T | undefined,
        error: undefined as E | undefined,
        abort: (reason: E | undefined = undefined) => void reason as void,
    })
    const set = useCallback((data: SetStateAction<T>) => setState(state => {
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

        fn(signal, deps, set).then(data => {
            if (signal.aborted)
                return

            setState(state => ({
                ...state,
                loading: false,
                data,
                error: undefined,
            }))
        }).catch(err => {
            let error: E

            if (err instanceof Error) {
                error = err as E
            } else {
                error = new Error(String(err)) as E
            }

            setState(state => ({
                ...state,
                loading: false,
                data: undefined,
                error,
            }))
        })

        return () => {
            ctrl.abort()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)

    return { ...state, set }
}
