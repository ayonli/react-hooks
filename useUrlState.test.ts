import { beforeEach, describe, expect, test } from "vitest"
import { act } from "@testing-library/react"
import { renderHook } from "./testing.tsx"
import useRouter from "./useRouter.ts"
import useUrlState from "./useUrlState.ts"

describe("useUrlState", () => {
    const { result: router } = renderHook(() => useRouter())

    beforeEach(() => {
        act(() => router.current.push("/"))
    })

    test("object as initials", () => {
        const { result } = renderHook(() => useUrlState({ foo: "bar" }))
        let [state, setState] = result.current

        expect(state).toStrictEqual({ foo: "bar" })
        expect(location.search).toBe("?foo=bar")

        act(() => setState({ foo: "baz" }));
        [state, setState] = result.current
        expect(state).toStrictEqual({ foo: "baz" })
        expect(location.search).toBe("?foo=baz")
    })

    test("callback as initials", () => {
        const { result } = renderHook(() => useUrlState(() => ({ foo: "bar" })))
        let [state, setState] = result.current

        expect(state).toStrictEqual({ foo: "bar" })
        expect(location.search).toBe("?foo=bar")

        act(() => setState({ foo: "baz" }));
        [state, setState] = result.current
        expect(state).toStrictEqual({ foo: "baz" })
        expect(location.search).toBe("?foo=baz")
    })

    test("load initials from URL", () => {
        act(() => router.current.push("/?foo=baz"))

        const { result } = renderHook(() => useUrlState({ foo: "bar" }))
        const [state] = result.current
        expect(state).toStrictEqual({ foo: "baz" })
    })

    test("hash support", () => {
        act(() => router.current.push("/?foo=baz#hash"))

        const { result } = renderHook(() => useUrlState({ foo: "bar", "#": "" }))
        const [state] = result.current
        expect(state).toStrictEqual({ foo: "baz", "#": "hash" })

        act(() => {
            const [, setState] = result.current
            setState({ foo: "baz", "#": "hash2" })
        })

        const [state2] = result.current
        expect(state2).toStrictEqual({ foo: "baz", "#": "hash2" })
        expect(location.hash).toBe("#hash2")
    })
})
