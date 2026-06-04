import jahia from "@jahia/vite-plugin";
import { spawnSync } from "node:child_process";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		jahia({
			watchCallback() {
				spawnSync("yarn", ["watch:callback"], { stdio: "inherit" });
			},
		}),
	],
});

