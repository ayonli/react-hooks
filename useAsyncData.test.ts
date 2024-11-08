import { describe, expect, test } from "vitest"
import { act, waitFor } from "@testing-library/react"
import { sleep } from "@ayonli/jsext/async"
import { as } from "@ayonli/jsext/object"
import { renderHook } from "./testing.tsx"
import { useAsyncData } from "./useAsyncData.ts"

describe("useAsyncData", () => {
    test("success", async () => {
        const { result: req } = renderHook(() => useAsyncData(async () => {
            return await Promise.resolve("foo")
        }))
        expect(req.current.loading).toBe(true)
        expect(req.current.data).toBe(undefined)
        expect(req.current.error).toBe(undefined)

        await waitFor(() => expect(req.current.loading).toBe(false))
        expect(req.current.data).toBe("foo")
        expect(req.current.error).toBe(undefined)
    })

    test("error", async () => {
        const { result: req } = renderHook(() => useAsyncData(async () => {
            throw new Error("bar")
        }))
        expect(req.current.loading).toBe(true)
        expect(req.current.data).toBe(undefined)
        expect(req.current.error).toBe(undefined)

        await waitFor(() => expect(req.current.loading).toBe(false))
        expect(req.current.data).toBe(undefined)
        expect(req.current.error).toStrictEqual(new Error("bar"))
    })

    test("abort", async () => {
        const { result: req } = renderHook(() => useAsyncData((signal) => {
            return new Promise((resolve, reject) => {
                if (signal.aborted)
                    reject(signal.reason ?? new Error("Request aborted"))

                signal.addEventListener("abort", () => {
                    reject(signal.reason ?? new Error("Request aborted"))
                })

                sleep(1000).then(() => resolve("foo"))
            })
        }))
        expect(req.current.loading).toBe(true)
        expect(req.current.data).toBe(undefined)
        expect(req.current.error).toBe(undefined)

        act(() => req.current.abort())
        await waitFor(() => expect(req.current.loading).toBe(false))
        expect(req.current.data).toBe(undefined)
        expect(as(req.current.error, Error)?.message).includes("The operation was aborted.")
    })

    test("abort with reason", async () => {
        const { result: req } = renderHook(() => useAsyncData((signal) => {
            return new Promise((resolve, reject) => {
                if (signal.aborted)
                    reject(signal.reason)

                signal.addEventListener("abort", () => {
                    reject(signal.reason)
                })

                sleep(1000).then(() => resolve("foo"))
            })
        }))
        expect(req.current.loading).toBe(true)
        expect(req.current.data).toBe(undefined)
        expect(req.current.error).toBe(undefined)

        act(() => req.current.abort(new Error("User aborted")))
        await waitFor(() => expect(req.current.loading).toBe(false))
        expect(req.current.data).toBe(undefined)
        expect(req.current.error).toStrictEqual(new Error("User aborted"))
    })

    test("manually set state", async () => {
        const { result } = renderHook(() => useAsyncData(async () => {
            return await Promise.resolve("foo")
        }))
        expect(result.current.loading).toBe(true)
        expect(result.current.data).toBe(undefined)
        expect(result.current.error).toBe(undefined)

        await waitFor(() => expect(result.current.loading).toBe(false))

        act(() => result.current.set("bar"))
        expect(result.current.loading).toBe(false)
        expect(result.current.data).toBe("bar")
        expect(result.current.error).toBe(undefined)
    })

    test("with deps", async () => {
        const { result, rerender } = renderHook(({ deps }) => useAsyncData(async () => {
            return await Promise.resolve(deps)
        }, deps), { initialProps: { deps: [1] } })
        expect(result.current.loading).toBe(true)
        expect(result.current.data).toBe(undefined)
        expect(result.current.error).toBe(undefined)

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.data).toStrictEqual([1])
        expect(result.current.error).toBe(undefined)

        rerender({ deps: [1] })
        expect(result.current.loading).toBe(false)
        expect(result.current.data).toStrictEqual([1])
        expect(result.current.error).toBe(undefined)

        rerender({ deps: [2] })
        expect(result.current.loading).toBe(true)
        expect(result.current.data).toBe(undefined)
        expect(result.current.error).toBe(undefined)

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.data).toStrictEqual([2])
        expect(result.current.error).toBe(undefined)
    })

    test("with shouldUpdate", async () => {
        const { result, rerender } = renderHook(({ deps }) => useAsyncData(async () => {
            return await Promise.resolve(deps)
        }, deps, (num) => num >= 2), { initialProps: { deps: [1] as [number] } })
        expect(result.current.loading).toBe(false)
        expect(result.current.data).toBe(undefined)
        expect(result.current.error).toBe(undefined)

        rerender({ deps: [2] })
        expect(result.current.loading).toBe(true)
        expect(result.current.data).toBe(undefined)
        expect(result.current.error).toBe(undefined)

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.data).toStrictEqual([2])
        expect(result.current.error).toBe(undefined)

        rerender({ deps: [1] })
        expect(result.current.loading).toBe(false)
        expect(result.current.data).toStrictEqual([2])
        expect(result.current.error).toBe(undefined)

        rerender({ deps: [3] })
        expect(result.current.loading).toBe(true)
        expect(result.current.data).toBe(undefined)
        expect(result.current.error).toBe(undefined)

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.data).toStrictEqual([3])
        expect(result.current.error).toBe(undefined)
    })
})
