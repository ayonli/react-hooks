// @deno-types="npm:@types/react@18"
import { useCallback, useState } from "react"

/**
 * This hook returns a `rerender` function and a `counter`. The rerender function
 * can be called to trigger a rerender of the component manually, the counter
 * will be incremented each time the rerender function is called. The counter
 * can then be used as a dependency in other hooks such as `useEffect` to trigger
 * side effects when it changes.
 * 
 * @example
 * ```tsx
 * import { useRerender } from "@ayonli/react-hooks"
 * 
 * export default function MyComponent() {
 *     const [rerender] = useRerender()
 * 
 *     return (
 *         <div>
 *             <button onClick={rerender}>Rerender</button>
 *         </div>
 *     )
 * }
 * ```
 */
export default function useRerender(): readonly [rerender: () => void, counter: number] {
    const [n, set] = useState(1)
    const rerender = useCallback(() => set(n => n + 1), [set])
    return [rerender, n] as const
}
