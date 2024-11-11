import { expect, test } from "vitest"
import { sleep } from "@ayonli/jsext/async"
import { renderHook } from "./testing.tsx"
import useDebouncedCallback from "./useDebouncedCallback.ts"

test("useDebouncedCallback", async () => {
    let counter = 0
    const { result, rerender } = renderHook((props: {
        suffix: string
    }) => useDebouncedCallback(async (text: string, [suffix]) => {
        counter++
        await sleep(10)
        return text + suffix
    }, 100, [props.suffix]), {
        initialProps: { suffix: "" },
    })

    const task1 = result.current("foo")
    await sleep(10)
    const task2 = result.current("bar")

    const results = await Promise.all([task1, task2])
    expect(results).toStrictEqual(["bar", "bar"])
    expect(counter).toBe(1)

    const task3 = result.current("baz")
    await sleep(105)
    expect(counter).toBe(2)
    const task4 = result.current("qux")

    const results2 = await Promise.all([task3, task4])
    expect(results2).toStrictEqual(["baz", "qux"])
    expect(counter).toBe(3)

    rerender({ suffix: "!" })

    const task5 = result.current("Hello")
    await sleep(10)
    const task6 = result.current("Hi")

    const results3 = await Promise.all([task5, task6])
    expect(results3).toStrictEqual(["Hi!", "Hi!"])
    expect(counter).toBe(4)
})
