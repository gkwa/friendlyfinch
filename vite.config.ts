import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import { resolve } from "path"

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [
        /node:.*/,
        "commander",
        "mdast-util-from-markdown",
        "mdast-util-gfm",
        "mdast-util-to-markdown",
        "micromark-extension-gfm",
        "picocolors",
        "remark-gfm",
        "remark-parse",
        "unified",
        "unist-util-visit",
      ],
    },
    sourcemap: true,
    minify: false,
  },
  plugins: [dts()],
})
