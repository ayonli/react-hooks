import { defineConfig } from "vite"

export default defineConfig({
    test: {
        setupFiles: ["./vitest-setup.tsx"],
        environment: "jsdom",
        globals: true,
    }
})
