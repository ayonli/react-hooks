import { describe, expect, test } from "vitest"
import { act } from "@testing-library/react"
import { renderHook } from "./testing.tsx"
import useRevertibleState from "./useRevertibleState.ts"

describe("useRevertibleState", () => {
    test("initial state", () => {
        const { result } = renderHook(() => useRevertibleState(""))
        const [state] = result.current
        expect(state).toBe("")
    })

    test("set state", () => {
        const { result } = renderHook(() => useRevertibleState(""))
        const [, setState] = result.current
        act(() => setState("foo"))
        const [state] = result.current
        expect(state).toBe("foo")
    })

    test("undo", () => {
        const { result } = renderHook(() => useRevertibleState(""))

        let [, setState] = result.current
        act(() => setState("foo"))
        expect(result.current[0]).toBe("foo");

        [, setState] = result.current
        act(() => setState("bar"))
        expect(result.current[0]).toBe("bar")

        act(() => result.current[2].undo())
        expect(result.current[0]).toBe("foo")

        act(() => result.current[2].undo())
        expect(result.current[0]).toBe("")
    })

    test("redo", () => {
        const { result } = renderHook(() => useRevertibleState(""))

        act(() => result.current[1]("foo"))
        expect(result.current[0]).toBe("foo")

        act(() => result.current[1]("bar"))
        expect(result.current[0]).toBe("bar")

        act(() => result.current[2].undo())
        expect(result.current[0]).toBe("foo")

        act(() => result.current[2].undo())
        expect(result.current[0]).toBe("")

        act(() => result.current[2].redo())
        expect(result.current[0]).toBe("foo")

        act(() => result.current[2].redo())
        expect(result.current[0]).toBe("bar")

        act(() => result.current[2].redo())
        expect(result.current[0]).toBe("bar")
    })

    test("update history after setState", () => {
        const { result } = renderHook(() => useRevertibleState(""))

        act(() => result.current[1]("foo"))
        expect(result.current[0]).toBe("foo")

        act(() => result.current[1]("bar"))
        expect(result.current[0]).toBe("bar")

        act(() => result.current[2].undo())
        expect(result.current[0]).toBe("foo")

        act(() => result.current[1]("baz"))
        expect(result.current[0]).toBe("baz")

        act(() => result.current[2].redo())
        expect(result.current[0]).toBe("baz")

        act(() => result.current[2].undo())
        expect(result.current[0]).toBe("foo")
    })
})
