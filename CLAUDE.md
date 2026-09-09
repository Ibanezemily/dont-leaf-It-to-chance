@AGENTS.md

## Project

"Don't Leaf It to Chance" — a roll-and-move board game about a butterfly's
life cycle (egg → caterpillar → chrysalis → butterfly). No backend; all game
state lives in React state inside `src/App.tsx`. Trivia questions, action
cards, board tiles, and character/token art all came from a shared Figma
file via the design-to-code workflow — if new Figma links are shared for
this project, follow that same pattern: `get_design_context` →
`download_assets` → save into `src/imports/<Category>/`, then wire into
`App.tsx`.

## Actual styling convention (overrides AGENTS.md on this point)

Despite Tailwind being wired up in `vite.config.ts`, **the app does not use
Tailwind classes** — `src/App.tsx` uses inline `style={{ ... }}` objects
exclusively (zero `className` usage). Match this: new UI should use inline
styles, not Tailwind utilities, to stay consistent with the rest of the file.

## Design philosophy

The visual direction that's been steered toward, consistently, across many
rounds of feedback:

- **Flat, no depth effects.** No `box-shadow`, no `drop-shadow` filters, no
  pulsing/glowing effects, no CSS gradients anywhere. Solid colors only.
- **Neutral by default.** Borders, input fields, and body text default to
  grey (`#374151` text, `#d1d5db` borders) rather than tinted with an
  accent/brand color. An accent color (e.g. a selected character's color)
  should only touch the specific small element it's tied to — not
  propagate up to large containers like an outer card.
- **Cut labels that don't earn their place.** If a text label doesn't change
  anything or just repeats information already shown another way (e.g. via
  a color-coded border), prefer deleting it over restyling it.
- **No unexpected motion on hover/interaction** beyond background/border
  color changes — avoid `transform`/position shifts on hover unless asked.
- **No timed auto-dismiss** on anything with content to read (e.g. a trivia
  answer reveal) — require an explicit continue/next click instead.
- **Accessible contrast**: when reusing a color for button text, check
  contrast (~4.5:1 for white text) rather than assuming it's fine.

## Deployment

Public GitHub repo, deployed to GitHub Pages via `.github/workflows/deploy.yml`
on every push to `main`. Live at https://ibanezemily.github.io/dont-leaf-It-to-chance/.
The Vite `base` path is set at build time from the repo name — no manual
config needed if the repo is renamed. The favicon path in
`.figma/make/site.json` must stay **relative** (`favicon.svg`, not
`/favicon.svg`) since the site is served from a subpath, not a domain root.
