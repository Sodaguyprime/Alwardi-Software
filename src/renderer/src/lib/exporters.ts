import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Packer } from 'docx'
import type { FieldValues, TemplateDefinition } from '../types'

/**
 * Render the selected template's preview to a self-contained A4 HTML document.
 * Because the preview uses only inline styles, the markup is fully portable —
 * this same HTML is what gets printed to PDF, guaranteeing preview === output.
 */
export function buildStandaloneHtml(template: TemplateDefinition, fields: FieldValues): string {
  const body = renderToStaticMarkup(React.createElement(template.Preview, { fields }))
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
</style>
</head>
<body>${body}</body>
</html>`
}

/** Generate the DOCX and hand its bytes to the main process for saving. */
export async function exportDocx(
  template: TemplateDefinition,
  fields: FieldValues
): Promise<{ ok: boolean; path?: string }> {
  const doc = template.generateDocx(fields)
  const blob = await Packer.toBlob(doc)
  const buffer = await blob.arrayBuffer()
  return window.api.exportDocx(buffer)
}

/** Print via a hidden iframe carrying the standalone A4 HTML. */
export function printLetterhead(template: TemplateDefinition, fields: FieldValues): void {
  const html = buildStandaloneHtml(template, fields)
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)
  const doc = iframe.contentWindow?.document
  if (!doc) return
  doc.open()
  doc.write(html)
  doc.close()
  iframe.onload = () => {
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
    setTimeout(() => document.body.removeChild(iframe), 1000)
  }
}
