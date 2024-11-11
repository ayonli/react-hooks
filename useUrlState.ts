// @deno-types="npm:@types/react@18"
import { type Dispatch, type SetStateAction, useCallback, useEffect, useState } from "react"
import { isPlainObject, omit } from "@ayonli/jsext/object"
// @deno-types="npm:@types/qs@6"
import qs from "qs"

export type Scalar = string | number | boolean | null
export type QueryValue<T extends Scalar = Scalar> = T | QueryObject<T> | QueryArray<T>
export type QueryObject<T extends Scalar = Scalar> = Record<string, T>
export type QueryArray<T extends Scalar = Scalar> = QueryValue<T>[]

/**
 * Similar to `useState`, but persist the state to the URL query parameters so
 * that the state can be restored after refreshing the page.
 * 
 * NOTE: This hook only works with history-based routing, it does not work with
 * hash-based routing.
 * 
 * NOTE: This hook automatically coerces the query parameters to the closest
 * JavaScript type, for example, `"true"` and `"false"` will be converted to
 * boolean, `"null"` will be converted to `null`, and numeric strings will be
 * converted to numbers. To disable this behavior, set the `noCoerce` option to
 * `true`.
 * 
 * @example
 * ```tsx
 * import { useUrlState } from "@ayonli/react-hooks"
 * import { render } from "@testing-library/react"
 * import { userEvent } from "@testing-library/user-event"
 * 
 * export default function ProfileView() {
 *     const [state, setState] = useUrlState({ name: "Alice", age: 18 })
 * 
 *     return (
 *         <div>
 *             <h1>Name: {state.name}</h1>
 *             <p>Age: {state.age}</p>
 *             <button onClick={() => setState({ name: "Bob", age: 20 })}>
 *                 Change Profile
 *             </button>
 *         </div>
 *     )
 * }
 * 
 * const dom = render(<View />)
 * 
 * console.log(location.search) // "?name=Alice&age=18"
 * dom.debug()
 * 
 * const button = dom.getByText("Change Name")
 * await userEvent.click(button)
 * 
 * console.log(location.search) // "?name=Bob&age=20"
 * dom.debug()
 * ```
 */
function useUrlState<T extends {
    [x: string]: QueryValue | undefined
    "#"?: string
}>(initials: T | (() => T)): readonly [T, Dispatch<SetStateAction<T>>]
function useUrlState<T extends {
    [x: string]: QueryValue<string> | undefined
    "#"?: string
}>(initials: T | (() => T), options: { noCoerce: true }): readonly [T, Dispatch<SetStateAction<T>>]
function useUrlState<T extends {
    [x: string]: QueryValue | undefined
    "#"?: string
}>(initials: T | (() => T), options: {
    noCoerce: true
} | undefined = undefined): readonly [T, Dispatch<SetStateAction<T>>] {
    const [search, setSearch] = useState(location.search)
    const [state, _setState] = useState(() => {
        let state: T
        const hash = location.hash && location.hash !== "#"
            ? location.hash.slice(1)
            : undefined

        if (location.search && location.search !== "?") {
            state = decodeQueryString(location.search, options?.noCoerce) as T
        } else {
            if (typeof initials === "function") {
                initials = initials()
            }

            state = JSON.parse(JSON.stringify(initials)) as T
        }

        return hash ? { ...state, "#": hash } : state
    })

    const setState: typeof _setState = useCallback((newState => {
        if (typeof newState === "function") {
            newState = newState(state)
        }

        const search = encodeQueryString(omit(newState, ["#"]), true)
        let path = location.pathname + search

        if (newState["#"]) {
            path += "#" + newState["#"]
        }

        globalThis.history.replaceState(null, "", path)
        _setState(newState)
        setSearch(search)
    }), [_setState, state])

    useEffect(() => {
        if (Object.keys(state).length !== 0) {
            // sync initial state to URL
            const search = encodeQueryString(omit(state, ["#"]), true)
            let path = location.pathname + search

            if (state["#"]) {
                path += "#" + state["#"]
            }

            globalThis.history.replaceState(null, "", path)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (location.search !== search) {
            // sync initial state from URL
            const _state = decodeQueryString(location.search, options?.noCoerce) as T
            const hash = location.hash && location.hash !== "#"
                ? location.hash.slice(1)
                : undefined

            if (hash) {
                _state["#"] = hash
            }

            _setState(_state)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search])

    return [state, setState] as const
}

export default useUrlState

function encodeQueryString(
    data: Record<string, QueryValue | undefined>,
    addQueryPrefix = false
): string {
    return qs.stringify(data, {
        strictNullHandling: true,
        arrayFormat: "comma",
        allowDots: true,
        format: "RFC1738",
        addQueryPrefix,
        encodeValuesOnly: true,
    })
}

function decodeQueryString(str: string, noCoerce = false): Record<string, QueryValue> {
    const source = qs.parse(str, {
        comma: true,
        allowDots: true,
        parseArrays: true,
        ignoreQueryPrefix: true,
        strictNullHandling: true,
    })

    if (noCoerce) {
        return source as Record<string, QueryValue>
    }

    // deno-lint-ignore no-explicit-any
    return (function toClosestType(value: string | Record<string, unknown> | any[]): any {
        if (typeof value === "string") {
            if (value === "true") {
                return true
            } else if (value === "false") {
                return false
            } else if (value === "null") {
                return null
            } else if (value === "undefined") {
                return undefined
            } else if (/^-?\d+(\.\d+)?$/.test(value)) {
                return Number(value)
            } else {
                return value
            }
        } else if (Array.isArray(value)) {
            return value.map(toClosestType)
        } else if (isPlainObject(value)) {
            return Object.fromEntries(
                // deno-lint-ignore no-explicit-any
                Object.entries(value).map(([key, val]) => [key, toClosestType(val as any)])
            )
        } else {
            return value
        }
    })(source) as Record<string, QueryValue>
}
