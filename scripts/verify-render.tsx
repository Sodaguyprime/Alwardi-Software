import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { writeFileSync } from 'fs'
import { GoldenIdeaPreview } from '../src/renderer/src/templates/golden-idea/preview'
import type { FieldValues } from '../src/renderer/src/types'

const fields: FieldValues = {
  companyNameEn: 'GOLDEN IDEA FOR TRADING AND INVESTMENT SPC',
  companyNameAr: 'الفكرة الذهبية للتجارة والاستثمار ش.ش.و',
  languageMode: 'en',
  cr: '1610803',
  poBox: '12',
  postalCode: '111',
  address: 'Sultanate of Oman',
  tel: '+968 77487290'
}

const body = renderToStaticMarkup(React.createElement(GoldenIdeaPreview, { fields }))
const html = `<!doctype html><html><head><meta charset="utf-8"/><style>@page{size:A4;margin:0}html,body{margin:0;padding:0}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style></head><body>${body}</body></html>`
writeFileSync('scripts/verify.html', html)
console.log('wrote scripts/verify.html')
