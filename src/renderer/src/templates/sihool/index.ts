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
import { SihoolPreview } from './preview'
import thumbnail from './thumbnail.jpeg'

const PRIMARY_DEFAULT = '1b3a6b'
const ACCENT_DEFAULT = '2f6fb0'

const NO_BORDERS = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
}

function buildHeader(fields: FieldValues): Header {
  const PRIMARY = hexNoHash(fields.colors?.primary, PRIMARY_DEFAULT)
  const nameSize = Math.round(22 * (fields.nameScale ?? 1))

  const logoChildren: Paragraph[] = []
  const ls = fields.logoScale ?? 1
  const decoded = fields.logo ? dataUriToBytes(fields.logo) : null
  if (decoded) {
    logoChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new ImageRun({ data: decoded.bytes, transformation: { width: Math.round(120 * ls), height: Math.round(50 * ls) } })]
      })
    )
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
                width: { size: 38, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    children: fields.companyNameEn
                      ? [new TextRun({ text: fields.companyNameEn, bold: true, size: nameSize, color: PRIMARY })]
                      : []
                  })
                ]
              }),
              new TableCell({
                width: { size: 24, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                children: logoChildren.length ? logoChildren : [new Paragraph({ text: '' })]
              }),
              new TableCell({
                width: { size: 38, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    bidirectional: true,
                    children: fields.companyNameAr
                      ? [new TextRun({ text: fields.companyNameAr, bold: true, size: nameSize, color: PRIMARY })]
                      : []
                  })
                ]
              })
            ]
          })
        ]
      }),
      new Paragraph({
        text: '',
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: PRIMARY } },
        spacing: { before: 40, after: 0 }
      })
    ]
  })
}

function buildFooter(fields: FieldValues): Footer {
  const PRIMARY = hexNoHash(fields.colors?.primary, PRIMARY_DEFAULT)
  const ACCENT = hexNoHash(fields.colors?.accent, ACCENT_DEFAULT)
  const arFirst = (fields.order ?? 'ar') === 'ar'
  const fsz = Math.round(16 * (fields.footerScale ?? 1))
  const line = footerLine(fields)
  const lineAr = arabicFooter(fields)

  const arPara = lineAr
    ? new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: true,
        children: [new TextRun({ text: lineAr, bold: true, size: fsz, color: PRIMARY })]
      })
    : null
  const enPara = line
    ? new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: line, bold: true, size: fsz, color: PRIMARY })]
      })
    : null
  const band = new Paragraph({
    text: '',
    shading: { fill: ACCENT },
    spacing: { before: 40, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: ACCENT } }
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

export const sihoolTemplate: TemplateDefinition = {
  id: 'sihool',
  name: 'Sihool Masirah',
  thumbnail,
  pageSize: 'A4',
  colorRoles: [
    { key: 'primary', label: 'Text & lines (navy)', default: '#1b3a6b' },
    { key: 'accent', label: 'Waves (blue)', default: '#2f6fb0' }
  ],
  lineControl: { label: 'Divider line position', min: -40, max: 200 },
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
  Preview: SihoolPreview,
  generateDocx
}

export default sihoolTemplate
