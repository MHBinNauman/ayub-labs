import { defineConfig, devices } from "@playwright/test";

const port = 3000;
const baseURL = `http://localhost:${port}`;

// REDUCED_MOTION=1 (pnpm test:e2e:reduced) runs the whole suite as a
// visitor who asked for less motion. Set only then: in the normal run each
// spec's own setting (test.use or contextOptions) must not be overridden.
// Specs about motion itself pin reducedMotion, so they behave the same in
// both runs.
const reducedMotionRun = process.env.REDUCED_MOTION === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    timezoneId: "Asia/Karachi",
    ...(reducedMotionRun && { reducedMotion: "reduce" as const }),
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  // Runs against the production build: `pnpm build` first.
  webServer: {
    command: "pnpm start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
