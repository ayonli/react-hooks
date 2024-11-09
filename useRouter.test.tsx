// deno-lint-ignore verbatim-module-syntax
import * as React from "react"
import { useState } from "react"
import { useLocation } from "react-router"
import { describe, expect, test } from "vitest"
import { act, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { render, renderHook } from "./testing.tsx"
import useRouter from "./useRouter.ts"

describe("useRouter", () => {
    const { result: router } = renderHook(() => useRouter())

    describe("push", () => {
        test("with string", () => {
            act(() => router.current.push("/"))
            expect(location.pathname).toBe("/")

            act(() => router.current.push("/about"))
            expect(location.pathname).toBe("/about")
        })

        test("with URLSearchParams", () => {
            act(() => {
                const params = new URLSearchParams(location.search)
                params.set("foo", "bar")
                router.current.push(params)
            })
            expect(location.search).toBe("?foo=bar")
        })
    })

    describe("replace", () => {
        test("with string", () => {
            act(() => router.current.replace("/"))
            expect(location.pathname).toBe("/")

            act(() => router.current.replace("/about"))
            expect(location.pathname).toBe("/about")
        })

        test("with URLSearchParams", () => {
            act(() => {
                const params = new URLSearchParams(location.search)
                params.set("foo", "bar")
                router.current.replace(params)
            })
            expect(location.search).toBe("?foo=bar")
        })

        test("silent", () => {
            const { result: location1 } = renderHook(() => useLocation())
            expect(location1.current.state).toBe(null)

            act(() => router.current.replace("/", { state: { foo: "bar" } }))

            const { result: location2 } = renderHook(() => useLocation())
            expect(location2.current.state).toEqual({ foo: "bar" })

            act(() => router.current.replace("/about", { state: { foo: "bar" }, silent: true }))

            const { result: location3 } = renderHook(() => useLocation())
            expect(location3.current.state).toEqual(null)
        })
    })

    test("back", async () => {
        act(() => router.current.push("/"))
        expect(location.pathname).toBe("/")

        act(() => router.current.push("/about"))
        expect(location.pathname).toBe("/about")

        act(() => router.current.back())

        await waitFor(() => expect(location.pathname).toBe("/"))
    })

    test("forward", async () => {
        act(() => router.current.push("/"))
        expect(location.pathname).toBe("/")

        act(() => router.current.push("/about"))
        expect(location.pathname).toBe("/about")

        act(() => router.current.back())
        await waitFor(() => expect(location.pathname).toBe("/"))

        act(() => router.current.forward())
        await waitFor(() => expect(location.pathname).toBe("/about"))
    })

    test("go", async () => {
        act(() => router.current.push("/"))
        expect(location.pathname).toBe("/")

        act(() => router.current.push("/about"))
        expect(location.pathname).toBe("/about")

        act(() => router.current.go(-1))
        await waitFor(() => expect(location.pathname).toBe("/"))

        act(() => router.current.go(1))
        await waitFor(() => expect(location.pathname).toBe("/about"))
    })

    test("reload", async () => {
        const Counter = () => {
            const [count, setCount] = useState(0)
            const router = useRouter() // Don't use the `router` from above because it's in a different context.

            return (
                <div>
                    <button data-testid="button" onClick={() => setCount(count + 1)}>{count}</button>
                    <button data-testid="reload" onClick={() => router.reload()}>Reload</button>
                </div>
            )
        }

        const dom = render(<Counter />)
        const button = dom.getByTestId("button")

        expect(button.innerHTML).toBe("0")

        await userEvent.click(button)
        expect(button.innerHTML).toBe("1")

        await userEvent.click(dom.getByTestId("reload"))
        await waitFor(() => expect(dom.getByTestId("button").innerHTML).toBe("0"))
    })
})
