import { describe, expect, test } from "vitest"
import { renderHook } from "./testing.tsx"
import { useUndoRedo } from "./useUndoRedo.ts"
import { act } from "@testing-library/react"

describe("useUndoRedo", () => {
    test("initial state", () => {
        const { result } = renderHook(() => useUndoRedo(""))
        const { state } = result.current
        expect(state).toBe("")
    })

    test("set state", () => {
        const { result } = renderHook(() => useUndoRedo(""))
        act(() => result.current.setState("foo"))
        expect(result.current.state).toBe("foo")
    })

    test("undo", () => {
        const { result } = renderHook(() => useUndoRedo(""))

        act(() => result.current.setState("foo"))
        expect(result.current.state).toBe("foo")

        act(() => result.current.setState("bar"))
        expect(result.current.state).toBe("bar")

        act(() => result.current.undo())
        expect(result.current.state).toBe("foo")

        act(() => result.current.undo())
        expect(result.current.state).toBe("")
    })

    test("redo", () => {
        const { result } = renderHook(() => useUndoRedo(""))

        act(() => result.current.setState("foo"))
        expect(result.current.state).toBe("foo")

        act(() => result.current.setState("bar"))
        expect(result.current.state).toBe("bar")

        act(() => result.current.undo())
        expect(result.current.state).toBe("foo")

        act(() => result.current.undo())
        expect(result.current.state).toBe("")

        act(() => result.current.redo())
        expect(result.current.state).toBe("foo")

        act(() => result.current.redo())
        expect(result.current.state).toBe("bar")

        act(() => result.current.redo())
        expect(result.current.state).toBe("bar")
    })

    test("update history after setState", () => {
        const { result } = renderHook(() => useUndoRedo(""))

        act(() => result.current.setState("foo"))
        expect(result.current.state).toBe("foo")

        act(() => result.current.setState("bar"))
        expect(result.current.state).toBe("bar")

        act(() => result.current.undo())
        expect(result.current.state).toBe("foo")

        act(() => result.current.setState("baz"))
        expect(result.current.state).toBe("baz")

        act(() => result.current.redo())
        expect(result.current.state).toBe("baz")

        act(() => result.current.undo())
        expect(result.current.state).toBe("foo")
    })
})
