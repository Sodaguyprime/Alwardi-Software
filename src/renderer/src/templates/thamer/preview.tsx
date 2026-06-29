import React from 'react'
import type { FieldValues } from '../../types'
import { arabicFooter, footerLine } from '../shared'
import { useMovable } from '../layout'

const NAVY_DEFAULT = '#2e3192' // English name, navy waves, footer text
const ORANGE_DEFAULT = '#f7941e' // Arabic name & orange waves

/**
 * "Abu Thamer" template — navy & orange curved waves in opposite corners,
 * an Arabic name (orange) above the English name (navy) at top-left, and
 * centred Arabic + English contact lines at the foot (recreates
 * Templates/template 6).
 */
export const ThamerPreview: React.FC<{ fields: FieldValues }> = ({ fields }) => {
  const movable = useMovable(fields)
  const NAVY = fields.colors?.navy ?? NAVY_DEFAULT
  const ORANGE = fields.colors?.orange ?? ORANGE_DEFAULT
  const ns = fields.nameScale ?? 1
  const fs = fields.footerScale ?? 1
  const ls = fields.logoScale ?? 1

  const arFirst = (fields.order ?? 'ar') === 'ar'
  const footer = footerLine(fields)
  const footerAr = arabicFooter(fields)

  const footerArEl = footerAr ? (
    <div key="ar" dir="rtl" style={{ fontSize: 10.5 * fs, fontWeight: 600, color: NAVY, lineHeight: 1.6 }}>
      {footerAr}
    </div>
  ) : null
  const footerEnEl = footer ? (
    <div key="en" style={{ fontSize: 10.5 * fs, fontWeight: 700, color: NAVY, letterSpacing: 0.2, lineHeight: 1.6 }}>
      {footer}
    </div>
  ) : null

  const nameArEl = fields.companyNameAr ? (
    <div key="ar" dir="rtl" style={{ fontSize: 21 * ns, fontWeight: 800, color: ORANGE, lineHeight: 1.25 }}>
      {fields.companyNameAr}
    </div>
  ) : null
  const nameEnEl = fields.companyNameEn ? (
    <div key="en" style={{ fontSize: 13 * ns, fontWeight: 800, color: NAVY, letterSpacing: 0.6, lineHeight: 1.25 }}>
      {fields.companyNameEn}
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
        color: NAVY
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

      {/* ---------- TOP-RIGHT WAVE ---------- */}
      <svg width={420} height={210} viewBox="0 0 420 210" style={{ position: 'absolute', top: 0, right: 0 }} preserveAspectRatio="none">
        <path d="M420,0 L420,200 C300,200 250,90 130,70 C70,60 20,40 0,0 Z" fill={ORANGE} />
        <path d="M420,0 L420,150 C320,150 270,60 170,40 C110,28 60,18 30,0 Z" fill={NAVY} />
      </svg>

      {/* ---------- HEADER TEXT ---------- */}
      {fields.logo && (
        <div {...movable('logo', { position: 'absolute', top: 26, left: 40, width: 150 * ls, height: 70 * ls, display: 'flex', alignItems: 'center' })}>
          <img src={fields.logo} alt="logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </div>
      )}
      <div {...movable('title', { position: 'absolute', top: 30, left: 44, width: 420 })}>
        {arFirst ? [nameArEl, nameEnEl] : [nameEnEl, nameArEl]}
      </div>

      {/* ---------- BOTTOM-LEFT WAVE ---------- */}
      <svg width={420} height={230} viewBox="0 0 420 230" style={{ position: 'absolute', bottom: 0, left: 0 }} preserveAspectRatio="none">
        <path d="M0,230 L0,30 C120,30 170,140 290,160 C350,170 400,190 420,230 Z" fill={ORANGE} />
        <path d="M0,230 L0,90 C100,90 150,170 250,190 C310,202 360,212 390,230 Z" fill={NAVY} />
      </svg>

      {/* ---------- BOTTOM-RIGHT ACCENT ---------- */}
      <svg width={150} height={120} viewBox="0 0 150 120" style={{ position: 'absolute', bottom: 0, right: 0 }} preserveAspectRatio="none">
        <path d="M150,120 L150,20 C90,30 60,80 0,120 Z" fill={NAVY} />
        <path d="M150,120 L150,55 C110,60 90,90 50,120 Z" fill={ORANGE} />
      </svg>

      {/* ---------- FOOTER CONTACT LINES ---------- */}
      <div {...movable('footer', { position: 'absolute', bottom: 30, left: 130, width: 534, textAlign: 'center' })}>
        {arFirst ? [footerArEl, footerEnEl] : [footerEnEl, footerArEl]}
      </div>
    </div>
  )
}

export default ThamerPreview
