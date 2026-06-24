import type { Document } from 'docx'

export type FieldKey =
  | 'logo'
  | 'watermark'
  | 'companyName'
  | 'cr'
  | 'poBox'
  | 'postalCode'
  | 'address'
  | 'tel'
  | 'email'

/** Fields that can carry an Arabic counterpart (everything except the images). */
export type ArabicFieldKey = Exclude<FieldKey, 'logo' | 'watermark'>

/** Which language is rendered first (top line / footer line). */
export type LangOrder = 'ar' | 'en'

/** The actual values injected into a template (a field being undefined = toggled off). */
export interface FieldValues {
  logo?: string // base64 data URI
  watermark?: string // base64 data URI, rendered centred behind the body
  /** Render order between the two languages. */
  order?: LangOrder
  companyNameEn?: string
  companyNameAr?: string
  cr?: string
  crAr?: string
  poBox?: string
  poBoxAr?: string
  postalCode?: string
  postalCodeAr?: string
  address?: string
  addressAr?: string
  tel?: string
  telAr?: string
  email?: string
  emailAr?: string
}

/** Editing state in the left panel: every field plus its on/off + Arabic toggles. */
export interface EditorState {
  /** Master on/off per field. */
  enabled: Record<FieldKey, boolean>
  /** Arabic on/off per (translatable) field. */
  arEnabled: Record<ArabicFieldKey, boolean>
  /** Which language is shown first across the letterhead. */
  langOrder: LangOrder
  values: {
    logo: string
    watermark: string
    companyNameEn: string
    companyNameAr: string
    cr: string
    crAr: string
    poBox: string
    poBoxAr: string
    postalCode: string
    postalCodeAr: string
    address: string
    /** Arabic translation typed by the user. */
    addressAr: string
    tel: string
    telAr: string
    email: string
    emailAr: string
  }
}

export interface TemplateDefinition {
  id: string
  name: string
  thumbnail: string
  pageSize: 'A4' | 'Letter'
  supportedFields: FieldKey[]
  Preview: React.FC<{ fields: FieldValues }>
  generateDocx: (fields: FieldValues) => Document
}

/** Convert any Western digits in a string to Arabic-Indic numerals (٠-٩). */
export function toArabicDigits(input: string): string {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  return input.replace(/[0-9]/g, (d) => digits[Number(d)])
}

/**
 * Wrap a (numeric) string in Unicode directional isolates so it always reads
 * left-to-right, even inside an Arabic RTL line. Without this, phone numbers
 * and the like get visually reordered by the bidi algorithm.
 */
export function ltrIsolate(input: string): string {
  // U+2066 LEFT-TO-RIGHT ISOLATE … U+2069 POP DIRECTIONAL ISOLATE
  return '⁦' + input + '⁩'
}

export const DEFAULT_EDITOR_STATE: EditorState = {
  enabled: {
    logo: true,
    watermark: true,
    companyName: true,
    cr: true,
    poBox: true,
    postalCode: true,
    address: true,
    tel: true,
    email: true
  },
  arEnabled: {
    companyName: false,
    cr: false,
    poBox: false,
    postalCode: false,
    address: false,
    tel: false,
    email: false
  },
  langOrder: 'ar',
  values: {
    logo: '',
    watermark: '',
    companyNameEn: '',
    companyNameAr: '',
    cr: '',
    crAr: '',
    poBox: '',
    poBoxAr: '',
    postalCode: '',
    postalCodeAr: '',
    address: '',
    addressAr: '',
    tel: '',
    telAr: '',
    email: '',
    emailAr: ''
  }
}

/**
 * Collapse the editor state into the FieldValues a template consumes:
 * a disabled field becomes undefined so the template simply omits it.
 * Arabic values are only emitted when that field's Arabic toggle is on;
 * numeric fields auto-convert their digits to Arabic-Indic numerals.
 */
export function toFieldValues(state: EditorState): FieldValues {
  const { enabled, arEnabled, values } = state
  const on = (k: FieldKey): boolean => enabled[k]
  const arOn = (k: ArabicFieldKey): boolean => enabled[k] && arEnabled[k]

  return {
    order: state.langOrder,
    logo: on('logo') && values.logo ? values.logo : undefined,
    watermark: on('watermark') && values.watermark ? values.watermark : undefined,

    companyNameEn: on('companyName') ? values.companyNameEn || undefined : undefined,
    companyNameAr: arOn('companyName') ? values.companyNameAr || undefined : undefined,

    cr: on('cr') ? values.cr || undefined : undefined,
    crAr: arOn('cr') ? values.crAr || undefined : undefined,

    poBox: on('poBox') ? values.poBox || undefined : undefined,
    poBoxAr: arOn('poBox') ? values.poBoxAr || undefined : undefined,

    postalCode: on('postalCode') ? values.postalCode || undefined : undefined,
    postalCodeAr: arOn('postalCode') ? values.postalCodeAr || undefined : undefined,

    address: on('address') ? values.address || undefined : undefined,
    addressAr: arOn('address') ? values.addressAr || undefined : undefined,

    tel: on('tel') ? values.tel || undefined : undefined,
    telAr: arOn('tel') ? values.telAr || undefined : undefined,

    email: on('email') ? values.email || undefined : undefined,
    emailAr: arOn('email') ? values.emailAr || values.email || undefined : undefined
  }
}
