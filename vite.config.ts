import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import { extname, toFsPath } from "@ayonli/jsext/path"
import * as glob from "glob"

const moduleEntries = Object.fromEntries(
    glob.sync("**/*.ts", {
        ignore: [
            "**/*.d.ts",
            "node_modules/**",
            "*.config.ts",
            "*.test.ts",
        ],
    }).map(file => [
        file.slice(0, file.length - extname(file).length),
        toFsPath(new URL(file, import.meta.url).href)
    ])
)

export default defineConfig({
    build: {
        sourcemap: true,
        minify: false,
        emptyOutDir: true,
        lib: {
            entry: moduleEntries,
            formats: ["es"],
            fileName: (_format, entryName) => `${entryName}.js`,
        },
        rollupOptions: {
            external(id, importer, isResolved) {
                if (!importer) return false
                return isResolved ? id.includes("node_modules") : !id.startsWith(".")
            },
        },
    },
    plugins: [
        dts({
            include: Object.values(moduleEntries),
        })
    ],
    test: {
        setupFiles: ["./vitest-setup.tsx"],
        environment: "jsdom",
        globals: true,
    }
})
