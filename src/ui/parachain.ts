/** A service-scene breadcrumb, separate from the machine's zoom navigation. */
export function createParachainHeader(host: HTMLElement, onExit: () => void) {
  const root = document.createElement("header");
  root.className = "parachain-heading";
  root.innerHTML = '<button type="button" aria-label="Back to Machine">← Back</button><h1>Parachain Service</h1>';
  root.querySelector("button")!.addEventListener("click", onExit);
  root.hidden = true;
  host.append(root);
  return {
    setVisible: (visible: boolean) => {
      root.hidden = !visible;
    },
    dispose: () => root.remove(),
  };
}
