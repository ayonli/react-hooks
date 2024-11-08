import { useCallback } from "react"
import debounce from "@ayonli/jsext/debounce"

export default function useDebouncedCallback<T, D extends unknown[], R>(
    callback: (data: T, deps: D) => R | Promise<R>,
    delay: number,
    deps: D
): (data: T) => Promise<R> {
    return useCallback(debounce((data: T) => callback(data, deps), delay), deps)
}
