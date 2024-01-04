import { defineConfig, splitVendorChunkPlugin, Plugin } from "vite"
import react from "@vitejs/plugin-react"
import wasm from "vite-plugin-wasm"
import svgr from "vite-plugin-svgr"
import tsconfigPaths from "vite-tsconfig-paths"
import fs from "fs/promises"
import glob from "glob"
import { resolve, relative, extname } from "node:path"
import { fileURLToPath } from "node:url"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    build: {
      target: "esnext",
      outDir: "build",
    },
    optimizeDeps: {
      esbuildOptions: {
        target: "esnext",
      },
    },
    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" },
    },
    plugins: [
      splitVendorChunkPlugin(),
      tsconfigPaths(),
      react({
        jsxImportSource: "@basilisk/jsx",
        babel: {
          plugins: ["@emotion/babel-plugin"],
        },
      }),
      wasm(),
      svgr(),
      transformIndexHtml({
        basePath: "src/pages",
      }),
    ],
  }
})

function transformIndexHtml(options: {
  basePath: string
  metadataFileName?: string
  templatePath?: string
  indexFileName?: string
}): Plugin {
  const { basePath, metadataFileName, templatePath, indexFileName } =
    Object.assign(
      {
        metadataFileName: "metadata.json",
        indexFileName: "index.html",
        templatePath: "./index.html",
      },
      options,
    )

  return {
    name: "transform-index-html",
    apply: "build",
    config: async () => {
      const template = await fs.readFile(resolve(__dirname, templatePath))
      const defaults = await parseMetadata(`${basePath}/${metadataFileName}`)

      const pages = glob.sync(`${basePath}/**/${metadataFileName}`)

      const processFiles = pages.map(async (pathname) => {
        const pageMeta = await parseMetadata(pathname)
        const metadata = {
          ...defaults,
          ...pageMeta,
        }

        const pagePath = pathname.replace(metadataFileName, indexFileName)

        return fs.writeFile(
          resolve(__dirname, pagePath),
          template
            .toString()
            .replace(/<%=\s*(\w+)\s*%>/gi, (_match, p1) => metadata[p1] || ""),
        )
      })

      await Promise.all(processFiles)
      return {
        build: {
          rollupOptions: {
            input: Object.fromEntries([
              ["index", resolve(__dirname, indexFileName)],
              ...glob.sync(`${basePath}/**/${indexFileName}`).map((file) => {
                return [
                  relative(
                    basePath,
                    file.slice(0, file.length - extname(file).length),
                  ),
                  fileURLToPath(new URL(file, import.meta.url)),
                ]
              }),
            ]),
          },
        },
      }
    },
  }
}

async function parseMetadata(path: string) {
  let metadata = {}
  try {
    const file = await fs.readFile(resolve(__dirname, path))

    metadata = JSON.parse(file.toString())
  } catch {}

  return metadata
}
