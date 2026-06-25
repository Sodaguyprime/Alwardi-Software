import type { FieldValues } from '../types'
import { ltrIsolate } from '../types'

/**
 * Single-line English contact string, e.g.
 * "C.R: 1610803, P. O: 12, P. C: 111, SULTANATE OF OMAN, TEL:+968 77487290".
 * Shared by every template's preview and DOCX builders.
 */
export function footerLine(fields: FieldValues): string {
  const parts: string[] = []
  if (fields.cr) parts.push(`C.R: ${fields.cr}`)
  if (fields.poBox) parts.push(`P. O: ${fields.poBox}`)
  if (fields.postalCode) parts.push(`P. C: ${fields.postalCode}`)
  if (fields.address) parts.push(fields.address.toUpperCase())
  if (fields.tel) parts.push(`TEL:${fields.tel}`)
  if (fields.email) parts.push(fields.email)
  return parts.join(', ')
}

/** Arabic-side contact string. Numbers are LTR-isolated so they read correctly. */
export function arabicFooter(fields: FieldValues): string {
  const parts: string[] = []
  if (fields.crAr) parts.push(`س.ت:${ltrIsolate(fields.crAr)}`)
  if (fields.poBoxAr) parts.push(`ص.ب:${ltrIsolate(fields.poBoxAr)}`)
  if (fields.postalCodeAr) parts.push(`ر.ب:${ltrIsolate(fields.postalCodeAr)}`)
  if (fields.addressAr) parts.push(fields.addressAr)
  if (fields.telAr) parts.push(`هاتف:${ltrIsolate(fields.telAr)}`)
  if (fields.emailAr) parts.push(ltrIsolate(fields.emailAr))
  return parts.join('، ')
}

/** Strip a leading `#` so a colour can be used by docx (which wants bare hex). */
export function hexNoHash(value: string | undefined, fallback: string): string {
  return (value ?? '').replace(/^#/, '') || fallback
}

/** Decode a base64 data URI into the bytes docx's ImageRun expects. */
export function dataUriToBytes(uri: string): { bytes: Uint8Array; type: 'png' | 'jpg' } | null {
  const match = /^data:image\/(png|jpe?g);base64,(.*)$/.exec(uri)
  if (!match) return null
  const type = match[1].startsWith('jp') ? 'jpg' : 'png'
  const binary = atob(match[2])
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return { bytes, type }
}
