import { defineConfig } from "vite";
export default defineConfig({
    build: {
        sourcemap: "inline",
        outDir: "./dist"
    },
    server: {
        port: 3000,
    }
});