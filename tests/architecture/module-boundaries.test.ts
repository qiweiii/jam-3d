import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const sourceRoot = fileURLToPath(new URL("../../src/", import.meta.url));
const files = readdirSync(sourceRoot, { recursive: true }).filter(
  (file) => file.endsWith(".ts") && !file.endsWith(".d.ts"),
);
const imports = files.flatMap((file) => {
  const absolute = resolve(sourceRoot, file);
  const source = readFileSync(absolute, "utf8");
  // Include multiline declarations, type imports, side-effect CSS and named re-exports.
  // No compiler API dependency: this project uses the native TypeScript compiler.
  const declarations = /^\s*(?:import|export)\s+(?:(?:type\s+)?[\w$*{},\s]+?\s+from\s+)?["'](\.[^"']+)["']/gm;
  return [...source.matchAll(declarations)].map((match) => {
    const target = resolve(dirname(absolute), match[1]!);
    const resolved = target.endsWith(".ts") || target.endsWith(".css") ? target : `${target}.ts`;
    return {
      from: file.replaceAll("\\", "/"),
      to: relative(sourceRoot, resolved).replaceAll("\\", "/"),
      absolute: resolved,
    };
  });
});

test("all local module imports resolve directly, without directory barrels or legacy paths", () => {
  for (const entry of imports) assert.ok(existsSync(entry.absolute), `${entry.from} → ${entry.to}`);
  for (const old of ["experience", "scene"]) {
    assert.ok(!files.some((file) => file.startsWith(`${old}/`)), `Legacy ${old} modules remain`);
  }
});

test("graphics, playback and shared content do not import application or feature policy", () => {
  for (const { from, to } of imports) {
    if (from.startsWith("graphics/")) assert.ok(to.startsWith("graphics/"), `${from} → ${to}`);
    if (from.startsWith("playback/")) assert.ok(to.startsWith("playback/"), `${from} → ${to}`);
    if (from.startsWith("content/")) assert.ok(to.startsWith("content/"), `${from} → ${to}`);
  }
});

test("features cannot reach another feature's internals or application composition", () => {
  for (const { from, to } of imports) {
    if (!from.startsWith("features/")) continue;
    assert.ok(!to.startsWith("app/"), `${from} → ${to}`);
    if (to.startsWith("features/")) assert.equal(from.split("/")[1], to.split("/")[1], `${from} → ${to}`);
  }
});

test("shared world geometry and reusable controls do not depend on feature implementations", () => {
  for (const { from, to } of imports) {
    if (from.startsWith("world/") || from.startsWith("ui/")) {
      assert.ok(!to.startsWith("features/"), `${from} → ${to}`);
      if (from !== "ui/navigation.ts") assert.ok(!to.startsWith("app/"), `${from} → ${to}`);
    }
  }
});

test("the source module graph has no circular dependencies, including type imports", () => {
  const edges = new Map(files.map((file) => [file.replaceAll("\\", "/"), [] as string[]]));
  for (const { from, to } of imports) edges.get(from)!.push(to);
  const visited = new Set<string>();
  const visit = (file: string, path: string[]) => {
    assert.ok(!path.includes(file), [...path, file].join(" → "));
    if (visited.has(file)) return;
    for (const target of edges.get(file) ?? []) visit(target, [...path, file]);
    visited.add(file);
  };
  for (const file of edges.keys()) visit(file, []);
});
