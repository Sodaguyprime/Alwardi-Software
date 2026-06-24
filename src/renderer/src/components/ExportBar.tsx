import React, { useState } from 'react'

interface Props {
  onExportDocx: () => Promise<void>
  onExportPdf: () => Promise<void>
  onPrint: () => void
  onReset: () => void
}

export const ExportBar: React.FC<Props> = ({ onExportDocx, onExportPdf, onPrint, onReset }) => {
  const [busy, setBusy] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')

  const run = async (label: string, fn: () => Promise<void>): Promise<void> => {
    setBusy(label)
    setStatus('')
    try {
      await fn()
      setStatus(`${label} done`)
    } catch (err) {
      setStatus(`${label} failed: ${String(err)}`)
    } finally {
      setBusy(null)
      setTimeout(() => setStatus(''), 4000)
    }
  }

  const btn = 'rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50'

  return (
    <div className="flex items-center gap-3 border-t border-slate-200 bg-white px-5 py-3">
      <button
        type="button"
        disabled={!!busy}
        onClick={() => run('Export DOCX', onExportDocx)}
        className={`${btn} border border-slate-300 text-slate-700 hover:bg-slate-50`}
      >
        {busy === 'Export DOCX' ? 'Working…' : 'Export DOCX'}
      </button>
      <button
        type="button"
        disabled={!!busy}
        onClick={() => run('Export PDF', onExportPdf)}
        className={`${btn} bg-goldDark text-slate-900 hover:bg-gold`}
      >
        {busy === 'Export PDF' ? 'Working…' : 'Export PDF'}
      </button>
      <button
        type="button"
        disabled={!!busy}
        onClick={onPrint}
        className={`${btn} border border-slate-300 text-slate-700 hover:bg-slate-50`}
      >
        Print
      </button>

      <div className="ml-auto flex items-center gap-4">
        {status && <span className="text-xs text-slate-500">{status}</span>}
        <button type="button" onClick={onReset} className="text-xs text-slate-400 hover:text-red-500 hover:underline">
          Reset to defaults
        </button>
      </div>
    </div>
  )
}

export default ExportBar
