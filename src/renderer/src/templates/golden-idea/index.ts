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
  VerticalAlign,
  HorizontalPositionAlign,
  HorizontalPositionRelativeFrom,
  VerticalPositionAlign,
  VerticalPositionRelativeFrom
} from 'docx'
import type { FieldValues, TemplateDefinition } from '../../types'
import { ltrIsolate } from '../../types'
import { GoldenIdeaPreview } from './preview'
import thumbnail from './thumbnail.png'

const GOLD = 'F2C200'
const INK = '111111'

/** Decode a base64 data URI into the bytes docx's ImageRun expects. */
function dataUriToBytes(uri: string): { bytes: Uint8Array; type: 'png' | 'jpg' } | null {
  const match = /^data:image\/(png|jpe?g);base64,(.*)$/.exec(uri)
  if (!match) return null
  const type = match[1].startsWith('jp') ? 'jpg' : 'png'
  const binary = atob(match[2])
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return { bytes, type }
}

/** A full-width paragraph that renders as a solid gold band. */
function goldBand(): Paragraph {
  return new Paragraph({
    text: '',
    shading: { fill: GOLD },
    spacing: { before: 40, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 18, color: GOLD }
    }
  })
}

function footerLine(fields: FieldValues): string {
  const parts: string[] = []
  if (fields.cr) parts.push(`C.R: ${fields.cr}`)
  if (fields.poBox) parts.push(`P. O: ${fields.poBox}`)
  if (fields.postalCode) parts.push(`P. C: ${fields.postalCode}`)
  if (fields.address) parts.push(fields.address.toUpperCase())
  if (fields.tel) parts.push(`TEL:${fields.tel}`)
  if (fields.email) parts.push(fields.email)
  return parts.join(', ')
}

function arabicFooterLine(fields: FieldValues): string {
  const parts: string[] = []
  if (fields.crAr) parts.push(`س.ت:${ltrIsolate(fields.crAr)}`)
  if (fields.poBoxAr) parts.push(`ص.ب:${ltrIsolate(fields.poBoxAr)}`)
  if (fields.postalCodeAr) parts.push(`ر.ب:${ltrIsolate(fields.postalCodeAr)}`)
  if (fields.addressAr) parts.push(fields.addressAr)
  if (fields.telAr) parts.push(`هاتف:${ltrIsolate(fields.telAr)}`)
  if (fields.emailAr) parts.push(ltrIsolate(fields.emailAr))
  return parts.join('، ')
}

function buildHeader(fields: FieldValues): Header {
  const arFirst = (fields.order ?? 'ar') === 'ar'
  const nameAr = fields.companyNameAr
    ? new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: true,
        children: [new TextRun({ text: fields.companyNameAr, bold: true, size: 30, color: INK })]
      })
    : null
  const nameEn = fields.companyNameEn
    ? new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: fields.companyNameEn, bold: true, size: 22, color: GOLD })]
      })
    : null
  const nameParagraphs: Paragraph[] = (arFirst ? [nameAr, nameEn] : [nameEn, nameAr]).filter(
    (p): p is Paragraph => p !== null
  )

  // Logo cell content
  const logoChildren: Paragraph[] = []
  const decoded = fields.logo ? dataUriToBytes(fields.logo) : null
  if (decoded) {
    logoChildren.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: decoded.bytes,
            transformation: { width: 90, height: 64 }
          })
        ]
      })
    )
  } else {
    logoChildren.push(new Paragraph({ text: '' }))
  }

  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            children: logoChildren
          }),
          new TableCell({
            width: { size: 80, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            children: nameParagraphs.length ? nameParagraphs : [new Paragraph({ text: '' })]
          })
        ]
      })
    ]
  })

  return new Header({
    children: [
      headerTable,
      new Paragraph({
        text: '',
        border: { bottom: { style: BorderStyle.SINGLE, size: 24, color: INK } },
        spacing: { before: 40, after: 0 }
      })
    ]
  })
}

function buildFooter(fields: FieldValues): Footer {
  const arFirst = (fields.order ?? 'ar') === 'ar'
  const line = footerLine(fields)
  const lineAr = arabicFooterLine(fields)
  const arPara = lineAr
    ? new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: true,
        children: [new TextRun({ text: lineAr, bold: true, size: 16, color: INK })]
      })
    : null
  const enPara = line
    ? new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: line, bold: true, size: 16, color: INK })]
      })
    : null
  const ordered = (arFirst ? [arPara, enPara] : [enPara, arPara]).filter(
    (p): p is Paragraph => p !== null
  )
  return new Footer({ children: [goldBand(), ...ordered] })
}

/** A page-centred watermark image sitting behind the document text. */
function buildWatermark(fields: FieldValues): Paragraph[] {
  const decoded = fields.watermark ? dataUriToBytes(fields.watermark) : null
  if (!decoded) return []
  return [
    new Paragraph({
      children: [
        new ImageRun({
          data: decoded.bytes,
          transformation: { width: 320, height: 320 },
          floating: {
            horizontalPosition: {
              relative: HorizontalPositionRelativeFrom.PAGE,
              align: HorizontalPositionAlign.CENTER
            },
            verticalPosition: {
              relative: VerticalPositionRelativeFrom.PAGE,
              align: VerticalPositionAlign.CENTER
            },
            behindDocument: true,
            allowOverlap: true
          }
        })
      ]
    })
  ]
}

export function generateDocx(fields: FieldValues): Document {
  const body = [...buildWatermark(fields), new Paragraph({ text: '' })]
  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4 in twips
            margin: { top: 1700, bottom: 1700, left: 1000, right: 1000 }
          }
        },
        headers: { default: buildHeader(fields) },
        footers: { default: buildFooter(fields) },
        children: body
      }
    ]
  })
}

export const goldenIdeaTemplate: TemplateDefinition = {
  id: 'golden-idea',
  name: 'Golden Idea',
  thumbnail,
  pageSize: 'A4',
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
  Preview: GoldenIdeaPreview,
  generateDocx
}

export default goldenIdeaTemplate
