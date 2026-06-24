import type { Document } from 'docx'

export type LanguageMode = 'en' | 'ar' | 'both'

export type FieldKey =
  | 'logo'
  | 'companyName'
  | 'cr'
  | 'poBox'
  | 'postalCode'
  | 'address'
  | 'tel'
  | 'email'

/** The actual values injected into a template (a field being undefined = toggled off). */
export interface FieldValues {
  logo?: string // base64 data URI
  companyNameEn?: string
  companyNameAr?: string
  languageMode?: LanguageMode
  cr?: string
  poBox?: string
  postalCode?: string
  address?: string
  tel?: string
  email?: string
}

/** Editing state in the left panel: every field plus its on/off toggle. */
export interface EditorState {
  enabled: Record<FieldKey, boolean>
  values: {
    logo: string
    companyNameEn: string
    companyNameAr: string
    languageMode: LanguageMode
    cr: string
    poBox: string
    postalCode: string
    address: string
    tel: string
    email: string
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

export const DEFAULT_EDITOR_STATE: EditorState = {
  enabled: {
    logo: true,
    companyName: true,
    cr: true,
    poBox: true,
    postalCode: true,
    address: true,
    tel: true,
    email: true
  },
  values: {
    logo: '',
    companyNameEn: 'GOLDEN IDEA FOR TRADING AND INVESTMENT SPC',
    companyNameAr: 'الفكرة الذهبية للتجارة والاستثمار ش.ش.و',
    languageMode: 'en',
    cr: '1610803',
    poBox: '12',
    postalCode: '111',
    address: 'Sultanate of Oman',
    tel: '+968 77487290',
    email: 'info@alwardi.com'
  }
}

/**
 * Collapse the editor state into the FieldValues a template consumes:
 * a disabled field becomes undefined so the template simply omits it.
 */
export function toFieldValues(state: EditorState): FieldValues {
  const { enabled, values } = state
  return {
    logo: enabled.logo && values.logo ? values.logo : undefined,
    companyNameEn: enabled.companyName ? values.companyNameEn || undefined : undefined,
    companyNameAr: enabled.companyName ? values.companyNameAr || undefined : undefined,
    languageMode: values.languageMode,
    cr: enabled.cr ? values.cr || undefined : undefined,
    poBox: enabled.poBox ? values.poBox || undefined : undefined,
    postalCode: enabled.postalCode ? values.postalCode || undefined : undefined,
    address: enabled.address ? values.address || undefined : undefined,
    tel: enabled.tel ? values.tel || undefined : undefined,
    email: enabled.email ? values.email || undefined : undefined
  }
}
