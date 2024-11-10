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

        expect(ref.current.pending).toBe(false)
        expect(ref.current.done).toBe(false)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        act(() => ref.current.submit("Alice"))

        expect(ref.current.pending).toBe(true)
        expect(ref.current.done).toBe(false)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        await waitFor(() => ref.current.done)

        expect(ref.current.pending).toBe(false)
        expect(ref.current.done).toBe(true)
        expect(ref.current.result).toBe("Hello, Alice")
        expect(ref.current.error).toBe(undefined)
    })

    test("error", async () => {
        const { result: ref } = renderHook(() => useSubmit(async (_signal, name: string) => {
            void name
            throw new Error("something went wrong")
        }))

        expect(ref.current.pending).toBe(false)
        expect(ref.current.done).toBe(false)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        act(() => ref.current.submit("Alice"))

        expect(ref.current.pending).toBe(true)
        expect(ref.current.done).toBe(false)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        await waitFor(() => ref.current.done)

        expect(ref.current.pending).toBe(false)
        expect(ref.current.done).toBe(true)
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

        expect(ref.current.pending).toBe(false)
        expect(ref.current.done).toBe(false)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        act(() => ref.current.submit("Alice"))

        expect(ref.current.pending).toBe(true)
        expect(ref.current.done).toBe(false)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        act(() => ref.current.abort())

        await waitFor(() => ref.current.done)

        expect(ref.current.pending).toBe(false)
        expect(ref.current.done).toBe(true)
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

        expect(ref.current.pending).toBe(false)
        expect(ref.current.done).toBe(false)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        act(() => ref.current.submit("Alice"))

        expect(ref.current.pending).toBe(true)
        expect(ref.current.done).toBe(false)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        act(() => ref.current.abort(new Error("User canceled")))

        await waitFor(() => ref.current.done)

        expect(ref.current.pending).toBe(false)
        expect(ref.current.done).toBe(true)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBeInstanceOf(Error)
        expect(String(ref.current.error)).includes("User canceled")
    })

    test("deps change", async () => {
        const { rerender, result: ref } = renderHook((props: {
            greeting: string
        }) => useSubmit(async (_signal, name: string) => {
            return props.greeting + ", " + name
        }, [props.greeting]), {
            initialProps: {
                greeting: "Hello",
            },
        })

        expect(ref.current.pending).toBe(false)
        expect(ref.current.done).toBe(false)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        act(() => ref.current.submit("Alice"))

        expect(ref.current.pending).toBe(true)
        expect(ref.current.done).toBe(false)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        await waitFor(() => ref.current.done)

        expect(ref.current.pending).toBe(false)
        expect(ref.current.done).toBe(true)
        expect(ref.current.result).toBe("Hello, Alice")
        expect(ref.current.error).toBe(undefined)

        act(() => rerender({ greeting: "Hi" }))

        expect(ref.current.pending).toBe(false)
        expect(ref.current.done).toBe(false)

        act(() => ref.current.submit("Bob"))

        expect(ref.current.pending).toBe(true)
        expect(ref.current.done).toBe(false)
        expect(ref.current.result).toBe(undefined)
        expect(ref.current.error).toBe(undefined)

        await waitFor(() => ref.current.done)

        expect(ref.current.pending).toBe(false)
        expect(ref.current.done).toBe(true)
        expect(ref.current.result).toBe("Hi, Bob")
        expect(ref.current.error).toBe(undefined)
    })
})
