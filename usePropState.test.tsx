import { expect, test } from "vitest"
import { act } from "@testing-library/react"
import { renderHook } from "./testing.tsx"
import usePropState from "./usePropState.ts"

test("usePropState", () => {
    const { rerender, result } = renderHook((props: { text: string }) => usePropState(props.text), {
        initialProps: { text: "Hello" },
    })

    let [text, setText] = result.current
    expect(text).toBe("Hello")

    act(() => setText("World"));
    [text] = result.current
    expect(text).toBe("World")

    act(() => rerender({ text: "Hi" }));
    [text] = result.current
    expect(text).toBe("Hi")
})
