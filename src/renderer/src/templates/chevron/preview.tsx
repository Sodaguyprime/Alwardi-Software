import React from 'react'
import type { FieldValues } from '../../types'
import { arabicFooter, footerLine } from '../shared'
import { useMovable } from '../layout'

const TEAL_DEFAULT = '#27b9c4' // bands / English name / corner triangles
const ORANGE_DEFAULT = '#e8862e' // accent triangles & footer band
const RED_DEFAULT = '#c0392b' // Arabic company name
const DARK_DEFAULT = '#3a3a3a' // chevron arrows

/**
 * "Chevron" template — teal & orange angled corners with grey chevron arrows,
 * an Arabic name (red, right) above the English name (teal), and a centred
 * contact line at the foot (recreates Templates/template 5).
 */
export const ChevronPreview: React.FC<{ fields: FieldValues }> = ({ fields }) => {
  const movable = useMovable(fields)
  const TEAL = fields.colors?.teal ?? TEAL_DEFAULT
  const ORANGE = fields.colors?.orange ?? ORANGE_DEFAULT
  const RED = fields.colors?.name ?? RED_DEFAULT
  const DARK = fields.colors?.chevron ?? DARK_DEFAULT
  const ns = fields.nameScale ?? 1
  const fs = fields.footerScale ?? 1
  const ls = fields.logoScale ?? 1

  const arFirst = (fields.order ?? 'ar') === 'ar'
  const footer = footerLine(fields)
  const footerAr = arabicFooter(fields)

  const footerArEl = footerAr ? (
    <div key="ar" dir="rtl" style={{ fontSize: 11 * fs, fontWeight: 600, color: DARK, lineHeight: 1.6 }}>
      {footerAr}
    </div>
  ) : null
  const footerEnEl = footer ? (
    <div key="en" style={{ fontSize: 10.5 * fs, fontWeight: 600, color: DARK, letterSpacing: 0.2, lineHeight: 1.6 }}>
      {footer}
    </div>
  ) : null

  const nameArEl = fields.companyNameAr ? (
    <div key="ar" dir="rtl" style={{ fontSize: 20 * ns, fontWeight: 800, color: RED, lineHeight: 1.25 }}>
      {fields.companyNameAr}
    </div>
  ) : null
  const nameEnEl = fields.companyNameEn ? (
    <div key="en" style={{ fontSize: 13 * ns, fontWeight: 800, color: TEAL, letterSpacing: 0.3, lineHeight: 1.25 }}>
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
        color: DARK
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

      {/* ---------- TOP CORNERS ---------- */}
      <svg width={794} height={150} viewBox="0 0 794 150" style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* top-left: orange over teal */}
        <polygon points="0,0 235,0 0,100" fill={TEAL} />
        <polygon points="0,0 150,0 0,64" fill={ORANGE} />
        {/* top-right teal wedge */}
        <polygon points="794,0 794,105 600,0" fill={TEAL} />
        {/* grey double chevron pointing left */}
        <path d="M758,30 L726,58 L758,86" stroke={DARK} strokeWidth={13} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M722,30 L690,58 L722,86" stroke={DARK} strokeWidth={13} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      </svg>

      {/* ---------- HEADER TEXT ---------- */}
      {fields.logo && (
        <div {...movable('logo', { position: 'absolute', top: 30, left: 40, width: 150 * ls, height: 70 * ls, display: 'flex', alignItems: 'center' })}>
          <img src={fields.logo} alt="logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </div>
      )}
      <div {...movable('title', { position: 'absolute', top: 34, left: 200, right: 130, textAlign: 'right' })}>
        {arFirst ? [nameArEl, nameEnEl] : [nameEnEl, nameArEl]}
      </div>

      {/* ---------- BOTTOM CORNERS ---------- */}
      <svg width={794} height={150} viewBox="0 0 794 150" style={{ position: 'absolute', bottom: 0, left: 0 }}>
        {/* bottom-left teal wedge + orange chevrons pointing right */}
        <polygon points="0,150 0,55 200,150" fill={TEAL} />
        <path d="M40,40 L72,68 L40,96" stroke={ORANGE} strokeWidth={13} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M76,40 L108,68 L76,96" stroke={DARK} strokeWidth={13} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {/* bottom-right orange band over teal */}
        <polygon points="794,150 794,48 540,150" fill={TEAL} />
        <polygon points="794,150 794,78 630,150" fill={ORANGE} />
      </svg>

      {/* ---------- FOOTER CONTACT LINE ---------- */}
      <div {...movable('footer', { position: 'absolute', bottom: 34, left: 120, width: 554, textAlign: 'center' })}>
        {arFirst ? [footerArEl, footerEnEl] : [footerEnEl, footerArEl]}
      </div>
    </div>
  )
}

export default ChevronPreview
