// deno-lint-ignore verbatim-module-syntax
import * as React from "react"
import { useState } from "react"
import { describe, expect, test } from "vitest"
import { act, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { render, renderHook } from "./testing.tsx"
import useRouter from "./useRouter.ts"

describe("useRouter", () => {
    // test("params", () => {
    //     const { result: router } = renderHook(() => useRouter())
    //     act(() => router.current.push("/users/1"))
    //     expect(location.pathname).toBe("/users/1")
    //     expect(router.current.params).toStrictEqual({ id: "1" })
    // })

    describe("push", () => {
        test("with string", () => {
            const { result: router } = renderHook(() => useRouter())
            act(() => router.current.push("/"))
            expect(location.pathname).toBe("/")

            act(() => router.current.push("/about"))
            expect(location.pathname).toBe("/about")
        })

        test("with URL", () => {
            const { result: router } = renderHook(() => useRouter())
            act(() => router.current.push(new URL("/", location.origin)))
            expect(location.pathname).toBe("/")

            act(() => router.current.push(new URL("/about", location.origin)))
            expect(location.pathname).toBe("/about")
        })

        test("with URLSearchParams", () => {
            const { result: router } = renderHook(() => useRouter())
            act(() => {
                const params = new URLSearchParams(location.search)
                params.set("foo", "bar")
                router.current.push(params)
            })
            expect(location.search).toBe("?foo=bar")
        })

        test("with state", () => {
            const { result: router } = renderHook(() => useRouter())
            act(() => router.current.push("/", { state: { foo: "bar" } }))
            expect(location.pathname).toBe("/")
            expect(router.current.state).toEqual({ foo: "bar" })
        })
    })

    describe("replace", () => {
        test("with string", () => {
            const { result: router } = renderHook(() => useRouter())
            act(() => router.current.replace("/"))
            expect(location.pathname).toBe("/")

            act(() => router.current.replace("/about"))
            expect(location.pathname).toBe("/about")
        })

        test("with URL", () => {
            const { result: router } = renderHook(() => useRouter())
            act(() => router.current.replace(new URL("/", location.origin)))
            expect(location.pathname).toBe("/")

            act(() => router.current.replace(new URL("/about", location.origin)))
            expect(location.pathname).toBe("/about")
        })

        test("with URLSearchParams", () => {
            const { result: router } = renderHook(() => useRouter())
            act(() => {
                const params = new URLSearchParams(location.search)
                params.set("foo", "bar")
                router.current.replace(params)
            })
            expect(location.search).toBe("?foo=bar")
        })

        test("with state", () => {
            const { result: router } = renderHook(() => useRouter())
            act(() => router.current.replace("/", { state: { foo: "bar" } }))
            expect(location.pathname).toBe("/")
            expect(router.current.state).toEqual({ foo: "bar" })
        })

        test("silent", () => {
            const { result: router } = renderHook(() => useRouter())
            act(() => router.current.push("/"))
            expect(router.current.state).toBe(null)

            act(() => router.current.replace("/", { state: { foo: "bar" } }))
            expect(router.current.state).toEqual({ foo: "bar" })

            act(() => router.current.replace("/about", { state: { foo: "baz" }, silent: true }))
            expect(router.current.state).toEqual({ foo: "bar" })
        })
    })

    test("back", async () => {
        const { result: router } = renderHook(() => useRouter())
        act(() => router.current.push("/"))
        expect(location.pathname).toBe("/")

        act(() => router.current.push("/about"))
        expect(location.pathname).toBe("/about")

        act(() => router.current.back())

        await waitFor(() => expect(location.pathname).toBe("/"))
    })

    test("forward", async () => {
        const { result: router } = renderHook(() => useRouter())
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
        const { result: router } = renderHook(() => useRouter())
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
