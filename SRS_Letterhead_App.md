# Software Requirements Specification
## Letterhead Generator — Desktop Application
**Version:** 1.0  
**Date:** June 2026  
**Status:** Draft

---

## 1. Overview

A cross-platform desktop application that allows company staff to generate professional letterheads by selecting a visual template, filling in company details, and exporting a finished document in both PDF and DOCX format. The application is intended to grow into a broader company document suite; letterhead generation is the first module.

---

## 2. Goals

- Allow non-technical users to produce consistent, branded letterheads in under 2 minutes.
- Support multiple visual templates, each with unique decorative elements and field positions.
- Output files that are both printable (PDF) and editable (DOCX).
- Make adding new templates a developer task requiring no changes to core application logic.

---

## 3. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Desktop shell | Electron | Cross-platform app, file system access, print/PDF |
| UI framework | React 18 | Component-based interface |
| Styling | Tailwind CSS + shadcn/ui | UI components and design system |
| Document generation | docx.js (`npm install docx`) | Programmatic DOCX assembly |
| PDF export | Electron `webContents.printToPDF` | Render HTML template → PDF |
| Template definitions | TypeScript modules (one per template) | Layout, field positions, decorative elements |
| Build tool | Vite + electron-vite | Fast dev/build pipeline |
| Language | TypeScript throughout | Type safety across templates and field schemas |

---

## 4. Application Layout

The main window is split into two panels:

```
┌─────────────────────────────────────────────────────────┐
│  [Template picker — top bar or sidebar]                 │
├──────────────────────────┬──────────────────────────────┤
│                          │                              │
│   LEFT PANEL             │   RIGHT PANEL                │
│   Input & editing        │   Live preview               │
│   fields                 │   (scales to A4/Letter)      │
│                          │                              │
│                          │                              │
├──────────────────────────┴──────────────────────────────┤
│  [Export bar: Generate DOCX]  [Export PDF]  [Print]     │
└─────────────────────────────────────────────────────────┘
```

- Left panel is fixed-width (~380px), scrollable if fields overflow.
- Right panel fills remaining width, shows a proportionally scaled A4 preview that updates live as the user types.
- The preview is rendered as HTML/CSS (matching the template exactly) and is used as the PDF source as well.

---

## 5. Template Picker

- Displayed as a horizontal scrollable gallery at the top of the window, or as a collapsible sidebar — TBD in design phase.
- Each template card shows: a thumbnail image, a short name (e.g. "Blue Flag", "Classic Line", "Minimal").
- Selecting a template updates the preview immediately and may show/hide certain input fields that are relevant only to that template.
- The active template is highlighted.

---

## 6. Input Fields (Left Panel)

All fields are optional unless marked required. Each field has a visibility toggle (checkbox or switch) so the user can include or exclude it from the output. Toggling a field off removes it from the preview and the generated document.

### 6.1 Logo
| Property | Detail |
|---|---|
| Type | Image upload |
| Formats accepted | PNG, JPG, SVG |
| Toggle | "Include logo" switch (on by default) |
| Behaviour | When enabled, user can drag-and-drop or click to upload. The template defines where the logo is placed and its max dimensions. |
| Default | No logo (placeholder shown in preview) |

### 6.2 Company Name
| Property | Detail |
|---|---|
| Type | Text input(s) |
| Language mode | Three options: English only / Arabic only / Both |
| English field | Plain text input |
| Arabic field | RTL text input (appears when Arabic or Both is selected) |
| Toggle | "Include company name" switch (on by default) |
| Note | When "Both" is selected, the template determines which appears on top and how they are spaced. |

### 6.3 Commercial Registration (C.R.)
| Property | Detail |
|---|---|
| Label | "C.R." |
| Type | Text input (numbers, may include slashes or dashes) |
| Toggle | On by default |
| Prefix | The label "C.R.:" is rendered by the template; the user enters the number only |

### 6.4 Post Office Box (P.O.)
| Property | Detail |
|---|---|
| Label | "P.O. Box" |
| Type | Numeric text input |
| Toggle | On by default |

### 6.5 Postal Code (P.C.)
| Property | Detail |
|---|---|
| Label | "P.C." |
| Type | Numeric text input |
| Toggle | On by default |

