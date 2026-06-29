import {
  Document,
  Header,
  Footer,
  Paragraph,
  TextRun,
  ImageRun,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign
} from 'docx'
import type { FieldValues, TemplateDefinition } from '../../types'
import { arabicFooter, dataUriToBytes, footerLine, hexNoHash } from '../shared'
import { ChevronPreview } from './preview'
import thumbnail from './thumbnail.jpeg'

const TEAL_DEFAULT = '27b9c4'
const ORANGE_DEFAULT = 'e8862e'
const RED_DEFAULT = 'c0392b'
const DARK_DEFAULT = '3a3a3a'

const NO_BORDERS = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
}

function buildHeader(fields: FieldValues): Header {
  const arFirst = (fields.order ?? 'ar') === 'ar'
  const TEAL = hexNoHash(fields.colors?.teal, TEAL_DEFAULT)
  const RED = hexNoHash(fields.colors?.name, RED_DEFAULT)
  const ns = fields.nameScale ?? 1

  const nameAr = fields.companyNameAr
    ? new Paragraph({
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        children: [new TextRun({ text: fields.companyNameAr, bold: true, size: Math.round(26 * ns), color: RED })]
      })
    : null
  const nameEn = fields.companyNameEn
    ? new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: fields.companyNameEn, bold: true, size: Math.round(18 * ns), color: TEAL })]
      })
    : null
  const nameParagraphs = (arFirst ? [nameAr, nameEn] : [nameEn, nameAr]).filter(
    (p): p is Paragraph => p !== null
  )

  const logoChildren: Paragraph[] = []
  const ls = fields.logoScale ?? 1
  const decoded = fields.logo ? dataUriToBytes(fields.logo) : null
  if (decoded) {
    logoChildren.push(
      new Paragraph({ children: [new ImageRun({ data: decoded.bytes, transformation: { width: Math.round(110 * ls), height: Math.round(60 * ls) } })] })
    )
  } else {
    logoChildren.push(new Paragraph({ text: '' }))
  }

  return new Header({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: NO_BORDERS,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                children: logoChildren
              }),
              new TableCell({
                width: { size: 70, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                children: nameParagraphs.length ? nameParagraphs : [new Paragraph({ text: '' })]
              })
            ]
          })
        ]
      }),
      new Paragraph({
        text: '',
        border: { bottom: { style: BorderStyle.SINGLE, size: 16, color: TEAL } },
        spacing: { before: 40, after: 0 }
      })
    ]
  })
}

function buildFooter(fields: FieldValues): Footer {
  const arFirst = (fields.order ?? 'ar') === 'ar'
  const ORANGE = hexNoHash(fields.colors?.orange, ORANGE_DEFAULT)
  const DARK = hexNoHash(fields.colors?.chevron, DARK_DEFAULT)
  const fsz = Math.round(16 * (fields.footerScale ?? 1))
  const line = footerLine(fields)
  const lineAr = arabicFooter(fields)

  const arPara = lineAr
    ? new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: true,
        children: [new TextRun({ text: lineAr, bold: true, size: fsz, color: DARK })]
      })
    : null
  const enPara = line
    ? new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: line, bold: true, size: fsz, color: DARK })]
      })
    : null
  const band = new Paragraph({
    text: '',
    shading: { fill: ORANGE },
    spacing: { before: 40, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 14, color: ORANGE } }
  })
  const ordered = (arFirst ? [arPara, enPara] : [enPara, arPara]).filter(
    (p): p is Paragraph => p !== null
  )
  return new Footer({ children: [band, ...ordered] })
}

export function generateDocx(fields: FieldValues): Document {
  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1500, bottom: 1600, left: 1000, right: 1000 }
          }
        },
        headers: { default: buildHeader(fields) },
        footers: { default: buildFooter(fields) },
        children: [new Paragraph({ text: '' })]
      }
    ]
  })
}

export const chevronTemplate: TemplateDefinition = {
  id: 'chevron',
  name: 'Chevron',
  thumbnail,
  pageSize: 'A4',
  colorRoles: [
    { key: 'teal', label: 'Bands & English name (teal)', default: '#27b9c4' },
    { key: 'orange', label: 'Accents & footer (orange)', default: '#e8862e' },
    { key: 'name', label: 'Arabic name (red)', default: '#c0392b' },
    { key: 'chevron', label: 'Arrows & text (grey)', default: '#3a3a3a' }
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
  Preview: ChevronPreview,
  generateDocx
}

export default chevronTemplate
