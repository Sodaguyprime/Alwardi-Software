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
  },
  {
    id: 'qr-code',
    name: 'QR Code Generator',
    description: 'Turn any link or text into a downloadable QR code.',
    icon: '🔳',
    available: true
  },
  {
    id: 'qr-logo',
    name: 'QR Code with Logo',
    description: 'Generate a QR code with your logo or PNG in the middle.',
    icon: '🖼️',
    available: true
  }
]

export const HomeMenu: React.FC<{ onOpen: (id: string) => void }> = ({ onOpen }) => {
  return (
    <div className="flex h-full flex-col items-center overflow-y-auto bg-black text-white">
      <div className="flex flex-col items-center px-6 pt-12 pb-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
          <img src={logo} alt="Alwardi" className="h-12 w-12 object-contain" />
        </div>
        <h1 className="mt-4 text-lg font-semibold tracking-tight">Alwardi Software</h1>
        <p className="mt-1 max-w-md text-xs text-neutral-500">
          Your company document suite.
        </p>
      </div>

      <div className="flex w-full max-w-md flex-col gap-2 px-6 pb-12">
        {SERVICES.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={!s.available}
            onClick={() => s.available && onOpen(s.id)}
            className={`group flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
              s.available
                ? 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                : 'cursor-not-allowed border-white/5 bg-white/[0.02] opacity-50'
            }`}
          >
            <span className="text-lg">{s.icon}</span>
            <span className="flex flex-col">
              <span className="text-sm font-medium">{s.name}</span>
              <span className="text-xs text-neutral-500">{s.description}</span>
            </span>
            <span
              className={`ml-auto text-xs ${
                s.available ? 'text-neutral-400 group-hover:text-white' : 'text-neutral-600'
              }`}
            >
              {s.available ? '→' : 'Soon'}
            </span>
          </button>
        ))}

        {/* Placeholder slot hinting at future services */}
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-white/10 px-4 py-3 text-neutral-600">
          <span className="text-lg">＋</span>
          <span className="text-xs">More services coming soon</span>
        </div>
      </div>
    </div>
  )
}

export default HomeMenu
