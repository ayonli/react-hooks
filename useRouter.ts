import { useState } from "react"
import { NavigateOptions, To, useNavigate, useParams } from "react-router"

export type PushOptions = Omit<NavigateOptions, "replace">

export type ReplaceOptions = Omit<NavigateOptions, "replace"> & {
    /**
     * Replace the URL but do not trigger page reload. This option is only
     * available with history-based routing.
     */
    silent?: boolean
}

export interface PageRouter<P extends Record<string, string | undefined>> {
    /**
     * The parameters of the current route.
     */
    params: Readonly<P>
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
     */
    reload: (fullPage?: boolean) => void
}

/**
 * Returns the {@link PageRouter} object, which contains the methods for
 * manipulating the route and retrieving the route parameters.
 * 
 * NOTE: This hook only works with history-based routing, it does not work with
 * hash-based routing.
 * 
 * @example
 * ```tsx
 * import useRouter from "./useRouter.ts"
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
    const params = useParams() as Readonly<P>
    const _push = useNavigate()
    const [router] = useState(() => {
        const push = (to: To | URL | URLSearchParams, options: NavigateOptions = {}) => {
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
                    window.open(href, "_blank")
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
        }

        const replace = (to: To | URL | URLSearchParams, options: ReplaceOptions = {}) => {
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

                window.history.replaceState(null, "", path)
            }
        }

        return {
            params,
            push,
            replace,
            go: (delta: number) => _push(delta),
            forward: () => _push(1),
            back: () => _push(-1),
            reload: (fullPage = false) => {
                if (fullPage) {
                    location.reload()
                } else {
                    replace(location)
                }
            }
        } satisfies PageRouter<P>
    })

    return router as PageRouter<P>
}
