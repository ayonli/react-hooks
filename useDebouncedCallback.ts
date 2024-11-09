// @deno-types="npm:@types/react@18"
import { useCallback } from "react"
import debounce from "@ayonli/jsext/debounce"

/**
 * This hook returns a debounced function that can be used to reduce unnecessary
 * calls to a `callback` function that may be called frequently. The callback
 * will only be called after the specified `delay` has passed since the last
 * call to the returned function.
 * 
 * @param deps The dependencies that will trigger a new debounced callback to be
 * created when changed.
 * 
 * @example
 * ```tsx
 * import { useState } from "react"
 * import useDebouncedCallback from "./useDebouncedCallback.ts"
 * 
 * export default function SearchBox() {
 *     const [options, setOptions] = useState<string[]>([])
 *     const search = useDebouncedCallback(async (query: string) => {
 *         const res = await fetch(`/api/search?q=${query}`)
 *         const list = await res.json() as string[]
 *         
 *         setOptions(list)
 *     }, 300, [setOptions])
 * 
 *     return (
 *         <div>
 *              <input
 *                  type="text"
 *                  placeholder="Search..."
 *                  onChange={e => search(e.target.value)}
 *              />
 *              <ul>
 *                  {options.map(option => (
 *                      <li key={option}>{option}</li>
 *                  ))}
 *              </ul>
 *         </div>
 *     )
 * }
 * ```
 */
export default function useDebouncedCallback<T, D extends unknown[], R>(
    callback: (data: T, deps: D) => R | Promise<R>,
    delay: number,
    deps: D
): (data: T) => Promise<R> {
    return useCallback(debounce((data: T) => callback(data, deps), delay), deps)
}
