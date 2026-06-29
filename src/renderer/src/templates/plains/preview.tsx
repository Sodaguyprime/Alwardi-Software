import React from 'react'
import type { FieldValues } from '../../types'
import { arabicFooter, footerLine } from '../shared'
import { useMovable } from '../layout'

const PRIMARY_DEFAULT = '#2a9bd6'
const INK_DEFAULT = '#1b1b1b'

const POINT = 22 // arrow notch depth, in px

/** clip-path that turns a box into an arrow pointing left or right. */
function arrow(dir: 'left' | 'right'): string {
  return dir === 'left'
    ? `polygon(0 50%, ${POINT}px 0, 100% 0, 100% 100%, ${POINT}px 100%)`
    : `polygon(0 0, calc(100% - ${POINT}px) 0, 100% 50%, calc(100% - ${POINT}px) 100%, 0 100%)`
}

/**
 * "Plains Business" template — a bordered letterhead with black/blue arrow
 * bars in the corners (recreates Templates/Template 3).
 */
export const PlainsPreview: React.FC<{ fields: FieldValues }> = ({ fields }) => {
  const movable = useMovable(fields)
  const PRIMARY = fields.colors?.primary ?? PRIMARY_DEFAULT
  const INK = fields.colors?.ink ?? INK_DEFAULT
  const ns = fields.nameScale ?? 1
  const fs = fields.footerScale ?? 1
  const ls = fields.logoScale ?? 1

  const footer = footerLine(fields)
  const footerAr = arabicFooter(fields)

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
            maxWidth: 440,
            maxHeight: 540,
            objectFit: 'contain',
            opacity: 0.1,
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* ---------- DOUBLE FRAME ---------- */}
      <div
        style={{ position: 'absolute', inset: 16, border: `2px solid ${INK}`, pointerEvents: 'none' }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 23,
          border: `2px solid ${PRIMARY}`,
          pointerEvents: 'none'
        }}
      />

      {/* ---------- TOP-LEFT: English name on a black box ----------
          width:fit-content + maxWidth means the box shrinks to short names but,
          for long ones, caps its width and grows DOWNWARD (wraps) instead of
          running into the right-hand band. */}
      {fields.companyNameEn && (
        <div
          {...movable('titleEn', {
            position: 'absolute',
            top: 34,
            left: 36,
            width: 'fit-content',
            maxWidth: 350,
            display: 'flex',
            alignItems: 'center',
            padding: `${8 * ns}px 22px`,
            background: INK,
            color: '#fff',
            fontSize: 17 * ns,
            fontWeight: 800,
            letterSpacing: 0.5,
            lineHeight: 1.2,
            wordBreak: 'break-word'
          })}
        >
          {fields.companyNameEn}
        </div>
      )}

      {/* ---------- TOP-RIGHT: Arabic name on a blue arrow + black corner chevron ----------
          Anchored to the right edge with no fixed width, so the blue band grows
          leftward to fit the text instead of clipping it. */}
      <div
        {...movable('titleAr', {
          position: 'absolute',
          top: 34,
          right: 36,
          display: 'flex',
          alignItems: 'stretch'
        })}
      >
        <div
          style={{
            background: PRIMARY,
            clipPath: arrow('left'),
            width: 'fit-content',
            maxWidth: 340,
            display: 'flex',
            alignItems: 'center',
            padding: `${8 * ns}px 18px ${8 * ns}px ${POINT + 16}px`
          }}
        >
          {fields.companyNameAr && (
            <span
              dir="rtl"
              style={{
                color: '#fff',
                fontSize: 20 * ns,
                fontWeight: 700,
                lineHeight: 1.25,
                textAlign: 'right',
                wordBreak: 'break-word'
              }}
            >
              {fields.companyNameAr}
            </span>
          )}
        </div>
        <div style={{ width: 30, marginLeft: -8, background: INK, clipPath: arrow('right') }} />
      </div>

      {/* ---------- LOGO (centred, just below the two title boxes) ---------- */}
      {fields.logo && (
        <div
          {...movable('logo', {
            position: 'absolute',
            top: 108,
            left: 0,
            width: 794,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 1
          })}
        >
          <img
            src={fields.logo}
            alt="logo"
            style={{ maxHeight: 80 * ls, maxWidth: 220 * ls, objectFit: 'contain' }}
          />
        </div>
      )}

      {/* ---------- BOTTOM CONTACT BAR (lifted up & nudged right) ---------- */}
      <div
        {...movable('footer', {
          position: 'absolute',
          bottom: 30,
          left: 70,
          width: 688,
          minHeight: 48,
          display: 'flex',
          alignItems: 'stretch'
        })}
      >
        {/* English footer — blue, arrow-left edge */}
        <div
          style={{
            flex: 1,
            background: PRIMARY,
            clipPath: arrow('left'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `0 16px 0 ${POINT + 10}px`
          }}
        >
          {footer && (
            <span style={{ color: '#fff', fontSize: 9.5 * fs, fontWeight: 700, lineHeight: 1.3 }}>
              {footer}
            </span>
          )}
        </div>
        {/* Arabic footer — black, arrow-right edge */}
        <div
          style={{
            flex: 1,
            background: INK,
            clipPath: arrow('right'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `0 ${POINT + 10}px 0 16px`
          }}
        >
          {footerAr && (
            <span dir="rtl" style={{ color: '#fff', fontSize: 9.5 * fs, fontWeight: 700, lineHeight: 1.4 }}>
              {footerAr}
            </span>
          )}
        </div>
      </div>

      {/* ---------- CORNER ARROW ACCENT (lifted up & nudged right with the bar) ---------- */}
      <div
        style={{
          position: 'absolute',
          bottom: 34,
          left: 30,
          width: 40,
          height: 40,
          background: INK,
          clipPath: arrow('right')
        }}
      />
    </div>
  )
}

export default PlainsPreview
