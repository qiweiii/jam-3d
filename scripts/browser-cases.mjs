/** Serialized into the browser by browser-smoke.mjs; keep these functions self-contained. */
export async function verifyTourPolicies() {
  const expect = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  const { createTourRegistry } = await import("/src/app/tour-registry.ts");
  const host = document.createElement("div");
  const destinations = [];
  const tours = createTourRegistry(host, (view) => destinations.push(view));
  const panel = (label) => host.querySelector(`[aria-label="${label}"]`);
  try {
    tours.setView("package", "machine", false);
    expect(tours.package.playback.snapshot().playing, "Package entry should autoplay");
    expect(tours.update("package", 0, false), "First Package pose should synchronize its URL");
    expect(!tours.update("package", 0, false), "Unchanged steps should not resynchronize");
    tours.selectStep("package", 3);
    expect(tours.stepNumber("package") === 3, "Direct Package step selection");
    tours.update("package", 0, false);
    panel("Work package journey").querySelector('[data-action="play"]').click();
    expect(!tours.package.playback.snapshot().playing, "Panel Pause should stop the clock");
    const slider = panel("Work package journey").querySelector("input");
    slider.value = 400;
    slider.dispatchEvent(new Event("input"));
    tours.update("package", 0.5, false);
    const scrubbed = tours.package.playback.snapshot();
    expect(Math.abs(scrubbed.elapsed / scrubbed.step.duration - 0.4) < 1e-10, "Scrubbing should stay paused");
    tours.package.playback.select(5);
    tours.package.playback.play(true);
    tours.update("package", tours.package.playback.snapshot().step.duration + 0.1, false);
    expect(tours.stepNumber("package") === 1 && tours.package.playback.snapshot().playing, "Package should loop");

    tours.setView("why", "package", false);
    expect(!tours.package.playback.snapshot().playing, "Leaving Package should pause its clock");
    expect(!tours.why.playback.snapshot().playing, "Why should remain manual");
    expect(tours.update("why", 0, false), "Why entry should synchronize its stop camera");
    panel("Why JAM tour").querySelector('[data-action="next"]').click();
    expect(tours.stepNumber("why") === 2 && !tours.why.playback.snapshot().playing, "Why Next should remain manual");
    tours.selectStep("why", 6);
    tours.update("why", 0, false);
    panel("Why JAM tour").querySelector('[data-action="next"]').click();
    expect(destinations.at(-1) === "machine", "Why Finish should return home");

    tours.setView("parachain", "why", true);
    expect(!tours.parachain.playback.snapshot().playing, "Reduced motion should disable entry autoplay");
    tours.update("parachain", 0, true);
    const reduced = tours.parachain.playback.snapshot();
    expect(reduced.elapsed === reduced.step.duration, "Reduced motion should show the endpoint");
    tours.parachain.playback.seek(1);
    tours.update("parachain", 0.5, true);
    expect(tours.parachain.playback.snapshot().elapsed === 1, "Reduced motion should respect explicit scrubbing");
    tours.setView("machine", "parachain", false);
    expect(tours.stepNumber("machine") === null, "Non-tour routes should have no step");
    tours.setView("parachain", "machine", false);
    expect(
      tours.stepNumber("parachain") === 1 && tours.parachain.playback.snapshot().playing,
      "Service reentry should restart and autoplay",
    );
    tours.pause("parachain");
    expect(!tours.parachain.playback.snapshot().playing, "Inspection should pause playback");
    tours.selectStep("parachain", 6);
    tours.update("parachain", 0, false);
    expect(
      panel("Parachain Service flow").querySelector('[data-action="next"]').hidden,
      "Final service Next should be hidden",
    );
    panel("Parachain Service flow").querySelector('[data-action="replay"]').click();
    expect(
      tours.stepNumber("parachain") === 1 && tours.parachain.playback.snapshot().playing,
      "Service Replay should restart",
    );
    tours.pauseAll();
    expect(!tours.parachain.playback.snapshot().playing, "Motion changes should pause tours");
  } finally {
    tours.dispose();
  }
  expect(host.children.length === 0, "Tour disposal should remove all owned UI");
}

export async function verifyAppLifecycle() {
  const { createApp } = await import("/src/app/create-app.ts");
  const bubbleCount = document.querySelectorAll(".bubble").length;
  for (let i = 0; i < 2; i++) {
    const host = document.createElement("div");
    document.body.append(host);
    const app = createApp(host);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    app.dispose();
    if (host.children.length || document.querySelectorAll(".bubble").length !== bubbleCount) {
      throw new Error("App disposal leaked DOM");
    }
    host.remove();
  }
}
