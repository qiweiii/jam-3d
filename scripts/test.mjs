import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = new URL("../tests/", import.meta.url);
const files = readdirSync(root, { recursive: true })
  .filter((name) => name.endsWith(".test.ts"))
  .sort()
  .map((name) => fileURLToPath(new URL(name.replaceAll("\\", "/"), root)));
assert.ok(files.length > 0, "No test files discovered");
const result = spawnSync(
  process.execPath,
  ["--experimental-strip-types", "--test", ...process.argv.slice(2), ...files],
  {
    stdio: "inherit",
  },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
