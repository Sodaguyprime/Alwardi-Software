import {
  Document,
  Header,
  Footer,
  Paragraph,
  TextRun,
  ImageRun,
  AlignmentType,
  BorderStyle
} from 'docx'
import type { FieldValues, TemplateDefinition } from '../../types'
import { arabicFooter, dataUriToBytes, footerLine, hexNoHash } from '../shared'
import { KarmaPreview } from './preview'
import thumbnail from './thumbnail.jpeg'

const PRIMARY_DEFAULT = '1d5c8a'
const ACCENT_DEFAULT = 'b02a2a'
const INK_DEFAULT = '1a2733'

/** A full-width coloured band used at the top and bottom of the page. */
function band(color: string): Paragraph {
  return new Paragraph({
    text: '',
    shading: { fill: color },
    spacing: { before: 60, after: 60 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 18, color } }
  })
}

function buildHeader(fields: FieldValues): Header {
  const PRIMARY = hexNoHash(fields.colors?.primary, PRIMARY_DEFAULT)
  const INK = hexNoHash(fields.colors?.ink, INK_DEFAULT)
  const arFirst = (fields.order ?? 'ar') === 'ar'
  const ns = fields.nameScale ?? 1

  const children: Paragraph[] = []
  const decoded = fields.logo ? dataUriToBytes(fields.logo) : null
  if (decoded) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new ImageRun({ data: decoded.bytes, transformation: { width: 120, height: 50 } })]
      })
    )
  }

  const nameAr = fields.companyNameAr
    ? new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: true,
        children: [
          new TextRun({ text: fields.companyNameAr, bold: true, size: Math.round(30 * ns), color: INK })
        ]
      })
    : null
  const nameEn = fields.companyNameEn
    ? new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: fields.companyNameEn, bold: true, size: Math.round(28 * ns), color: INK })
        ]
      })
    : null
  ;(arFirst ? [nameAr, nameEn] : [nameEn, nameAr]).forEach((p) => p && children.push(p))
  children.push(band(PRIMARY))

  return new Header({ children: children.length ? children : [new Paragraph({ text: '' })] })
}

function buildFooter(fields: FieldValues): Footer {
  const PRIMARY = hexNoHash(fields.colors?.primary, PRIMARY_DEFAULT)
  const ACCENT = hexNoHash(fields.colors?.accent, ACCENT_DEFAULT)
  const INK = hexNoHash(fields.colors?.ink, INK_DEFAULT)
  const arFirst = (fields.order ?? 'ar') === 'ar'
  const fsz = Math.round(16 * (fields.footerScale ?? 1))
  const line = footerLine(fields)
  const lineAr = arabicFooter(fields)

  const arPara = lineAr
    ? new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: true,
        children: [new TextRun({ text: lineAr, bold: true, size: fsz, color: INK })]
      })
    : null
  const enPara = line
    ? new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: line, bold: true, size: fsz, color: ACCENT })]
      })
    : null
  const ordered = (arFirst ? [arPara, enPara] : [enPara, arPara]).filter(
    (p): p is Paragraph => p !== null
  )
  return new Footer({ children: [band(PRIMARY), ...ordered] })
}

export function generateDocx(fields: FieldValues): Document {
  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1700, bottom: 1700, left: 1000, right: 1000 }
          }
        },
        headers: { default: buildHeader(fields) },
        footers: { default: buildFooter(fields) },
        children: [new Paragraph({ text: '' })]
      }
    ]
  })
}

export const karmaTemplate: TemplateDefinition = {
  id: 'karma',
  name: 'Karma Business',
  thumbnail,
  pageSize: 'A4',
  colorRoles: [
    { key: 'primary', label: 'Waves (blue)', default: '#1d5c8a' },
    { key: 'accent', label: 'Footer accent', default: '#b02a2a' },
    { key: 'ink', label: 'Text', default: '#1a2733' }
  ],
  supportedFields: [
    'logo',
    'watermark',
    'companyName',
    'cr',
    'poBox',
    'postalCode',
    'address',
    'tel',
    'email'
  ],
  Preview: KarmaPreview,
  generateDocx
}

export default karmaTemplate
