import { defineConfig } from "vite";
import { patchCssModules } from "vite-css-modules";

export default defineConfig({
  plugins: [
    patchCssModules({ generateSourceTypes: true, exportMode: "named", declarationMap: true }),
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es", "cjs"], // "cjs" only needed for jest :(
    },
    rolldownOptions: {
      external: ["./editframe-styles.css"]
    }
  },
});
