// @deno-types="npm:@types/react@18"
import { type Dispatch, type SetStateAction, useCallback, useEffect, useState, useRef } from "react"
import { equals } from "@ayonli/jsext/object"
import type { Scalar } from "./useUrlState.ts"

export type JSONValue = Scalar | JSONArray | JSONObject
export type JSONArray = JSONValue[]
export type JSONObject = {
    [key: string]: JSONValue | undefined
}

/**
 * Similar to `useState`, but persist the state to the `localStorage` (by
 * default) or `sessionStorage` so that the state can be restored after
 * refreshing the page or routing to another page and go back.
 * 
 * TIP: By default, like `useState`, the `setState` function will update
 * the state if the incoming state is not equal to the current state (using
 * shallow comparison `===`). But sometimes we would want to update the state
 * only if the incoming state is not deeply equal to the current state,
 * especially when we use the state as a dependency in a `useEffect` hook. In
 * this case, we can set the `deepCompare` option to `true` to enable deep
 * comparison. If the new state is deeply equal to the current state, the state
 * will not be updated.
 */
export default function useStorageState<T extends JSONValue>(
    key: string,
    initials: T | (() => T),
    options: {
        deepCompare?: boolean
        storage?: Storage
    } | undefined = undefined
): readonly [T, Dispatch<SetStateAction<T>>] {
    const storage = options?.storage ?? localStorage
    const prevKey = useRef(key)
    const prevStorage = useRef(storage)
    const init = () => {
        const storedValue = storage.getItem(key)
        let state: T | undefined

        if (storedValue) {
            try {
                state = JSON.parse(storedValue) as T
            } catch {
                console.error(`Cannot parse stored value for '${key}':`, storedValue)
            }
        }

        if (state === undefined) {
            if (typeof initials === "function") {
                initials = initials()
            }

            state = initials
        }

        return state
    }

    const [state, _setState] = useState(init)

    useEffect(() => {
        if (prevKey.current !== key || prevStorage.current !== storage) {
            // key or storage changed, re-initialize the state
            prevKey.current = key
            _setState(init())
        }
    }, [key, storage])

    const setState: typeof _setState = useCallback((newState => {
        if (typeof newState === "function") {
            newState = newState(state)
        }

        if (options?.deepCompare && equals(newState, state)) {
            return
        }

        const storedValue = JSON.stringify(newState)
        storage.setItem(key, storedValue)
        _setState(newState)
    }), [key, storage, _setState, state, options?.deepCompare ?? false])

    return [state, setState]
}
