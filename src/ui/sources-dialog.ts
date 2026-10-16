import { GP_READER, KIAN_JAM } from "../content/source-links";

export function createSourcesDialog(host: HTMLElement) {
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "sources-trigger";
  trigger.setAttribute("aria-label", "Sources and learning materials");
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.title = "Sources and learning materials";
  trigger.innerHTML = `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 18" fill="currentColor"><path d="m13.73635 5.85251 4.00467-4.11665 2.3248 2.3808-4.20064 4.00466h5.9085v3.30473h-5.9365l4.22865 4.10766-2.3248 2.3338L12.0005 12.099l-5.74052 5.76852-2.3248-2.3248 4.22864-4.10766h-5.9375V8.12132h5.9085L3.93417 4.11666l2.3248-2.3808 4.00468 4.11665V0h3.4727z"/></svg>`;

  const repository = document.createElement("a");
  repository.className = "repository-link";
  repository.href = "https://github.com/qiweiii/jam-3d";
  repository.target = "_blank";
  repository.rel = "noopener noreferrer";
  repository.title = "JAM 3D on GitHub";
  repository.setAttribute("aria-label", "JAM 3D on GitHub (opens in a new tab)");
  // GitHub mark from Simple Icons (CC0).
  repository.innerHTML = `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`;

  const dialog = document.createElement("dialog");
  dialog.className = "sources-dialog";
  dialog.setAttribute("aria-labelledby", "sources-title");
  dialog.innerHTML = `<div class="sources-panel">
    <header class="sources-heading">
      <h2 id="sources-title">Sources & Learning Materials</h2>
      <button class="sources-close" type="button" aria-label="Close sources" autofocus>×</button>
    </header>
    <ul class="sources-list">
      <li><a href="https://graypaper.com/" target="_blank" rel="noopener noreferrer">The Gray Paper <span aria-hidden="true">↗</span></a><p>JAM’s technical specification.</p></li>
      <li><a href="${GP_READER}" target="_blank" rel="noopener noreferrer">Gray Paper Reader · Fluffy Labs <span aria-hidden="true">↗</span></a><p>Interactive Gray Paper reader.</p></li>
      <li><a href="https://www.youtube.com/watch?v=wbnTnBQNDr4&amp;list=PLwcnAOKMj-Ab7sDej2P4peqGxu2mTGYNy" target="_blank" rel="noopener noreferrer">Gray Paper Lectures · Gavin Wood <span aria-hidden="true">↗</span></a><p>Video walkthrough of the Gray Paper.</p></li>
      <li><a href="${KIAN_JAM}" target="_blank" rel="noopener noreferrer">Demystifying JAM · Kian <span aria-hidden="true">↗</span></a><p>Cores, computation and data availability explained.</p></li>
      <li><a href="https://docs.jamcha.in/" target="_blank" rel="noopener noreferrer">JAM Implementers’ Knowledge Base <span aria-hidden="true">↗</span></a><p>Unofficial, community-maintained resources.</p></li>
      <li><a href="https://www.parity.io/blog/jam-what-it-is-how-it-works" target="_blank" rel="noopener noreferrer">JAM: What It Is, How It Works · Parity <span aria-hidden="true">↗</span></a><p>JAM’s architecture and Polkadot’s intended transition.</p></li>
      <li><a href="https://github.com/paritytech/polkadot-sdk/pull/11883" target="_blank" rel="noopener noreferrer">Parachain Service Design · Proposal <span aria-hidden="true">↗</span></a><p>Proposed parachain architecture on JAM.</p></li>
      <li><a href="https://hackmd.io/@xlc/HydGnfZ8C" target="_blank" rel="noopener noreferrer">JAM Diagrams · xlc <span aria-hidden="true">↗</span></a><p>Transaction flows and network diagrams.</p></li>
    </ul>
  </div>`;

  trigger.addEventListener("click", () => dialog.showModal());
  dialog.querySelector(".sources-close")!.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  host.append(trigger, repository, dialog);

  return {
    dispose() {
      if (dialog.open) dialog.close();
      dialog.remove();
      trigger.remove();
      repository.remove();
    },
  };
}
