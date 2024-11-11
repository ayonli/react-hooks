// @deno-types="npm:@types/react@18"
import { useCallback, useRef } from "react"
import { type NavigateOptions, type To, useLocation, useNavigate, useParams } from "react-router"

export type PushOptions = Omit<NavigateOptions, "replace">

export type ReplaceOptions = PushOptions & {
    /**
     * Replace the URL but do not trigger page reload. This option is only
     * available with history-based routing.
     */
    silent?: boolean
}

export interface PageRouter<P extends Record<string, string | undefined>> {
    /**
     * This value is the same as the `useLocation().key` property. It is a
     * unique string every time the route changes (with `push` or `replace`).
     * This value must be used as a `key` of the top level element in the
     * `<App>` component in order for the `reload` function to work correctly.
     * 
     * @example
     * ```tsx
     * import { useRouter } from "@ayonli/react-hooks"
     * import { Routes } from "react-router";
     * 
     * export default function App() {
     *     const router = useRouter()
     * 
     *     return (
     *         <Routes key={router.key}>
     *             ....
     *         </Routes>
     *     )
     * }
     * ```
     */
    key: string
    /**
     * The parameters of the current route.
     */
    params: Readonly<P>
    /**
     * Arbitrary data stored in the current location when `push` or `replace`
     * is called.
     */
    state: unknown
    /**
     * Goes to the specified path and pushes the path to the history stack.
     * 
     * This function automatically handles relative paths and absolute paths,
     * when the path is a cross-origin URL, it will open the URL in a new tab.
     */
    push: (to: string | URL | URLSearchParams, options?: PushOptions) => void
    /**
     * Goes to the specified path and replaces the path in the same place of the
     * history stack.
     * 
     * This function automatically handles relative paths and absolute paths,
     * when the path is a cross-origin URL, it will open the URL in the same tab.
     */
    replace: (to: string | URL | URLSearchParams, options?: ReplaceOptions) => void
    /**
     * Goes to the specified number of pages in the history stack.
     */
    go: (delta: number) => void
    /**
     * Goes forward one page.
     */
    forward: () => void
    /**
     * Goes back one page.
     */
    back: () => void
    /**
     * Reloads the current page. This function rerenders the current page component
     * instead of reloading the entire page, unless `fullPage` is set to `true`.
     * 
     * NOTE: The `key` must be used as a `key` of the top level element in the
     * `<App>` component in order for the `reload` function to work correctly.
     */
    reload: (fullPage?: boolean) => void
}

/**
 * Returns the {@link PageRouter} object, which contains the methods for
 * manipulating the route and retrieving route parameters.
 * 
 * NOTE: This hook only works with history-based routing, it does not work with
 * hash-based routing.
 * 
 * @example
 * ```tsx
 * import { useRouter } from "@ayonli/react-hooks"
 * import { render } from "@testing-library/react"
 * import { userEvent } from "@testing-library/user-event"
 * 
 * export default function HomeView() {
 *     const router = useRouter()
 * 
 *     return (
 *         <div>
 *             <h1>Welcome Home</h1>
 *             <button onClick={() => router.push("/profile")}>My Profile</button>
 *         </div>
 *     )
 * }
 * 
 * const dom = render(<View />)
 * 
 * console.log(location.pathname) // "/"
 * 
 * const button = dom.getByText("My Profile")
 * await userEvent.click(button)
 * 
 * console.log(location.pathname) // "/profile"
 * ```
 */
export default function useRouter<P extends Record<string, string | undefined>>(): PageRouter<P> {
    const { key, state } = useLocation()
    const params = useParams() as Readonly<P>
    const _push = useNavigate()

    const push = useCallback((to: To | URL | URLSearchParams, options: NavigateOptions = {}) => {
        if (typeof to === "string") {
            if (to.startsWith("?")) {
                to = new URLSearchParams(to)
            } else {
                to = new URL(to, location.origin)
            }
        }

        if (to instanceof URL) {
            const { origin, pathname, search, hash, href } = to

            if (origin === location.origin) {
                return _push({ pathname, search, hash }, options)
            } else if (options.replace) {
                location.href = href
            } else {
                globalThis.open(href, "_blank")
            }
        } else if (to instanceof URLSearchParams) {
            const query = to.toString()

            if (query) {
                return _push(location.pathname + "?" + query + location.hash)
            } else {
                return _push(location.pathname + location.hash)
            }
        } else {
            return _push(to, options)
        }
    }, [_push])
    const replace = useCallback((to: To | URL | URLSearchParams, options: ReplaceOptions = {}) => {
        const { silent = false, ...rest } = options

        if (typeof to === "string") {
            if (to.startsWith("?")) {
                to = new URLSearchParams(to)
            } else {
                to = new URL(to, location.origin)
            }
        }

        if (!silent) {
            push(to, {
                ...rest,
                replace: true,
            })
        } else {
            let path: string | undefined

            if (to instanceof URL) {
                path = to.href
            } else if (to instanceof URLSearchParams) {
                const query = to.toString()

                if (query) {
                    path = location.pathname + "?" + query + location.hash
                } else {
                    path = location.pathname + location.hash
                }
            } else {
                path = (to.pathname ?? "/") + (to.search ?? "") + (to.hash ?? "")
            }

            globalThis.history.replaceState(null, "", path)
        }
    }, [push])
    const go = useCallback((delta: number) => _push(delta), [_push])
    const forward = useCallback(() => _push(1), [_push])
    const back = useCallback(() => _push(-1), [_push])
    const reload = useCallback((fullPage = false) => {
        if (fullPage) {
            location.reload()
        } else {
            replace(location)
        }
    }, [replace])

    const ref = useRef<PageRouter<P>>()
    const router = (ref.current ??= {} as PageRouter<P>)
    Object.assign(router, { key, params, state, push, replace, go, forward, back, reload })

    return router
}
