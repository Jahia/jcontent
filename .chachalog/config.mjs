/// @ts-check
/// <reference types="@chachalog/types" />
import fs from "node:fs";
import { defineConfig } from "chachalog";
import github from "chachalog/github";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));

export default defineConfig(() => ({
  allowedBumps: ["patch", "minor", "major"],
  platform: github({ base: "main" }),
  managers: {
    packages: {
      name: pkg.name,
      path: process.cwd(),
      // The -SNAPSHOT version bumps to the release version, e.g. 3.9.0-SNAPSHOT to 3.9.0 for a minor
      version: pkg.version,
    },
    // The Maven release sets the version of package.json, so chachalog leaves it as it is
    setVersion() {
      return true;
    },
  },
}));
