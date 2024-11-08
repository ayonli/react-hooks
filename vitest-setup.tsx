import "@testing-library/jest-dom/vitest"
import { afterEach, beforeAll } from "vitest"
import { cleanup } from "@testing-library/react"
import { setup } from "./testing/util.tsx"

beforeAll(() => {
    setup([
        {
            index: true,
            path: "/",
            element: <div>Home Page</div>
        },
        {
            path: "/about",
            element: <div>About Page</div>
        }
    ])
})

// runs a clean after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup()
})
