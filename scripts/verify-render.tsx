import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { writeFileSync, readFileSync } from 'fs'
import path from 'path'
import { GoldenIdeaPreview } from '../src/renderer/src/templates/golden-idea/preview'
import { toArabicDigits } from '../src/renderer/src/types'
import type { FieldValues } from '../src/renderer/src/types'

const logo =
  'data:image/png;base64,' +
  readFileSync(path.join(__dirname, '../Logo/Logo.png')).toString('base64')

const fields: FieldValues = {
  logo,
  watermark: logo,
  companyNameEn: 'GOLDEN IDEA FOR TRADING AND INVESTMENT SPC',
  companyNameAr: 'الفكرة الذهبية للتجارة والاستثمار ش.ش.و',
  cr: '1610803',
  crAr: toArabicDigits('1610803'),
  poBox: '12',
  poBoxAr: toArabicDigits('12'),
  postalCode: '111',
  postalCodeAr: toArabicDigits('111'),
  address: 'Sultanate of Oman',
  addressAr: 'سلطنة عمان',
  tel: '+968 77487290',
  telAr: toArabicDigits('+968 77487290')
}

const body = renderToStaticMarkup(React.createElement(GoldenIdeaPreview, { fields }))
const html = `<!doctype html><html><head><meta charset="utf-8"/><style>@page{size:A4;margin:0}html,body{margin:0;padding:0}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style></head><body>${body}</body></html>`
writeFileSync('scripts/verify.html', html)
console.log('wrote scripts/verify.html')
