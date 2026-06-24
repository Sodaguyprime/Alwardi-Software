import React from 'react'
import type { FieldValues } from '../../types'

const GOLD = '#F2C200'
const GREY = '#595959'
const INK = '#111111'

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
 * Builds the single-line footer contact string from the active fields,
 * matching the sample: "C.R: 1610803, P. O: 12, P. C: 111, SULTANATE OF OMAN, TEL:+968 77487290"
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

export const GoldenIdeaPreview: React.FC<{ fields: FieldValues }> = ({ fields }) => {
  const mode = fields.languageMode ?? 'en'
  const showAr = mode === 'ar' || mode === 'both'
  const showEn = mode === 'en' || mode === 'both'
  const footer = footerLine(fields)

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
      {/* ---------- TOP DECORATIONS ---------- */}
      <div style={{ position: 'absolute', top: 22, left: 0, width: 600, height: 7, background: GREY }} />
      <div style={{ position: 'absolute', top: 31, left: 0, width: 600, height: 15, background: GOLD }} />

      {/* Top-right diamond cluster */}
      <Diamond size={64} color={GOLD} top={-14} left={690} shadow />
      <Diamond size={52} color={GREY} top={48} left={648} shadow />
      <Diamond size={30} color={GOLD} top={70} left={712} />

      {/* Logo (top-left) */}
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
        {fields.logo ? (
          <img
            src={fields.logo}
            alt="logo"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        ) : (
          <div
            style={{
              width: 110,
              height: 70,
              borderRadius: '50%',
              border: `2px dashed ${GREY}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              color: GREY,
              letterSpacing: 1
            }}
          >
            LOGO
          </div>
        )}
      </div>

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
        {showAr && fields.companyNameAr && (
          <div
            dir="rtl"
            style={{ fontSize: 22, fontWeight: 700, color: INK, lineHeight: 1.3 }}
          >
            {fields.companyNameAr}
          </div>
        )}
        {showEn && fields.companyNameEn && (
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: GOLD,
              letterSpacing: 0.5,
              marginTop: showAr ? 4 : 18
            }}
          >
            {fields.companyNameEn}
          </div>
        )}
      </div>

      {/* Divider line under the name (with a small notch like the sample) */}
      <div style={{ position: 'absolute', top: 150, left: 200, width: 250, height: 4, background: INK }} />
      <div style={{ position: 'absolute', top: 150, left: 470, width: 130, height: 4, background: INK }} />

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
        {showAr && (
          <div dir="rtl" style={{ fontSize: 12, fontWeight: 700, color: INK, lineHeight: 1.5 }}>
            {arabicFooter(fields)}
          </div>
        )}
        {showEn && footer && (
          <div style={{ fontSize: 11.5, fontWeight: 700, color: INK, letterSpacing: 0.2 }}>{footer}</div>
        )}
      </div>
    </div>
  )
}

/** Arabic-side footer string (mirrors the English one) for ar/both modes. */
function arabicFooter(fields: FieldValues): string {
  const parts: string[] = []
  if (fields.cr) parts.push(`س.ت:${fields.cr}`)
  if (fields.poBox) parts.push(`ص.ب:${fields.poBox}`)
  if (fields.postalCode) parts.push(`ر.ب:${fields.postalCode}`)
  if (fields.address) parts.push('سلطنة عمان')
  if (fields.tel) parts.push(`هاتف:${fields.tel}`)
  return parts.join('، ')
}

export default GoldenIdeaPreview
