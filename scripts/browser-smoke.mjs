import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { verifyAppLifecycle, verifyTourPolicies } from "./browser-cases.mjs";

// Uses an already-running server. Never launches Vite or installs a browser.
const url = process.env.BROWSER_URL ?? "http://localhost:5173";
const chromePath =
  process.env.CHROME_PATH ??
  (process.platform === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    : "/usr/bin/google-chrome");
const args = process.argv.slice(2);
const screenshots = args
  .find((arg) => arg.startsWith("--screenshots="))
  ?.split("=")
  .slice(1)
  .join("=");
const compare = args
  .find((arg) => arg.startsWith("--compare="))
  ?.split("=")
  .slice(1)
  .join("=");
const captureOnly = args.includes("--capture-only");
try {
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  assert.ok(response.ok, `Server responded with ${response.status}`);
} catch (cause) {
  throw new Error(`Start the development server yourself before running this check: ${url}`, { cause });
}
if (screenshots) await mkdir(screenshots, { recursive: true });
const profile = await mkdtemp(join(process.env.TMPDIR ?? tmpdir(), "jam-browser-smoke-"));
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] },
);
const exited = once(chrome, "exit");
let socket;
try {
  const debuggerUrl = await new Promise((resolve, reject) => {
    chrome.once("error", reject);
    chrome.stderr.on("data", (data) => {
      const match = String(data).match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) resolve(match[1]);
    });
  });
  socket = new WebSocket(debuggerUrl);
  await once(socket, "open");
  let nextId = 0;
  const requests = new Map();
  const errors = [];
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const request = requests.get(message.id);
      if (!request) return;
      requests.delete(message.id);
      if (message.error) request.reject(message.error);
      else request.resolve(message.result);
    } else if (message.method === "Runtime.exceptionThrown") errors.push(message.params);
  };
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      const timeout = setTimeout(() => {
        requests.delete(id);
        reject(new Error(`${method} timed out`));
      }, 30000);
      requests.set(id, {
        resolve: (result) => {
          clearTimeout(timeout);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });
      socket.send(JSON.stringify({ id, method, params, sessionId }));
    });
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const page = (method, params) => send(method, params, sessionId);
  const evaluate = async (expression) => {
    const result = await page("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const settle = () =>
    evaluate(
      `new Promise(resolve => { let count = 0; const tick = () => ++count === 10 ? resolve() : requestAnimationFrame(tick); requestAnimationFrame(tick); })`,
    );
  const navigate = async (route) => {
    const navigation = await page("Page.navigate", { url: `${url}/?browser-smoke#/${route}` });
    assert.ok(!navigation.errorText, navigation.errorText);
    const id = route.split("?")[0];
    await evaluate(
      `new Promise(resolve => { const check = () => { if (document.querySelector('#app')?.dataset.lod === '${id}' && document.querySelector('.tag')) document.fonts.ready.then(resolve); else requestAnimationFrame(check); }; check(); })`,
    );
    await settle();
  };
  await page("Runtime.enable");
  await page("Page.enable");
  await page("Page.addScriptToEvaluateOnNewDocument", {
    source:
      "let seed = 123; Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };",
  });
  await page("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const routes = [
    "machine",
    "core",
    "block",
    "stf",
    ...["package", "why", "parachain"].flatMap((id) => Array.from({ length: 6 }, (_, i) => `${id}?step=${i + 1}`)),
  ];
  const differences = [];
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
  ]) {
    await page("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 600 });
    for (const route of routes) {
      await navigate(route);
      if (screenshots) {
        const image = Buffer.from((await page("Page.captureScreenshot", { format: "png" })).data, "base64");
        const name = `${width}-${route.replace("?step=", "-")}.png`;
        await writeFile(join(screenshots, name), image);
        if (compare && !image.equals(await readFile(join(compare, name)))) differences.push(name);
      }
    }
  }
  if (!captureOnly) {
    for (const [width, height] of [
      [320, 667],
      [844, 390],
    ]) {
      await page("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 600 });
      await navigate("parachain?step=4");
      assert.ok(
        await evaluate(
          `(() => { const r = document.querySelector('[aria-label="Parachain Service flow"]').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight; })()`,
        ),
      );
    }
    await page("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await navigate("machine");
    await page("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
    });
    await evaluate("document.querySelector('.service-entry').click()");
    await settle();
    assert.equal(await evaluate("document.querySelector('#app').dataset.lod"), "parachain");
    assert.equal(
      await evaluate(
        'document.querySelector(\'[aria-label="Parachain Service flow"] [data-action="play"]\').textContent',
      ),
      "Pause",
    );
    await evaluate(
      `(() => { const panel = document.querySelector('[aria-label="Parachain Service flow"]'); const slider = panel.querySelector('input'); slider.value = 350; slider.dispatchEvent(new Event('input', { bubbles: true })); })()`,
    );
    await settle();
    assert.equal(
      await evaluate("document.querySelector('[aria-label=\"Parachain Service flow\"] input').value"),
      "350",
    );
    assert.equal(
      await evaluate(
        'document.querySelector(\'[aria-label="Parachain Service flow"] [data-action="play"]\').textContent',
      ),
      "Play",
    );
    await evaluate("document.querySelector('.parachain-heading button').click()");
    assert.equal(await evaluate("document.querySelector('#app').dataset.lod"), "machine");
    await page("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    await navigate("why?step=6");
    assert.equal(
      await evaluate('document.querySelector(\'[aria-label="Why JAM tour"] [data-action="next"]\').textContent'),
      "Finish",
    );
    await evaluate('document.querySelector(\'[aria-label="Why JAM tour"] [data-action="replay"]\').click()');
    await settle();
    assert.match(await evaluate("location.hash"), /why\?step=1/);
    await navigate("parachain?step=6");
    assert.equal(
      await evaluate('document.querySelector(\'[aria-label="Parachain Service flow"] [data-action="next"]\').hidden'),
      true,
    );
    await evaluate(`(${verifyTourPolicies.toString()})()`);
    await evaluate(`(${verifyAppLifecycle.toString()})()`);
  }
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({ routesChecked: 44, interactions: !captureOnly, screenshotDifferences: differences }, null, 2),
  );
  // Differences are reported for review, not blindly accepted or failed on subpixel antialiasing.
  await send("Browser.close");
  socket.close();
  await exited;
} finally {
  if (chrome.exitCode === null) {
    chrome.kill("SIGTERM");
    await exited;
  }
  socket?.close();
  await rm(profile, { recursive: true, force: true });
}
