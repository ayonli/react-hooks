import { describe, expect, test } from "vitest"
import { act, waitFor } from "@testing-library/react"
import { sleep } from "@ayonli/jsext/async"
import { renderHook } from "./testing.tsx"
import useSubmit from "./useSubmit.ts"

describe("useSubmit", () => {
    test("success", async () => {
        const { result: ref } = renderHook(() => useSubmit(async (_signal, name: string) => {
            return "Hello, " + name
        }))

        expect(ref.current.state).toBe(0)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        act(() => ref.current.submit("Alice"))

        expect(ref.current.state).toBe(1)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        await waitFor(() => ref.current.state === 2)

        expect(ref.current.state).toBe(2)
        expect(ref.current.result).toBe("Hello, Alice")
        expect(ref.current.error).toBe(undefined)
    })

    test("error", async () => {
        const { result: ref } = renderHook(() => useSubmit(async (_signal, name: string) => {
            void name
            throw new Error("something went wrong")
        }))

        expect(ref.current.state).toBe(0)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        act(() => ref.current.submit("Alice"))

        expect(ref.current.state).toBe(1)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        await waitFor(() => ref.current.state === 2)

        expect(ref.current.state).toBe(2)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBeInstanceOf(Error)
    })

    test("abort", async () => {
        const { result: ref } = renderHook(() => useSubmit((signal, name: string) => {
            return new Promise((resolve, reject) => {
                if (signal.aborted)
                    reject(signal.reason ?? new Error("Request aborted"))

                signal.addEventListener("abort", () => {
                    reject(signal.reason ?? new Error("Request aborted"))
                })

                sleep(1000).then(() => resolve("Hello, " + name))
            })
        }))

        expect(ref.current.state).toBe(0)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        act(() => ref.current.submit("Alice"))

        expect(ref.current.state).toBe(1)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        act(() => ref.current.abort())

        await waitFor(() => ref.current.state === 2)

        expect(ref.current.state).toBe(2)
        expect(ref.current.result).toBe(undefined)
        expect(typeof ref.current.error).toBe("object")
        expect(String(ref.current.error)).includes("The operation was aborted.")
    })

    test("abort with reason", async () => {
        const { result: ref } = renderHook(() => useSubmit((signal, name: string) => {
            return new Promise((resolve, reject) => {
                if (signal.aborted)
                    reject(signal.reason ?? new Error("Request aborted"))

                signal.addEventListener("abort", () => {
                    reject(signal.reason ?? new Error("Request aborted"))
                })

                sleep(1000).then(() => resolve("Hello, " + name))
            })
        }))

        expect(ref.current.state).toBe(0)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        act(() => ref.current.submit("Alice"))

        expect(ref.current.state).toBe(1)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        act(() => ref.current.abort(new Error("User canceled")))

        await waitFor(() => ref.current.state === 2)

        expect(ref.current.state).toBe(2)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBeInstanceOf(Error)
        expect(String(ref.current.error)).includes("User canceled")
    })
})
