/* eslint-disable react-refresh/only-export-components */
import React, { type ReactNode } from "react"
import { BrowserRouter as Router, useRoutes } from "react-router-dom"
import { render as _render, renderHook as _renderHook, type RenderOptions } from "@testing-library/react"
import useRouter from "./useRouter.ts"

function App({ children }: { children: ReactNode }) {
    useRoutes([
        {
            path: "/",
            element: <div>Home Page</div>
        },
        {
            path: "/about",
            element: <div>About Page</div>
        },
        {
            path: "/users/:id",
            element: <div>User Page</div>
        }
    ])
    const router = useRouter()

    return (
        <React.Fragment key={router.key}>
            {children}
        </React.Fragment>
    )
}

function Wrapper({ children }: { children: ReactNode }) {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <App>{children}</App>
        </Router >
    )
}

export const render: typeof _render = ((ui: ReactNode, options?: RenderOptions) => {
    return _render(ui, { wrapper: Wrapper, ...options })
}) as unknown as typeof _render

export const renderHook: typeof _renderHook = (fn, options = {}) => {
    return _renderHook(fn, { wrapper: Wrapper, ...options })
}
