import { describe, expect, test } from "vitest"
import { renderHook } from "./testing.tsx"
import useSubmitter from "./useSubmitter.ts"
import { act, waitFor } from "@testing-library/react"

describe("useSubmitter", () => {
    test("success", async () => {
        const { result: ref } = renderHook(() => useSubmitter(async (_signal, name: string) => {
            return "Hello, " + name
        }, []))

        expect(ref.current.pending).toBe(false)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        act(() => ref.current.submit("Alice"))

        expect(ref.current.pending).toBe(true)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        await waitFor(() => ref.current.pending === false)

        expect(ref.current.pending).toBe(false)
        expect(ref.current.result).toBe("Hello, Alice")
        expect(ref.current.error).toBe(undefined)
    })

    test("error", async () => {
        const { result: ref } = renderHook(() => useSubmitter(async (_signal, name: string) => {
            void name
            throw new Error("something went wrong")
        }, []))

        expect(ref.current.pending).toBe(false)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        act(() => ref.current.submit("Alice"))

        expect(ref.current.pending).toBe(true)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        await waitFor(() => ref.current.pending === false)

        expect(ref.current.pending).toBe(false)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBeInstanceOf(Error)
    })
})
