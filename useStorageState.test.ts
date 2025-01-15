import { beforeEach, describe, expect, test } from "vitest"
import { act } from "@testing-library/react"
import { renderHook } from "./testing.tsx"
import useStorageState from "./useStorageStage.ts"

describe("useStorageState", () => {
    beforeEach(() => {
        act(() => localStorage.clear())
    })

    test("object as initials", () => {
        const { result } = renderHook(() => useStorageState("foo", {
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
        expect(localStorage.getItem("foo"))
            .toBe('{"foo":"baz","num":456,"bool":false,"nil":null,"obj":{"hello":"ayonli"}}')

        act(() => setState(prev => ({ ...prev, num: 789 })));
        [state, setState] = result.current
        expect(state).toStrictEqual({
            foo: "baz",
            num: 789,
            bool: false,
            nil: null,
            obj: {
                hello: "ayonli",
            },
        })
        expect(localStorage.getItem("foo"))
            .toBe('{"foo":"baz","num":789,"bool":false,"nil":null,"obj":{"hello":"ayonli"}}')
    })

    test("callback as initials", () => {
        const { result } = renderHook(() => useStorageState("foo", () => ({ foo: "bar" })))
        let [state, setState] = result.current

        expect(state).toStrictEqual({ foo: "bar" })

        act(() => setState({ foo: "baz" }));
        [state, setState] = result.current
        expect(state).toStrictEqual({ foo: "baz" })
        expect(localStorage.getItem("foo")).toBe('{"foo":"baz"}')
    })

    test("load from storage", () => {
        act(() => localStorage.setItem("foo", '{"foo":"baz"}'))

        const { result } = renderHook(() => useStorageState("foo", { foo: "bar" }))
        const [state] = result.current

        expect(state).toStrictEqual({ foo: "baz" })
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
        const { result: result1 } = renderHook(() => useStorageState("foo", initial))
        const { result: result2 } = renderHook(() => useStorageState("foo", initial, {
            deepCompare: true,
        }))

        const [state1, setState1] = result1.current
        act(() => setState1({ ...state1 }))
        const [_state1] = result1.current
        expect(state1).not.toBe(_state1)

        const [state2, setState2] = result2.current
        act(() => setState2(structuredClone(state2)))
        const [_state2] = result2.current
        expect(state2).toBe(_state2)
    })

    test("sessionStorage", () => {
        const { result } = renderHook(() => useStorageState("foo", { foo: "bar" }, {
            storage: sessionStorage,
        }))
        let [state, setState] = result.current

        expect(state).toStrictEqual({ foo: "bar" })

        act(() => setState({ foo: "baz" }));
        [state, setState] = result.current
        expect(state).toStrictEqual({ foo: "baz" })
        expect(sessionStorage.getItem("foo")).toBe('{"foo":"baz"}')
        expect(localStorage.getItem("foo")).toBeNull()
    })

    test("different keys", () => {
        const { result: result1 } = renderHook(() => useStorageState("foo", { foo: "bar" }))
        const { result: result2 } = renderHook(() => useStorageState("bar", { bar: "baz" }))

        let [state1, setState1] = result1.current
        let [state2, setState2] = result2.current

        act(() => setState1({ foo: "baz" }));
        [state1, setState1] = result1.current
        expect(state1).toStrictEqual({ foo: "baz" })
        expect(localStorage.getItem("foo")).toBe('{"foo":"baz"}')

        act(() => setState2({ bar: "qux" }));
        [state2, setState2] = result2.current
        expect(state2).toStrictEqual({ bar: "qux" })
        expect(localStorage.getItem("foo")).toBe('{"foo":"baz"}')
        expect(localStorage.getItem("bar")).toBe('{"bar":"qux"}')
    })

    test("dynamic key", () => {
        const { result, rerender } = renderHook((props: { id: string }) => useStorageState(props.id, { foo: "bar" }), {
            initialProps: { id: "foo" },
        })
        let [state, setState] = result.current

        expect(state).toStrictEqual({ foo: "bar" })

        act(() => setState({ foo: "baz" }));
        [state, setState] = result.current
        expect(state).toStrictEqual({ foo: "baz" })
        expect(localStorage.getItem("foo")).toBe('{"foo":"baz"}')

        act(() => {
            rerender({ id: "bar" })
        });
        [state, setState] = result.current
        expect(state).toStrictEqual({ foo: "bar" })

        act(() => setState({ foo: "qux" }));
        [state, setState] = result.current
        expect(state).toStrictEqual({ foo: "qux" })
        expect(localStorage.getItem("foo")).toBe('{"foo":"baz"}')
        expect(localStorage.getItem("bar")).toBe('{"foo":"qux"}')

        act(() => {
            rerender({ id: "foo" })
        });
        [state, setState] = result.current
        expect(state).toStrictEqual({ foo: "baz" })
        expect(localStorage.getItem("foo")).toBe('{"foo":"baz"}')
        expect(localStorage.getItem("bar")).toBe('{"foo":"qux"}')
    })
})
