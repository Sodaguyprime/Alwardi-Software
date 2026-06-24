# Alwardi Software — Letterhead Generator

A cross-platform desktop app (Electron + React + TypeScript) for generating
professional, branded letterheads. Fill in company details, see a live A4
preview, and export to **PDF**, **DOCX**, or **Print**. First module of a wider
company document suite.

Built to the spec in [`SRS_Letterhead_App.md`](./SRS_Letterhead_App.md).

## Quick start

```bash
npm install
npm run dev      # launch the app in development (hot reload)
```

Other scripts:

```bash
npm run build    # type-check + build to ./out
npm run start    # build then run the production app
```

## How it works

- **Left panel** — input fields, each with an on/off toggle. The company name
  supports English / Arabic / Both. v1 defaults to English.
- **Right panel** — live A4 preview that updates as you type. The preview is
  pure inline-styled HTML, so it doubles as the exact source for PDF and Print
  (what you see is what you export).
- **Export bar** — `Export DOCX`, `Export PDF`, `Print`, and `Reset to defaults`.
- Field values are remembered between sessions via `electron-store`.

## Project structure

```
src/
  main/index.ts        Electron main: window, PDF (printToPDF), DOCX save, store
  preload/index.ts     Secure IPC bridge (window.api)
  renderer/
    index.html
    src/
      App.tsx           App shell + state + persistence
      types.ts          FieldValues / TemplateDefinition / editor state
      components/        FieldPanel, PreviewPanel, TemplatePicker, ExportBar
      lib/exporters.ts  Standalone-HTML builder, DOCX packer, print
      templates/
        registry.ts     The list of available templates
        golden-idea/    First template (matches Templates/FirstTemplateExample.png)
          index.ts        definition + generateDocx()
          preview.tsx     React/CSS preview (also the PDF source)
          thumbnail.png
```

## Adding a new template

1. Create `src/renderer/src/templates/<slug>/`.
2. Add `thumbnail.png` (~300×420).
3. Build `preview.tsx` — recreate the design with inline styles on a
   `794×1123` (A4 @ 96dpi) canvas using absolute positioning.
4. Build `generateDocx()` in `index.ts` using docx.js primitives.
5. Register it in `registry.ts`.

No other files need to change.

## Notes

- **Arabic** is fully supported in the data model and renders RTL; the UI itself
  is English-only per the SRS. Switch the Company Name mode to "Arabic" or
  "Both" to include it.
- **DOCX decorative fidelity**: the diagonal diamond corner shapes are
  CSS/`clip-path` in the preview/PDF; in DOCX they are approximated with
  colored bands and rules (per SRS §10). A pre-rendered PNG fallback can be
  added later if pixel-exact DOCX corners are required.

## Dev tooling

`scripts/` contains a small render harness used to visually verify a template
(`verify-render.tsx` → standalone HTML → `verify-png.cjs` screenshot via
Electron). Not part of the shipped app.
"# Alwardi-Software" 
