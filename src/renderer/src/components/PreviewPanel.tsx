import React, { useEffect, useRef, useState } from 'react'
import type { FieldValues, TemplateDefinition } from '../types'

const A4_W = 794
const A4_H = 1123

export const PreviewPanel: React.FC<{ template: TemplateDefinition; fields: FieldValues }> = ({
  template,
  fields
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.6)
  const [fullscreen, setFullscreen] = useState(false)
  const [fsScale, setFsScale] = useState(0.9)
  // Extra zoom multiplier applied on top of the fit-to-window scale.
  const [fsZoom, setFsZoom] = useState(1)

  const ZOOM_MIN = 0.5
  const ZOOM_MAX = 5
  const clampZoom = (z: number): number => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z))
  const fsEffective = fsScale * fsZoom

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = (): void => {
      const padding = 64
      const availW = el.clientWidth - padding
      const availH = el.clientHeight - padding
      setScale(Math.min(availW / A4_W, availH / A4_H, 1))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Fit the fullscreen view to the window, allow Esc to close, +/- to zoom.
  useEffect(() => {
    if (!fullscreen) return
    setFsZoom(1) // start at fit each time fullscreen opens
    const fit = (): void => {
      const availW = window.innerWidth - 48
      const availH = window.innerHeight - 96
      setFsScale(Math.min(availW / A4_W, availH / A4_H))
    }
    fit()
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setFullscreen(false)
      else if (e.key === '+' || e.key === '=') setFsZoom((z) => clampZoom(z + 0.2))
      else if (e.key === '-' || e.key === '_') setFsZoom((z) => clampZoom(z - 0.2))
      else if (e.key === '0') setFsZoom(1)
    }
    window.addEventListener('resize', fit)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('resize', fit)
      window.removeEventListener('keydown', onKey)
    }
  }, [fullscreen])

  const Preview = template.Preview

  return (
    <div
      ref={containerRef}
      className="relative flex h-full flex-1 items-center justify-center overflow-auto bg-slate-100 p-8"
    >
      <button
        type="button"
        onClick={() => setFullscreen(true)}
        className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
      >
        <span className="text-base leading-none">⛶</span> Fullscreen
      </button>

      <div style={{ width: A4_W * scale, height: A4_H * scale, flexShrink: 0 }}>
        <div
          style={{
            width: A4_W,
            height: A4_H,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
            background: '#fff'
          }}
        >
          <Preview fields={fields} />
        </div>
      </div>

      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/70 p-6"
          onClick={() => setFullscreen(false)}
          onWheel={(e) => {
            // Ctrl/⌘ + wheel zooms (standard zoom gesture).
            if (!e.ctrlKey && !e.metaKey) return
            setFsZoom((z) => clampZoom(z + (e.deltaY < 0 ? 0.15 : -0.15)))
          }}
        >
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="fixed right-5 top-5 z-10 rounded-md bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-700 shadow hover:bg-white"
          >
            ✕ Close (Esc)
          </button>

          {/* Zoom controls */}
          <div
            className="fixed bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-lg bg-white/95 p-1 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setFsZoom((z) => clampZoom(z - 0.2))}
              className="h-8 w-8 rounded-md text-lg font-semibold text-slate-700 hover:bg-slate-100"
              title="Zoom out (-)"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => setFsZoom(1)}
              className="min-w-[56px] rounded-md px-2 text-sm font-medium tabular-nums text-slate-600 hover:bg-slate-100"
              title="Reset zoom (0)"
            >
              {Math.round(fsZoom * 100)}%
            </button>
            <button
              type="button"
              onClick={() => setFsZoom((z) => clampZoom(z + 0.2))}
              className="h-8 w-8 rounded-md text-lg font-semibold text-slate-700 hover:bg-slate-100"
              title="Zoom in (+)"
            >
              +
            </button>
          </div>

          <div
            style={{ width: A4_W * fsEffective, height: A4_H * fsEffective, flexShrink: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: A4_W,
                height: A4_H,
                transform: `scale(${fsEffective})`,
                transformOrigin: 'top left',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                background: '#fff'
              }}
            >
              <Preview fields={fields} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PreviewPanel
