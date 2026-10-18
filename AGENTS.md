# Project memory — Vellum (premium digital wedding invitation platform)

Standing rules for every agent/session working in this repo. Do not regress on these.

## ALWAYS use shadcn/ui for UI (permanent rule)

- This project is under the **shadcn/ui regime**: any new UI component — button, dialog,
  form control, toast, table, popover, card, animation — comes from the shadcn registry,
  not hand-rolled markup and not a random npm component library.
- Registry config lives in [`components.json`](components.json) (style `new-york`,
  Tailwind v4, CSS at `src/styles/globals.css`, aliases `@/components/*`).
- The class-merge helper is `cn()` from `src/lib/utils.ts` — always import from there,
  never from an `npm` package named `cn`.
- Install components with:

  ```bash
  npx shadcn@latest add <component> --yes
  npx shadcn@latest add @magicui/<component> --yes   # Magic UI animation engine
  ```

- **Gotcha on this machine (Windows + Git Bash):** sometimes shadcn writes files into a
  stray literal `./@/components/ui/` folder instead of `src/components/ui/`. If a component
  "created" by the CLI is missing from `src/components/ui/`, check for `./@/` and `mv` the
  files in, then delete the stray directory.
- Existing PascalCase originals (`Button.tsx`, `Modal.tsx`, `Field.tsx`, `Misc.tsx`,
  `Toast.tsx`) coexist with kebab-case shadcn drops. Imports are case-insensitive on
  Windows but match the existing `@/components/ui/Button` casing in new code.
- **Animation engine = Magic UI (`@magicui/*`)** preferred for any motion work, over
  bespoke framer-motion choreography. Installed so far: `confetti`, `blur-fade`,
  `sparkles-text` (deps: `canvas-confetti`, `motion`).
- Verify after adding: `npx tsc -p tsconfig.app.json --noEmit`.

## Reverse engineering reference sites with REA

- `rea-agents` (Reverse Engineer Anything) is a **project devDependency** — no global
  install needed. Use it to extract the *exact* design/behaviour of reference sites.

  ```bash
  npx rea --help
  npx rea doctor
  npx rea analyze-web-bundle <url>          # inspect a reference site's bundle
  npx rea capture-web-screenshot <origin>   # evidence screenshot
  npx rea export-web-scripts <url>          # pull the site's JS for static analysis
  ```

- Primary reference for this product: **sponsalia.app** (UK/EU digital wedding
  invitations). Named typography from its indexed templates: **Cormorant Garamond**,
  **Marcellus**, **Pinyon Script**; palettes — Villa Aurora (bronze/warm olive/antique
  gold), Golden Hour (gold/terracotta/cream), Toile de Jouy (blue on cream), Bloom
  (pink/green watercolour cartouche).
- Market: **UK weddings** — GBP pricing, UK dates/venues, British English copy.

## Design direction (brief)

- Everything **ornate and fancy**: scripts, Didones, engraved/decorative capitals. No
  default UI sans as a hero face, no stock photography, **no square/rectangular shapes** —
  arches, locket ovals, scallops, wax seals.
- Opening animation is the hero moment: seal break + bloom, with a bespoke sound effect
  (`src/lib/openingSound.ts`).