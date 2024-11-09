import { expect, test } from "vitest"
import { act, renderHook } from "@testing-library/react"
import useRerender from "./useRerender.ts"

test("useRerender", () => {
    const { result } = renderHook(() => useRerender())
    let [rerender, counter] = result.current
    expect(counter).toBe(1)

    act(() => rerender());
    [rerender, counter] = result.current
    expect(counter).toBe(2)

    act(() => rerender());
    [rerender, counter] = result.current
    expect(counter).toBe(3)
})
