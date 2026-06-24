import React from 'react'
import logo from '../assets/logo.png'

interface Service {
  id: string
  name: string
  description: string
  icon: string
  available: boolean
}

const SERVICES: Service[] = [
  {
    id: 'letterhead',
    name: 'Letterhead Generator',
    description: 'Create branded company letterheads and export to PDF, DOCX, or print.',
    icon: '📄',
    available: true
  }
]

export const HomeMenu: React.FC<{ onOpen: (id: string) => void }> = ({ onOpen }) => {
  return (
    <div className="flex h-full flex-col items-center overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="flex flex-col items-center px-6 pt-16 pb-10 text-center">
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-black/40 shadow-2xl ring-2 ring-gold/40">
          <img src={logo} alt="Alwardi" className="h-28 w-28 object-contain" />
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight">Alwardi Software</h1>
        <p className="mt-2 max-w-md text-sm text-slate-300">
          Your company document suite. Choose a service to get started.
        </p>
      </div>

      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 px-8 pb-16 sm:grid-cols-2">
        {SERVICES.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={!s.available}
            onClick={() => s.available && onOpen(s.id)}
            className={`group flex flex-col items-start rounded-2xl border p-6 text-left transition-all ${
              s.available
                ? 'border-gold/30 bg-white/5 hover:-translate-y-0.5 hover:border-gold hover:bg-white/10'
                : 'cursor-not-allowed border-white/10 bg-white/5 opacity-50'
            }`}
          >
            <span className="text-4xl">{s.icon}</span>
            <span className="mt-4 text-lg font-bold">{s.name}</span>
            <span className="mt-1 text-sm text-slate-300">{s.description}</span>
            <span
              className={`mt-4 text-xs font-semibold uppercase tracking-wide ${
                s.available ? 'text-gold' : 'text-slate-400'
              }`}
            >
              {s.available ? 'Open →' : 'Coming soon'}
            </span>
          </button>
        ))}

        {/* Placeholder slot hinting at future services */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 p-6 text-center text-slate-400">
          <span className="text-3xl">＋</span>
          <span className="mt-2 text-sm">More services coming soon</span>
        </div>
      </div>
    </div>
  )
}

export default HomeMenu
