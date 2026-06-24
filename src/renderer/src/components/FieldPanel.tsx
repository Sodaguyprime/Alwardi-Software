import React, { useRef } from 'react'
import type { EditorState, FieldKey, LanguageMode } from '../types'

interface Props {
  state: EditorState
  supportedFields: FieldKey[]
  onToggle: (key: FieldKey, enabled: boolean) => void
  onValue: <K extends keyof EditorState['values']>(key: K, value: EditorState['values'][K]) => void
}

function Toggle({
  checked,
  onChange
}: {
  checked: boolean
  onChange: (v: boolean) => void
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-goldDark' : 'bg-slate-300'
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
          checked ? 'left-[18px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

function Field({
  label,
  enabled,
  onToggle,
  children
}: {
  label: string
  enabled: boolean
  onToggle: (v: boolean) => void
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <Toggle checked={enabled} onChange={onToggle} />
      </div>
      <div className={enabled ? '' : 'pointer-events-none opacity-40'}>{children}</div>
    </div>
  )
}

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-goldDark focus:ring-1 focus:ring-goldDark'

export const FieldPanel: React.FC<Props> = ({ state, supportedFields, onToggle, onValue }) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const has = (k: FieldKey): boolean => supportedFields.includes(k)

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onValue('logo', String(reader.result))
    reader.readAsDataURL(file)
  }

  const mode = state.values.languageMode

  return (
    <div className="flex h-full w-[380px] shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Letterhead Details</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {has('logo') && (
          <Field label="Logo" enabled={state.enabled.logo} onToggle={(v) => onToggle('logo', v)}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
              >
                {state.values.logo ? 'Change image' : 'Upload image'}
              </button>
              {state.values.logo && (
                <>
                  <img src={state.values.logo} alt="logo" className="h-10 w-10 rounded object-contain" />
                  <button
                    type="button"
                    onClick={() => onValue('logo', '')}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                className="hidden"
                onChange={handleLogo}
              />
            </div>
          </Field>
        )}

        {has('companyName') && (
          <Field
            label="Company Name"
            enabled={state.enabled.companyName}
            onToggle={(v) => onToggle('companyName', v)}
          >
            <div className="mb-2 flex gap-1.5">
              {(['en', 'ar', 'both'] as LanguageMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onValue('languageMode', m)}
                  className={`flex-1 rounded-md border px-2 py-1 text-xs font-medium capitalize ${
                    mode === m
                      ? 'border-goldDark bg-gold/20 text-slate-800'
                      : 'border-slate-300 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {m === 'en' ? 'English' : m === 'ar' ? 'Arabic' : 'Both'}
                </button>
              ))}
            </div>
            {(mode === 'en' || mode === 'both') && (
              <input
                className={inputClass + ' mb-2'}
                placeholder="Company name (English)"
                value={state.values.companyNameEn}
                onChange={(e) => onValue('companyNameEn', e.target.value)}
              />
            )}
            {(mode === 'ar' || mode === 'both') && (
              <input
                dir="rtl"
                className={inputClass}
                placeholder="اسم الشركة"
                value={state.values.companyNameAr}
                onChange={(e) => onValue('companyNameAr', e.target.value)}
              />
            )}
          </Field>
        )}

        {has('cr') && (
          <Field label="C.R." enabled={state.enabled.cr} onToggle={(v) => onToggle('cr', v)}>
            <input
              className={inputClass}
              placeholder="Commercial registration no."
              value={state.values.cr}
              onChange={(e) => onValue('cr', e.target.value)}
            />
          </Field>
        )}

        {has('poBox') && (
          <Field label="P.O. Box" enabled={state.enabled.poBox} onToggle={(v) => onToggle('poBox', v)}>
            <input
              className={inputClass}
              placeholder="P.O. Box"
              value={state.values.poBox}
              onChange={(e) => onValue('poBox', e.target.value)}
            />
          </Field>
        )}

        {has('postalCode') && (
          <Field
            label="P.C. (Postal Code)"
            enabled={state.enabled.postalCode}
            onToggle={(v) => onToggle('postalCode', v)}
          >
            <input
              className={inputClass}
              placeholder="Postal code"
              value={state.values.postalCode}
              onChange={(e) => onValue('postalCode', e.target.value)}
            />
          </Field>
        )}

        {has('address') && (
          <Field label="Address" enabled={state.enabled.address} onToggle={(v) => onToggle('address', v)}>
            <input
              className={inputClass}
              placeholder="Address"
              value={state.values.address}
              onChange={(e) => onValue('address', e.target.value)}
            />
          </Field>
        )}

        {has('tel') && (
          <Field label="Tel." enabled={state.enabled.tel} onToggle={(v) => onToggle('tel', v)}>
            <input
              className={inputClass}
              placeholder="Telephone"
              value={state.values.tel}
              onChange={(e) => onValue('tel', e.target.value)}
            />
          </Field>
        )}

        {has('email') && (
          <Field label="Email" enabled={state.enabled.email} onToggle={(v) => onToggle('email', v)}>
            <input
              className={inputClass}
              placeholder="Email"
              value={state.values.email}
              onChange={(e) => onValue('email', e.target.value)}
            />
          </Field>
        )}
      </div>
    </div>
  )
}

export default FieldPanel
