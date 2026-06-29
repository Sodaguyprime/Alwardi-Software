import React from 'react'
import type { FieldValues } from '../../types'
import { arabicFooter, footerLine } from '../shared'
import { useMovable } from '../layout'

const PRIMARY_DEFAULT = '#1b3a6b' // navy: names, divider, footer text
const ACCENT_DEFAULT = '#2f6fb0' // blue: waves

/**
 * "Sihool Masirah" template — English name (left) and Arabic name (right)
 * flanking a centred logo, a divider line under the header, and a blue wave
 * in the bottom-right with centred contact lines (recreates Templates/template 4).
 */
export const SihoolPreview: React.FC<{ fields: FieldValues }> = ({ fields }) => {
  const movable = useMovable(fields)
  const PRIMARY = fields.colors?.primary ?? PRIMARY_DEFAULT
  const ACCENT = fields.colors?.accent ?? ACCENT_DEFAULT
  const ns = fields.nameScale ?? 1
  const fs = fields.footerScale ?? 1
  const ls = fields.logoScale ?? 1

  const arFirst = (fields.order ?? 'ar') === 'ar'
  const lineTop = 100 + (fields.lineOffset ?? 0)
  const footer = footerLine(fields)
  const footerAr = arabicFooter(fields)

  const footerArEl = footerAr ? (
    <div key="ar" dir="rtl" style={{ fontSize: 11 * fs, fontWeight: 700, color: PRIMARY, lineHeight: 1.6 }}>
      {footerAr}
    </div>
  ) : null
  const footerEnEl = footer ? (
    <div key="en" style={{ fontSize: 10.5 * fs, fontWeight: 700, color: PRIMARY, letterSpacing: 0.2, lineHeight: 1.6 }}>
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
        color: PRIMARY
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

      {/* ---------- FAINT LEFT-EDGE WAVE (thin decorative line) ---------- */}
      <svg
        width={90}
        height={540}
        viewBox="0 0 90 540"
        style={{ position: 'absolute', top: 150, left: 0, opacity: 0.25 }}
        preserveAspectRatio="none"
      >
        <path
          d="M30,0 C75,90 5,180 45,270 C80,350 10,430 50,540"
          stroke={ACCENT}
          strokeWidth={2}
          fill="none"
        />
      </svg>

      {/* ---------- HEADER: name (left) · logo (centre) · name (right) ---------- */}
      {fields.companyNameEn && (
        <div
          {...movable('titleEn', {
            position: 'absolute',
            top: 40,
            left: 40,
            maxWidth: 240,
            fontSize: 15 * ns,
            fontWeight: 800,
            color: PRIMARY,
            letterSpacing: 0.3,
            lineHeight: 1.2
          })}
        >
          {fields.companyNameEn}
        </div>
      )}

      {fields.logo && (
        <div
          {...movable('logo', {
            position: 'absolute',
            top: 20,
            left: 0,
            width: 794,
            display: 'flex',
            justifyContent: 'center'
          })}
        >
          <img
            src={fields.logo}
            alt="logo"
            style={{ maxHeight: 62 * ls, maxWidth: 170 * ls, objectFit: 'contain' }}
          />
        </div>
      )}

      {fields.companyNameAr && (
        <div
          dir="rtl"
          {...movable('titleAr', {
            position: 'absolute',
            top: 38,
            right: 40,
            maxWidth: 240,
            fontSize: 18 * ns,
            fontWeight: 700,
            color: PRIMARY,
            lineHeight: 1.3,
            textAlign: 'right'
          })}
        >
          {fields.companyNameAr}
        </div>
      )}

      {/* Divider line under the header (position adjustable) */}
      <div style={{ position: 'absolute', top: lineTop, left: 40, right: 40, height: 2, background: PRIMARY }} />
      {/* Small wave accent at the left end of the divider */}
      <svg
        width={90}
        height={22}
        viewBox="0 0 90 22"
        style={{ position: 'absolute', top: lineTop, left: 40 }}
      >
        <path d="M0,2 C25,18 45,18 70,6 C78,3 84,4 90,8" stroke={ACCENT} strokeWidth={2.5} fill="none" />
      </svg>

      {/* ---------- BOTTOM-RIGHT WAVE ---------- */}
      <svg
        width={420}
        height={150}
        viewBox="0 0 420 150"
        style={{ position: 'absolute', bottom: 0, right: 0 }}
        preserveAspectRatio="none"
      >
        <path d="M420,150 L420,40 C330,10 280,80 180,80 C110,80 50,120 0,150 Z" fill={ACCENT} opacity={0.45} />
        <path d="M420,150 L420,70 C340,45 290,100 200,100 C130,100 70,128 30,150 Z" fill={ACCENT} />
      </svg>

      {/* ---------- FOOTER CONTACT LINES ---------- */}
      <div
        {...movable('footer', {
          position: 'absolute',
          bottom: 34,
          left: 60,
          width: 674,
          textAlign: 'center'
        })}
      >
        {arFirst ? [footerArEl, footerEnEl] : [footerEnEl, footerArEl]}
      </div>
    </div>
  )
}

export default SihoolPreview
