/* eslint-disable react-refresh/only-export-components */
import React, { ReactNode } from "react"
import { RouteObject, BrowserRouter as Router, useLocation, useRoutes } from "react-router-dom"
import { render as _render, renderHook as _renderHook, RenderOptions } from "@testing-library/react"

let _routes: RouteObject[] = []

export function setup(routes: RouteObject[]) {
    _routes = routes
}

function App({ children }: { children: ReactNode }) {
    const routes = [..._routes]

    useRoutes(routes)
    const location = useLocation()

    return (
        <React.Fragment key={location.key}>
            {children}
        </React.Fragment>
    )
}

function Wrapper({ children }: { children: ReactNode }) {
    return <Router><App>{children} </App></Router >
}

export const render: typeof _render = ((ui: ReactNode, options?: RenderOptions) => {
    return _render(ui, { wrapper: Wrapper, ...options })
}) as any

export const renderHook: typeof _renderHook = (fn, options = {}) => {
    return _renderHook(fn, { wrapper: Wrapper, ...options })
}
