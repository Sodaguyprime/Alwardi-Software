import React from 'react'
import { templates } from '../templates/registry'
import logo from '../assets/logo.png'

interface Props {
  selectedId: string
  onSelect: (id: string) => void
  onHome: () => void
}

export const TemplatePicker: React.FC<Props> = ({ selectedId, onSelect, onHome }) => {
  return (
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
      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Letterhead</span>
      <div className="h-8 w-px bg-slate-200" />
      <div className="flex gap-3 overflow-x-auto">
        {templates.map((t) => {
          const active = t.id === selectedId
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg border-2 p-1.5 pr-3 transition-colors ${
                active ? 'border-goldDark bg-gold/10' : 'border-transparent hover:bg-slate-50'
              }`}
            >
              <img
                src={t.thumbnail}
                alt={t.name}
                className="h-12 w-9 rounded border border-slate-200 object-cover"
              />
              <span className="text-sm font-medium text-slate-700">{t.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default TemplatePicker
