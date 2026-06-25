import React from 'react'
import { ltrIsolate } from '../../types'
import type { FieldValues } from '../../types'

export const GOLD = '#F2C200'
export const GREY = '#595959'
export const INK = '#111111'

/** A single rotated square used in the corner decorations. */
function Diamond({
  size,
  color,
  top,
  left,
  shadow
}: {
  size: number
  color: string
  top: number
  left: number
  shadow?: boolean
}): React.JSX.Element {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        background: color,
        transform: 'rotate(45deg)',
        boxShadow: shadow ? '2px 2px 4px rgba(0,0,0,0.25)' : 'none'
      }}
    />
  )
}

/**
 * Builds the single-line English footer contact string, matching the sample:
 * "C.R: 1610803, P. O: 12, P. C: 111, SULTANATE OF OMAN, TEL:+968 77487290"
 */
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

/**
 * Arabic-side footer string (mirrors the English one). Numbers are wrapped in
 * LTR isolates so they always read left-to-right inside the RTL line.
 */
function arabicFooter(fields: FieldValues): string {
  const parts: string[] = []
  if (fields.crAr) parts.push(`س.ت:${ltrIsolate(fields.crAr)}`)
  if (fields.poBoxAr) parts.push(`ص.ب:${ltrIsolate(fields.poBoxAr)}`)
  if (fields.postalCodeAr) parts.push(`ر.ب:${ltrIsolate(fields.postalCodeAr)}`)
  if (fields.addressAr) parts.push(fields.addressAr)
  if (fields.telAr) parts.push(`هاتف:${ltrIsolate(fields.telAr)}`)
  if (fields.emailAr) parts.push(ltrIsolate(fields.emailAr))
  return parts.join('، ')
}

export const GoldenIdeaPreview: React.FC<{ fields: FieldValues }> = ({ fields }) => {
  // Resolved (user-customizable) colours, falling back to the brand defaults.
  const GOLD = fields.colors?.primary ?? '#F2C200'
  const GREY = fields.colors?.secondary ?? '#595959'
  const INK = fields.colors?.ink ?? '#111111'

  const footer = footerLine(fields)
  const footerAr = arabicFooter(fields)
  const arFirst = (fields.order ?? 'ar') === 'ar'
  const ns = fields.nameScale ?? 1
  const fs = fields.footerScale ?? 1

  const nameAr = fields.companyNameAr ? (
    <div key="ar" dir="rtl" style={{ fontSize: 22 * ns, fontWeight: 700, color: INK, lineHeight: 1.3 }}>
      {fields.companyNameAr}
    </div>
  ) : null
  const nameEn = fields.companyNameEn ? (
    <div
      key="en"
      style={{ fontSize: 16 * ns, fontWeight: 800, color: GOLD, letterSpacing: 0.5, marginTop: 4 }}
    >
      {fields.companyNameEn}
    </div>
  ) : null

  const footerArEl = footerAr ? (
    <div key="ar" dir="rtl" style={{ fontSize: 12 * fs, fontWeight: 700, color: INK, lineHeight: 1.5 }}>
      {footerAr}
    </div>
  ) : null
  const footerEnEl = footer ? (
    <div key="en" style={{ fontSize: 11.5 * fs, fontWeight: 700, color: INK, letterSpacing: 0.2 }}>
      {footer}
    </div>
  ) : null

  return (
    <div
      id="letterhead"
      style={{
        position: 'relative',
        width: 794,
        height: 1123,
        background: '#ffffff',
        overflow: 'hidden',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        color: INK
      }}
    >
      {/* ---------- WATERMARK (centre, faint, behind everything) ---------- */}
      {fields.watermark && (
        <img
          src={fields.watermark}
          alt="watermark"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: 460,
            maxHeight: 560,
            objectFit: 'contain',
            opacity: 0.1,
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* ---------- TOP DECORATIONS ---------- */}
      <div style={{ position: 'absolute', top: 22, left: 0, width: 600, height: 7, background: GREY }} />
      <div style={{ position: 'absolute', top: 31, left: 0, width: 600, height: 15, background: GOLD }} />

      {/* Top-right diamond cluster */}
      <Diamond size={64} color={GOLD} top={-14} left={690} shadow />
      <Diamond size={52} color={GREY} top={48} left={648} shadow />
      <Diamond size={30} color={GOLD} top={70} left={712} />

      {/* Logo (top-left) — only rendered when an image is provided */}
      {fields.logo && (
        <div
          style={{
            position: 'absolute',
            top: 52,
            left: 36,
            width: 120,
            height: 86,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src={fields.logo}
            alt="logo"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* Company name block */}
      <div
        style={{
          position: 'absolute',
          top: 56,
          left: 180,
          width: 430,
          textAlign: 'center'
        }}
      >
        {arFirst ? [nameAr, nameEn] : [nameEn, nameAr]}
      </div>

      {/* Divider line under the name — a single straight rule (position adjustable) */}
      <div
        style={{
          position: 'absolute',
          top: 150 + (fields.lineOffset ?? 0),
          left: 200,
          width: 400,
          height: 4,
          background: INK
        }}
      />

      {/* ---------- FOOTER DECORATIONS ---------- */}
      {/* Bottom-left diamond cluster */}
      <Diamond size={64} color={GOLD} top={1010} left={26} shadow />
      <Diamond size={52} color={GREY} top={988} left={92} shadow />
      <Diamond size={30} color={GOLD} top={1052} left={96} />

      {/* Footer bands */}
      <div style={{ position: 'absolute', top: 1024, left: 120, width: 674, height: 7, background: GREY }} />
      <div style={{ position: 'absolute', top: 1033, left: 120, width: 674, height: 15, background: GOLD }} />

      {/* Footer contact lines */}
      <div
        style={{
          position: 'absolute',
          top: 1066,
          left: 60,
          width: 674,
          textAlign: 'center'
        }}
      >
        {arFirst ? [footerArEl, footerEnEl] : [footerEnEl, footerArEl]}
      </div>
    </div>
  )
}

export default GoldenIdeaPreview