### 6.6 Address
| Property | Detail |
|---|---|
| Label | "Address" |
| Type | Text input |
| Default value | "Sultanate of Oman" (pre-filled, user can override) |
| Toggle | On by default |

### 6.7 Telephone (TEL)
| Property | Detail |
|---|---|
| Label | "Tel." |
| Type | Text input (phone number format) |
| Toggle | On by default |

### 6.8 Email
| Property | Detail |
|---|---|
| Label | "Email" |
| Type | Text input (email format) |
| Toggle | On by default |

### 6.9 Field Layout Notes
- Fields in the left panel are always displayed in the order listed above.
- Toggling a field off in the panel removes it from the preview and output — it does not disappear from the panel itself (the toggle stays visible so the user can re-enable it).
- Each template independently determines where each field is rendered on the page (header, footer, left column, right column, etc.).

---

## 7. Live Preview (Right Panel)

- Rendered as a live HTML/CSS representation of the selected template with current field values injected.
- Scaled down to fit the panel (CSS `transform: scale(...)` so it always shows full A4 proportions).
- Updates in real time as the user types — no generate button needed for preview.
- Shows placeholder text (greyed out) for fields that are toggled on but have no value yet.
- Correctly renders Arabic text RTL and mixed Arabic/English layouts.

---

## 8. Export

### 8.1 PDF Export
- Uses Electron's `webContents.printToPDF()` on the preview HTML.
- Page size: A4 (default) — configurable per template if needed.
- Margins: defined per template in the template module.
- Decorative elements (flag shapes, lines, background blocks) are part of the HTML/CSS and export exactly as they appear in preview.
- Opens a native Save dialog for the user to choose location and filename.

### 8.2 DOCX Export
- Generated programmatically using `docx.js`.
- Each template module exports a `generateDocx(fields: FieldValues): Document` function.
- Decorative elements that can be represented in DOCX (solid color blocks, horizontal lines, header/footer colored bands) are implemented using docx.js drawing primitives.
- Complex decorative shapes (e.g. a diagonal flag shape) that cannot be faithfully reproduced in DOCX are approximated as close as possible, or a note is included in the SRS per template.
- Opens a native Save dialog.

### 8.3 Export Bar
- "Export DOCX" button — generates and saves `.docx`.
- "Export PDF" button — generates and saves `.pdf`.
- "Print" button — opens the system print dialog using Electron's print API.

---

## 9. Template Architecture

This is the most critical section for developers adding new templates.

### 9.1 What a Template Is
Each template is a folder inside `/src/templates/` containing:

```
/src/templates/
  blue-flag/
    index.ts          ← template definition and exports
    preview.tsx       ← React component: the live HTML/CSS preview
    thumbnail.png     ← shown in the template picker gallery
  classic-line/
    index.ts
    preview.tsx
    thumbnail.png
  ...
```

### 9.2 Template Definition (`index.ts`)
Every template exports a typed object conforming to the `TemplateDefinition` interface:

```typescript
export interface TemplateDefinition {
  id: string;                    // unique slug, e.g. "blue-flag"
  name: string;                  // display name, e.g. "Blue Flag"
  thumbnail: string;             // path to thumbnail image
  pageSize: 'A4' | 'Letter';
  supportedFields: FieldKey[];   // which fields this template uses
  generateDocx: (fields: FieldValues) => Document;  // docx.js output
  // preview is handled by preview.tsx (React component)
}
```

### 9.3 Field Values Schema
The shared type that all templates receive:

```typescript
interface FieldValues {
  logo?: string;              // base64 image data URI or null
  companyNameEn?: string;
  companyNameAr?: string;
  cr?: string;                // C.R. number
  poBox?: string;
  postalCode?: string;
  address?: string;           // default: "Sultanate of Oman"
  tel?: string;
  email?: string;
  // a field being undefined means the user toggled it off
}
```

### 9.4 Preview Component (`preview.tsx`)
A React component that receives `FieldValues` as props and renders the letterhead using HTML and CSS. This is what the user sees in the right panel and what gets printed to PDF. The developer uses absolute positioning, CSS shapes, borders, and background colors to replicate the template's decorative elements exactly.

```typescript
export const BlueFlagPreview: React.FC<{ fields: FieldValues }> = ({ fields }) => {
  // returns JSX matching the template design
};
```

