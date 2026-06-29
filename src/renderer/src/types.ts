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
  /** Resolved template colours keyed by ColorRole.key (`#rrggbb`). */
  colors?: Record<string, string>
  /** Multiplier applied to the company-name font size (1 = template default). */
  nameScale?: number
  /** Multiplier applied to the footer contact-line font size (1 = template default). */
  footerScale?: number
  /** Multiplier applied to the logo's size (1 = template default). */
  logoScale?: number
  /** Vertical px offset for the template's divider line (+ lowers, − lifts). */
  lineOffset?: number
  /**
   * Free-layout drag offsets for the current template, keyed by element
   * (e.g. 'logo', 'title', 'footer'). Applied on top of each element's default
   * position so the user can nudge things around; honored by preview + PDF/print.
   */
  layout?: Record<string, { x: number; y: number }>
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
  /** Company-name font-size multiplier (1 = template default). */
  nameScale: number
  /** Footer contact-line font-size multiplier (1 = template default). */
  footerScale: number
  /** Logo size multiplier (1 = template default). */
  logoScale: number
  /** Vertical px offset for the divider line (templates that have one). */
  lineOffset: number
  /** Whether "Free move" (drag elements around) editing mode is active. */
  freeLayout: boolean
  /** Per-template drag offsets: layout[templateId][elementKey] = { x, y }. */
  layout: Record<string, Record<string, { x: number; y: number }>>
  /** Per-template colour overrides: colors[templateId][roleKey] = '#rrggbb'. */
  colors: Record<string, Record<string, string>>
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

/** A customizable colour exposed by a template (e.g. its brand/accent colour). */
export interface ColorRole {
  /** Stable key used to look the colour up in FieldValues.colors. */
  key: string
  /** Human label shown in the colour picker. */
  label: string
  /** Default value as a `#rrggbb` hex string. */
  default: string
}

export interface TemplateDefinition {
  id: string
  name: string
  thumbnail: string
  pageSize: 'A4' | 'Letter'
  supportedFields: FieldKey[]
  /** Colours the user is allowed to recolour for this template. */
  colorRoles?: ColorRole[]
  /** If set, the template has an adjustable divider line; shows a position control. */
  lineControl?: { label: string; min: number; max: number }
  Preview: React.FC<{ fields: FieldValues }>
  generateDocx: (fields: FieldValues) => Document
}

/**
 * Resolve the effective colours for a template: each role's saved override for
 * this template, falling back to the role's default. Always returns `#rrggbb`.
 */
export function resolveColors(
  template: TemplateDefinition,
  state: EditorState
): Record<string, string> {
  const overrides = state.colors[template.id] ?? {}
  const out: Record<string, string> = {}
  for (const role of template.colorRoles ?? []) {
    out[role.key] = overrides[role.key] ?? role.default
  }
  return out
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
  nameScale: 1,
  footerScale: 1,
  logoScale: 1,
  lineOffset: 0,
  freeLayout: false,
  layout: {},
  colors: {},
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
export function toFieldValues(state: EditorState, template?: TemplateDefinition): FieldValues {
  const { enabled, arEnabled, values } = state
  const on = (k: FieldKey): boolean => enabled[k]
  const arOn = (k: ArabicFieldKey): boolean => enabled[k] && arEnabled[k]

  return {
    order: state.langOrder,
    nameScale: state.nameScale,
    footerScale: state.footerScale,
    logoScale: state.logoScale,
    lineOffset: state.lineOffset,
    layout: template ? state.layout[template.id] : undefined,
    colors: template ? resolveColors(template, state) : undefined,
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
