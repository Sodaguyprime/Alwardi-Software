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
import { ThamerPreview } from './preview'
import thumbnail from './thumbnail.jpeg'

const NAVY_DEFAULT = '2e3192'
const ORANGE_DEFAULT = 'f7941e'

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
  const NAVY = hexNoHash(fields.colors?.navy, NAVY_DEFAULT)
  const ORANGE = hexNoHash(fields.colors?.orange, ORANGE_DEFAULT)
  const ns = fields.nameScale ?? 1

  const nameAr = fields.companyNameAr
    ? new Paragraph({
        alignment: AlignmentType.LEFT,
        bidirectional: true,
        children: [new TextRun({ text: fields.companyNameAr, bold: true, size: Math.round(28 * ns), color: ORANGE })]
      })
    : null
  const nameEn = fields.companyNameEn
    ? new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [new TextRun({ text: fields.companyNameEn, bold: true, size: Math.round(18 * ns), color: NAVY })]
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
                width: { size: 25, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                children: logoChildren
              }),
              new TableCell({
                width: { size: 75, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                children: nameParagraphs.length ? nameParagraphs : [new Paragraph({ text: '' })]
              })
            ]
          })
        ]
      }),
      new Paragraph({
        text: '',
        border: { bottom: { style: BorderStyle.SINGLE, size: 16, color: NAVY } },
        spacing: { before: 40, after: 0 }
      })
    ]
  })
}

function buildFooter(fields: FieldValues): Footer {
  const arFirst = (fields.order ?? 'ar') === 'ar'
  const NAVY = hexNoHash(fields.colors?.navy, NAVY_DEFAULT)
  const ORANGE = hexNoHash(fields.colors?.orange, ORANGE_DEFAULT)
  const fsz = Math.round(16 * (fields.footerScale ?? 1))
  const line = footerLine(fields)
  const lineAr = arabicFooter(fields)

  const arPara = lineAr
    ? new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: true,
        children: [new TextRun({ text: lineAr, bold: true, size: fsz, color: NAVY })]
      })
    : null
  const enPara = line
    ? new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: line, bold: true, size: fsz, color: NAVY })]
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

export const thamerTemplate: TemplateDefinition = {
  id: 'thamer',
  name: 'Abu Thamer',
  thumbnail,
  pageSize: 'A4',
  colorRoles: [
    { key: 'navy', label: 'English name & waves (navy)', default: '#2e3192' },
    { key: 'orange', label: 'Arabic name & waves (orange)', default: '#f7941e' }
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
  Preview: ThamerPreview,
  generateDocx
}

export default thamerTemplate
