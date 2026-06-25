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
import { PlainsPreview } from './preview'
import thumbnail from './thumbnail.jpeg'

const PRIMARY_DEFAULT = '2a9bd6'
const INK_DEFAULT = '1b1b1b'

const NO_BORDERS = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
}

/** A shaded table cell holding a single centred line of white text. */
function shadedCell(
  text: string,
  fill: string,
  width: number,
  opts: { rtl?: boolean; size?: number } = {}
): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    verticalAlign: VerticalAlign.CENTER,
    shading: { fill },
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: opts.rtl,
        children: [new TextRun({ text, bold: true, size: opts.size ?? 22, color: 'FFFFFF' })]
      })
    ]
  })
}

function buildHeader(fields: FieldValues): Header {
  const PRIMARY = hexNoHash(fields.colors?.primary, PRIMARY_DEFAULT)
  const INK = hexNoHash(fields.colors?.ink, INK_DEFAULT)
  const nameSize = Math.round(22 * (fields.nameScale ?? 1))
  const children: (Table | Paragraph)[] = [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: NO_BORDERS,
      rows: [
        new TableRow({
          children: [
            shadedCell(fields.companyNameEn ?? '', INK, 58, { size: nameSize }),
            shadedCell(fields.companyNameAr ?? '', PRIMARY, 42, { rtl: true, size: nameSize })
          ]
        })
      ]
    })
  ]

  // Logo, centred just below the two title boxes.
  const decoded = fields.logo ? dataUriToBytes(fields.logo) : null
  if (decoded) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120 },
        children: [new ImageRun({ data: decoded.bytes, transformation: { width: 150, height: 60 } })]
      })
    )
  }

  return new Header({ children })
}

function buildFooter(fields: FieldValues): Footer {
  const PRIMARY = hexNoHash(fields.colors?.primary, PRIMARY_DEFAULT)
  const INK = hexNoHash(fields.colors?.ink, INK_DEFAULT)
  const fsz = Math.round(16 * (fields.footerScale ?? 1))
  return new Footer({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: NO_BORDERS,
        rows: [
          new TableRow({
            children: [
              shadedCell(footerLine(fields), PRIMARY, 50, { size: fsz }),
              shadedCell(arabicFooter(fields), INK, 50, { rtl: true, size: fsz })
            ]
          })
        ]
      })
    ]
  })
}

export function generateDocx(fields: FieldValues): Document {
  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1600, bottom: 1600, left: 1000, right: 1000 }
          }
        },
        headers: { default: buildHeader(fields) },
        footers: { default: buildFooter(fields) },
        children: [new Paragraph({ text: '' })]
      }
    ]
  })
}

export const plainsTemplate: TemplateDefinition = {
  id: 'plains',
  name: 'Plains Business',
  thumbnail,
  pageSize: 'A4',
  colorRoles: [
    { key: 'primary', label: 'Accent (blue)', default: '#2a9bd6' },
    { key: 'ink', label: 'Frame / boxes (black)', default: '#1b1b1b' }
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
  Preview: PlainsPreview,
  generateDocx
}

export default plainsTemplate