### 9.5 Adding a New Template (Developer Checklist)
1. Create `/src/templates/<slug>/` folder.
2. Add `thumbnail.png` — a screenshot or mockup of the finished letterhead at ~300×420px.
3. Build `preview.tsx` — recreate the template visually in React/CSS. Use pixel-perfect absolute positioning. The canvas is always A4 at 794×1123px (96dpi equivalent) internally, scaled by CSS transform to fit the panel.
4. Build `generateDocx()` in `index.ts` — implement the same layout using docx.js primitives.
5. Register the template in `/src/templates/registry.ts` — add it to the exported array.
6. Done. No other files need to change.

### 9.6 Positioning Strategy
Because each template has a unique layout for where fields appear (top-right for some, footer for others, inside a colored band for others), positioning is handled **per template** in the preview component and docx generator. There is no global field position system — the template owns its layout entirely.

For the HTML preview, this means using:
- `position: absolute` inside a relatively positioned A4 canvas div.
- Coordinates defined in pixels at 794px width (A4 at 96dpi).

For DOCX:
- Headers and footers via docx.js `Header` / `Footer` objects.
- Positioned content via text boxes (`TextBox`) for off-grid placement.
- Tab stops for inline column alignment (e.g. label left, value right).

---

## 10. Decorative Elements — Implementation Approach

Templates may include static visual elements that are not user-editable. These are handled differently in HTML/CSS (preview + PDF) versus DOCX.

| Decorative Element | HTML/CSS approach | DOCX approach |
|---|---|---|
| Solid horizontal line at top | `border-top` or `<div>` with height + background-color | Paragraph with bottom border, or header rule |
| Colored header band | `<div>` with background-color spanning full width | Header with shaded paragraph |
| Flag shape (geometric) | CSS `clip-path` or SVG embedded in JSX | Image embedded as `.png` (pre-exported from the design) |
| Side stripe | `position: absolute` div with background-color | Left border on paragraphs, or embedded image |
| Decorative Arabic calligraphy or emblem | `<img>` embedded as asset | `ImageRun` in docx.js |

**Rule:** If a decorative shape cannot be cleanly reproduced in docx.js, it is exported as a pre-rendered PNG asset and embedded as an image in the DOCX. The developer exports this PNG from the design mockup at 300dpi.

---

## 11. Persistence & Settings

- The app remembers the last-used field values using Electron's `electron-store` (local JSON, not a database).
- On next launch, fields are pre-populated with the previous session's values.
- The user can clear saved values via a "Reset to defaults" button.
- No cloud sync, no accounts, no network required.

---

## 12. Internationalization

- The UI itself (labels, buttons) is in English only for v1.
- Arabic text in the letterhead (company name field) is fully supported: RTL direction, proper font (e.g. Noto Naskh Arabic, bundled with the app).
- Mixed Arabic/English rendering on the same line is handled in the preview using `dir="auto"` and Unicode bidi.

---

## 13. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Preview update latency | < 100ms after keystroke (debounced at 50ms) |
| PDF export time | < 3 seconds for a single A4 page |
| DOCX export time | < 1 second |
| Supported OS | Windows 10+, macOS 12+, Ubuntu 20.04+ |
| Window minimum size | 1024 × 700px |
| Offline operation | Fully offline — no internet required |
| Installer size | < 150MB |

---

## 14. Out of Scope (v1)

- Multi-page document body (the letterhead is header/footer only; body content is not entered in this app).
- Cloud storage or sharing.
- User accounts or permissions.
- Template editor UI (templates are code-only in v1).
- Fonts other than those bundled with the app.
- Any document type other than letterhead (invoices, memos — planned for later modules).

---

## 15. Open Questions

| # | Question | Owner |
|---|---|---|
| 1 | What is the full list of templates needed at launch? | Soda / client |
| 2 | Should the app be branded (named, with its own icon)? | Soda |
| 3 | DOCX fidelity for complex shapes — acceptable to use embedded PNG fallback? | Soda / client |
| 4 | Button field details (the additional footer fields mentioned) — full spec pending | Soda |
| 5 | Does the Arabic company name use a specific font (e.g. a branded Arabic typeface)? | Soda / client |
| 6 | Should field values (C.R., P.O. etc.) be saveable as multiple "profiles" (e.g. for multiple company branches)? | Soda |
