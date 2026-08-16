import { defineConfig } from "vite";

export default defineConfig({
  // Relative assets work for both username.github.io and
  // username.github.io/repository-name without editing the repository name.
  base: "./",
  build: {
    target: "es2022",
    sourcemap: true,
  },
});
