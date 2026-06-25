import React from 'react'
import type { FieldValues } from '../../types'
import { arabicFooter, footerLine } from '../shared'

const PRIMARY_DEFAULT = '#1d5c8a'
const ACCENT_DEFAULT = '#b02a2a'
const INK_DEFAULT = '#1a2733'

/**
 * "Karma Business" template — a clean letterhead with blue wave banners
 * sweeping in from the top and bottom corners (recreates Templates/Template 2).
 */
export const KarmaPreview: React.FC<{ fields: FieldValues }> = ({ fields }) => {
  const PRIMARY = fields.colors?.primary ?? PRIMARY_DEFAULT
  const ACCENT = fields.colors?.accent ?? ACCENT_DEFAULT
  const INK = fields.colors?.ink ?? INK_DEFAULT

  const arFirst = (fields.order ?? 'ar') === 'ar'
  const ns = fields.nameScale ?? 1
  const fs = fields.footerScale ?? 1
  const footer = footerLine(fields)
  const footerAr = arabicFooter(fields)

  const nameAr = fields.companyNameAr ? (
    <div key="ar" dir="rtl" style={{ fontSize: 24 * ns, fontWeight: 700, color: INK, lineHeight: 1.3 }}>
      {fields.companyNameAr}
    </div>
  ) : null
  const nameEn = fields.companyNameEn ? (
    <div
      key="en"
      style={{ fontSize: 24 * ns, fontWeight: 800, color: INK, letterSpacing: 1, marginTop: 2 }}
    >
      {fields.companyNameEn}
    </div>
  ) : null

  const footerArEl = footerAr ? (
    <div key="ar" dir="rtl" style={{ fontSize: 11 * fs, fontWeight: 700, color: INK, lineHeight: 1.6 }}>
      {footerAr}
    </div>
  ) : null
  const footerEnEl = footer ? (
    <div key="en" style={{ fontSize: 10.5 * fs, fontWeight: 700, color: ACCENT, letterSpacing: 0.2 }}>
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
      {/* ---------- WATERMARK ---------- */}
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

      {/* ---------- TOP WAVE BANNER ---------- */}
      <svg
        width={794}
        height={170}
        viewBox="0 0 794 170"
        style={{ position: 'absolute', top: 0, left: 0 }}
        preserveAspectRatio="none"
      >
        <rect x={0} y={0} width={794} height={6} fill={PRIMARY} />
        <path d="M0,6 H330 C230,55 150,82 0,150 Z" fill={PRIMARY} />
        <path d="M794,6 H464 C564,55 644,82 794,150 Z" fill={PRIMARY} />
      </svg>

      {/* Logo (optional, centred above the name) */}
      {fields.logo && (
        <div
          style={{
            position: 'absolute',
            top: 18,
            left: 0,
            width: 794,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <img
            src={fields.logo}
            alt="logo"
            style={{ maxHeight: 50, maxWidth: 180, objectFit: 'contain' }}
          />
        </div>
      )}

      {/* Company name block */}
      <div
        style={{
          position: 'absolute',
          top: fields.logo ? 78 : 52,
          left: 147,
          width: 500,
          textAlign: 'center'
        }}
      >
        {arFirst ? [nameAr, nameEn] : [nameEn, nameAr]}
      </div>

      {/* ---------- BOTTOM WAVE BANNER ---------- */}
      <svg
        width={794}
        height={170}
        viewBox="0 0 794 170"
        style={{ position: 'absolute', bottom: 0, left: 0 }}
        preserveAspectRatio="none"
      >
        <rect x={0} y={164} width={794} height={6} fill={PRIMARY} />
        <path d="M0,164 H330 C230,115 150,88 0,20 Z" fill={PRIMARY} />
        <path d="M794,164 H464 C564,115 644,88 794,20 Z" fill={PRIMARY} />
      </svg>

      {/* Footer contact lines */}
      <div
        style={{
          position: 'absolute',
          bottom: 28,
          left: 147,
          width: 500,
          textAlign: 'center'
        }}
      >
        {arFirst ? [footerArEl, footerEnEl] : [footerEnEl, footerArEl]}
      </div>
    </div>
  )
}

export default KarmaPreview
