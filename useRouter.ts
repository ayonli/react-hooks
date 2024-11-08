import { useState } from "react"
import { NavigateOptions, To, useNavigate, useParams } from "react-router"

export interface PageRouter {
    /**
     * The parameters of the current route.
     */
    params: Record<string, string>
    /**
     * Goes to the specified path and pushes the path to the history stack.
     * 
     * This function automatically handles relative paths and absolute paths,
     * when the path is a cross-origin URL, it will open the URL in a new tab.
     */
    push: (to: To | URLSearchParams, options?: NavigateOptions) => void
    /**
     * Goes to the specified path and replaces the path in the same place of the
     * history stack.
     * 
     * This function automatically handles relative paths and absolute paths,
     * when the path is a cross-origin URL, it will open the URL in the same tab.
     */
    replace: (to: To | URLSearchParams, options?: Omit<NavigateOptions, "replace"> & {
        /**
         * Replace the URL but do not trigger page reload.
         */
        silent?: boolean
    }) => void
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
 * export default function View() {
 *     const router = useRouter()
 * 
 *     return (
 *         <div>
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
export default function useRouter(): PageRouter {
    const params = useParams()
    const _push = useNavigate()
    const [router] = useState(() => {
        const push = (to: To | URLSearchParams, options: NavigateOptions = {}) => {
            if (typeof to === "object") {
                if (to instanceof URLSearchParams) {
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

            const { origin, pathname, search, hash, href } = new URL(to, location.origin)

            if (origin === location.origin && !pathname.startsWith("/api/")) {
                return _push({ pathname, search, hash }, options)
            } else if (options.replace) {
                location.href = href
            } else {
                window.open(href, "_blank")
            }
        }

        const replace = (to: To | URLSearchParams, options: Omit<NavigateOptions, "replace"> & {
            /**
             * Replace the URL but do not trigger page reload.
             */
            silent?: boolean
        } = {}) => {
            const { silent = false, ...rest } = options

            if (silent) {
                if (typeof to === "object") {
                    let path: string | undefined

                    if (to instanceof URLSearchParams) {
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
                    return
                } else {
                    const { origin, href } = new URL(to, location.origin)

                    if (origin === location.origin) {
                        window.history.replaceState(null, "", href)
                        return
                    }
                }
            }

            return push(to, {
                ...rest,
                replace: true,
            })
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
                    replace(location.href)
                }
            }
        }
    })

    return router as PageRouter
}
