import React, { useCallback, useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import logo from '../assets/logo.png'

interface Props {
  /** When true, an image is drawn in the centre of the code (and EC level is forced High). */
  withLogo: boolean
  onHome: () => void
}

type Level = 'L' | 'M' | 'Q' | 'H'

// QR codes are rendered at a fixed high resolution so the saved PNG is crisp;
// the on-screen preview is just scaled down with CSS.
const RENDER_SIZE = 1024

/**
 * QR Code generator. Two modes share this component:
 *  - plain: encode a link/text into a downloadable QR PNG.
 *  - withLogo: the same, plus an image (logo/PNG) drawn in the middle.
 */
export const QrGenerator: React.FC<Props> = ({ withLogo, onHome }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [text, setText] = useState('https://')
  const [fg, setFg] = useState('#000000')
  const [bg, setBg] = useState('#ffffff')
  const [level, setLevel] = useState<Level>(withLogo ? 'H' : 'M')
  const [margin, setMargin] = useState(2)
  const [logoSrc, setLogoSrc] = useState<string | null>(null)
  const [logoScale, setLogoScale] = useState(0.22)
  const [status, setStatus] = useState('')

  const title = withLogo ? 'QR Code with Logo' : 'QR Code Generator'

  // (Re)draw the QR whenever any input changes.
  const draw = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const value = text.trim()
    if (!value) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        canvas.width = RENDER_SIZE
        canvas.height = RENDER_SIZE
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, RENDER_SIZE, RENDER_SIZE)
      }
      return
    }

    try {
      await QRCode.toCanvas(canvas, value, {
        errorCorrectionLevel: withLogo ? 'H' : level,
        margin,
        width: RENDER_SIZE,
        color: { dark: fg, light: bg }
      })
      setStatus('')
    } catch (err) {
      setStatus(`Could not generate: ${String(err)}`)
      return
    }

    if (!withLogo || !logoSrc) return

    // Overlay the logo in the centre, on a small padded background plate so the
    // surrounding modules stay legible. High EC keeps the code scannable.
    await new Promise<void>((resolve) => {
      const img = new Image()
      img.onload = () => {
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve()
        const box = RENDER_SIZE * Math.min(0.4, Math.max(0.1, logoScale))
        const pad = box * 0.12
        const plate = box + pad * 2
        const x = (RENDER_SIZE - plate) / 2
        const y = (RENDER_SIZE - plate) / 2
        ctx.fillStyle = bg
        const r = plate * 0.12
        // rounded-rect plate
        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.arcTo(x + plate, y, x + plate, y + plate, r)
        ctx.arcTo(x + plate, y + plate, x, y + plate, r)
        ctx.arcTo(x, y + plate, x, y, r)
        ctx.arcTo(x, y, x + plate, y, r)
        ctx.closePath()
        ctx.fill()
        // contain the logo within the box, preserving aspect ratio
        const ratio = img.width / img.height
        let w = box
        let h = box
        if (ratio > 1) h = box / ratio
        else w = box * ratio
        ctx.drawImage(img, (RENDER_SIZE - w) / 2, (RENDER_SIZE - h) / 2, w, h)
        resolve()
      }
      img.onerror = () => resolve()
      img.src = logoSrc
    })
  }, [text, fg, bg, level, margin, withLogo, logoSrc, logoScale])

  useEffect(() => {
    void draw()
  }, [draw])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setLogoSrc(typeof reader.result === 'string' ? reader.result : null)
    reader.readAsDataURL(file)
  }

  const handleSave = async (): Promise<void> => {
    const canvas = canvasRef.current
    if (!canvas || !text.trim()) {
      setStatus('Enter a link or text first.')
      return
    }
    const dataUrl = canvas.toDataURL('image/png')
    const res = await window.api.exportPng(dataUrl, withLogo ? 'qr-logo.png' : 'qr-code.png')
    setStatus(res.ok ? 'Saved.' : res.error ? `Failed: ${res.error}` : '')
    setTimeout(() => setStatus(''), 4000)
  }

  const handleCopy = async (): Promise<void> => {
    const canvas = canvasRef.current
    if (!canvas || !text.trim()) return
    canvas.toBlob(async (blob) => {
      if (!blob) return
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        setStatus('Copied to clipboard.')
      } catch (err) {
        setStatus(`Copy failed: ${String(err)}`)
      }
      setTimeout(() => setStatus(''), 4000)
    })
  }

  const labelCls = 'block text-xs font-medium text-slate-600 mb-1'
  const inputCls =
    'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-400 focus:outline-none'

  return (
    <div className="flex h-full flex-col bg-slate-50">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-3">
        <button
          type="button"
          onClick={onHome}
          title="Back to home"
          className="mr-1 flex items-center gap-2 rounded-md px-2 py-1 hover:bg-slate-100"
        >
          <img src={logo} alt="Alwardi" className="h-8 w-8 rounded-full bg-black object-contain" />
          <span className="text-sm font-bold text-slate-800">Alwardi Software</span>
        </button>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{title}</span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Controls */}
        <div className="w-80 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-5">
          <div className="mb-4">
            <label className={labelCls}>Link or text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="https://example.com"
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Foreground</label>
              <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-9 w-full rounded-md border border-slate-300" />
            </div>
            <div>
              <label className={labelCls}>Background</label>
              <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-9 w-full rounded-md border border-slate-300" />
            </div>
          </div>

          {!withLogo && (
            <div className="mb-4">
              <label className={labelCls}>Error correction</label>
              <select value={level} onChange={(e) => setLevel(e.target.value as Level)} className={inputCls}>
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>
          )}

          <div className="mb-4">
            <label className={labelCls}>Quiet margin: {margin}</label>
            <input
              type="range"
              min={0}
              max={8}
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {withLogo && (
            <>
              <div className="mb-4">
                <label className={labelCls}>Center logo / PNG</label>
                <label className="flex cursor-pointer items-center justify-center rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                  {logoSrc ? 'Change image…' : 'Upload image…'}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                {logoSrc && (
                  <button
                    type="button"
                    onClick={() => setLogoSrc(null)}
                    className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    Remove logo
                  </button>
                )}
              </div>
              {logoSrc && (
                <div className="mb-4">
                  <label className={labelCls}>Logo size: {Math.round(logoScale * 100)}%</label>
                  <input
                    type="range"
                    min={10}
                    max={40}
                    value={Math.round(logoScale * 100)}
                    onChange={(e) => setLogoScale(Number(e.target.value) / 100)}
                    className="w-full"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Keep it small so the code stays scannable. Error correction is set to High automatically.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="mt-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={handleSave}
              className="mb-2 w-full rounded-md bg-goldDark px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-gold disabled:opacity-50"
            >
              Save PNG
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Copy to clipboard
            </button>
            {status && <p className="mt-2 text-center text-xs text-slate-500">{status}</p>}
          </div>
        </div>

        {/* Preview */}
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center overflow-y-auto p-6">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <canvas
              ref={canvasRef}
              className="h-[260px] w-[260px] max-w-full rounded"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default QrGenerator
