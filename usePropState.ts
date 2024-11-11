// @deno-types="npm:@types/react@18"
import { type Dispatch, type SetStateAction, useEffect, useState } from "react"

/**
 * Uses a prop as the state in a component, and when the prop changes,
 * the state will change accordingly.
 * 
 * @example
 * ```tsx
 * import { usePropState } from "@ayonli/react-hooks"
 * 
 * export default function MyComponent(props: { name: string }) {
 *     const [name, setName] = usePropState(props.name)
 * 
 *     return (
 *         <div>
 *             <h1>Name: {name}</h1>
 *             <button onClick={() => setName("Bob")}>Change Name</button>
 *         </div>
 *     )
 * }
 * ```
 */
export default function usePropState<T>(initial: T): readonly [T, Dispatch<SetStateAction<T>>] {
    const [state, setState] = useState(initial)

    useEffect(() => {
        setState(initial)
    }, [initial])

    return [state, setState] as const
}
