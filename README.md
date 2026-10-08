# JAM 3D

An interactive 3D tour of [JAM](https://graypaper.com/). Start with a high-level view of the machine, then zoom into a core to follow work packages through authorization, refinement and reporting. Continue through block production and the on-chain state transition, with hover explanations for protocol concepts and a separate walkthrough of the design tradeoffs behind JAM.

A visual companion for learning JAM alongside the Gray Paper. Use it to build intuition, connect the concepts as you read, or explain the protocol to someone else.

Copy follows Gray Paper 0.8.0. If a label and the paper disagree, the paper wins. This is an exhibit, not a protocol simulator.

## Run locally

Needs [Node.js](https://nodejs.org/) 22+ and [pnpm](https://pnpm.io/).

```bash
pnpm install
pnpm dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

```bash
pnpm build    # static files in dist/
pnpm preview  # serve that build
```
