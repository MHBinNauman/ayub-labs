// Runs the Playwright suite with prefers-reduced-motion: reduce emulated
// (see playwright.config.ts). A script rather than `REDUCED_MOTION=1 ...`
// so it works in PowerShell too. Extra arguments pass through.
import { spawnSync } from "node:child_process";

const { status } = spawnSync(
  "pnpm",
  ["exec", "playwright", "test", ...process.argv.slice(2)],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, REDUCED_MOTION: "1" },
  },
);
process.exit(status ?? 1);
