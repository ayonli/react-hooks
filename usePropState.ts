import { useEffect, useState } from "react"

/**
 * Uses a prop as the state in a component, and when the prop changes,
 * the state will change accordingly.
 * 
 * @example
 * ```tsx
 * import usePropState from "./usePropState.ts"
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
export default function usePropState<T>(initial: T) {
    const [state, setState] = useState(initial)

    useEffect(() => {
        setState(initial)
    }, [initial])

    return [state, setState] as const
}
