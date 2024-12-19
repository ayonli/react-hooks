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
        const { result } = renderHook(() => useUrlState({
            foo: "bar",
            num: 123,
            bool: true as boolean,
            nil: null,
            obj: {
                hello: "world",
            }
        }))
        let [state, setState] = result.current

        expect(state).toStrictEqual({
            foo: "bar",
            num: 123,
            bool: true,
            nil: null,
            obj: {
                hello: "world",
            },
        })
        expect(location.search).toBe("?foo=bar&num=123&bool=true&nil&obj.hello=world")

        act(() => setState({
            foo: "baz",
            num: 456,
            bool: false,
            nil: null,
            obj: {
                hello: "ayonli",
            },
        }));
        [state, setState] = result.current
        expect(state).toStrictEqual({
            foo: "baz",
            num: 456,
            bool: false,
            nil: null,
            obj: {
                hello: "ayonli",
            },
        })
        expect(location.search).toBe("?foo=baz&num=456&bool=false&nil&obj.hello=ayonli")
    })

    test("object as initials (no coerce)", () => {
        const { result } = renderHook(() => useUrlState({
            foo: "bar",
            num: "123",
            bool: "true",
            nil: "null",
            obj: {
                hello: "world",
            },
        }, { noCoerce: true }))
        let [state, setState] = result.current

        expect(state).toStrictEqual({
            foo: "bar",
            num: "123",
            bool: "true",
            nil: "null",
            obj: {
                hello: "world",
            },
        })
        expect(location.search).toBe("?foo=bar&num=123&bool=true&nil=null&obj.hello=world")

        act(() => setState({
            foo: "baz",
            num: "456",
            bool: "false",
            nil: "null",
            obj: {
                hello: "ayonli",
            },
        }));
        [state, setState] = result.current
        expect(state).toStrictEqual({
            foo: "baz",
            num: "456",
            bool: "false",
            nil: "null",
            obj: {
                hello: "ayonli",
            },
        })
        expect(location.search).toBe("?foo=baz&num=456&bool=false&nil=null&obj.hello=ayonli")
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

    test("deep compare", () => {
        const initial = {
            foo: "bar",
            num: 123,
            bool: true as boolean,
            nil: null,
            obj: {
                hello: "world",
            }
        }
        const { result: result1 } = renderHook(() => useUrlState(initial))
        const { result: result2 } = renderHook(() => useUrlState(initial, { deepCompare: true }))

        const [state1, setState1] = result1.current
        act(() => setState1({ ...state1 }))
        const [_state1] = result1.current
        expect(state1).not.toBe(_state1)

        const [state2, setState2] = result2.current
        act(() => setState2(structuredClone(state2)))
        const [_state2] = result2.current
        expect(state2).toBe(_state2)
    })
})
