import React, { useRef } from 'react'
import { toArabicDigits } from '../types'
import type { ArabicFieldKey, ColorRole, EditorState, FieldKey, LangOrder } from '../types'

interface Props {
  state: EditorState
  supportedFields: FieldKey[]
  /** Colours this template lets the user customise. */
  colorRoles: ColorRole[]
  /** Resolved current colour for each role key (`#rrggbb`). */
  colors: Record<string, string>
  /** Set a colour override (value) or reset it to the default (null). */
  onColor: (key: string, value: string | null) => void
  /** Current company-name font-size multiplier. */
  nameScale: number
  onNameScale: (scale: number) => void
  /** Current footer contact-line font-size multiplier. */
  footerScale: number
  onFooterScale: (scale: number) => void
  /** Divider-line control config (only present for templates that have a line). */
  lineControl?: { label: string; min: number; max: number }
  lineOffset: number
  onLineOffset: (offset: number) => void
  onToggle: (key: FieldKey, enabled: boolean) => void
  onArToggle: (key: ArabicFieldKey, enabled: boolean) => void
  onLangOrder: (order: LangOrder) => void
  onValue: <K extends keyof EditorState['values']>(key: K, value: EditorState['values'][K]) => void
}

function Toggle({
  checked,
  onChange,
  small
}: {
  checked: boolean
  onChange: (v: boolean) => void
  small?: boolean
}): React.JSX.Element {
  const w = small ? 'h-4 w-7' : 'h-5 w-9'
  const knob = small ? 'h-3 w-3' : 'h-4 w-4'
  const off = small ? 'left-0.5' : 'left-0.5'
  const on = small ? 'left-[14px]' : 'left-[18px]'
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative ${w} shrink-0 rounded-full transition-colors ${
        checked ? 'bg-goldDark' : 'bg-slate-300'
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 ${knob} rounded-full bg-white shadow transition-all ${
          checked ? on : off
        }`}
      />
    </button>
  )
}

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-goldDark focus:ring-1 focus:ring-goldDark'

/** A −/%/+ stepper for a font-size multiplier (1 = 100%). */
function ScaleStepper({
  label,
  value,
  onChange
}: {
  label: string
  value: number
  onChange: (v: number) => void
}): React.JSX.Element {
  return (
    <div className="mt-3">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="mt-1 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(value - 0.1)}
          className="h-7 w-7 rounded-md border border-slate-300 text-lg font-semibold leading-none text-slate-600 hover:bg-slate-50"
          title="Smaller"
        >
          −
        </button>
        <div className="flex-1 text-center text-sm font-medium tabular-nums text-slate-600">
          {Math.round(value * 100)}%
        </div>
        <button
          type="button"
          onClick={() => onChange(value + 0.1)}
          className="h-7 w-7 rounded-md border border-slate-300 text-lg font-semibold leading-none text-slate-600 hover:bg-slate-50"
          title="Larger"
        >
          +
        </button>
        {Math.round(value * 100) !== 100 && (
          <button
            type="button"
            onClick={() => onChange(1)}
            className="text-xs text-slate-400 hover:text-slate-600"
            title="Reset to default"
          >
            ↺
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * One labelled field: a master on/off toggle, the English input, and an
 * optional Arabic section (its own toggle + Arabic input) underneath.
 */
function Field({
  label,
  enabled,
  onToggle,
  children,
  arabic
}: {
  label: string
  enabled: boolean
  onToggle: (v: boolean) => void
  children: React.ReactNode
  arabic?: {
    enabled: boolean
    onToggle: (v: boolean) => void
    input: React.ReactNode
  }
}): React.JSX.Element {
  return (
    <div className="mb-4 rounded-lg border border-slate-200 p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <Toggle checked={enabled} onChange={onToggle} />
      </div>
      <div className={enabled ? '' : 'pointer-events-none opacity-40'}>
        {children}
        {arabic && (
          <div className="mt-2 border-t border-dashed border-slate-200 pt-2">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Arabic / عربي</span>
              <Toggle small checked={arabic.enabled} onChange={arabic.onToggle} />
            </div>
            {arabic.enabled && arabic.input}
          </div>
        )}
      </div>
    </div>
  )
}

export const FieldPanel: React.FC<Props> = ({
  state,
  supportedFields,
  colorRoles,
  colors,
  onColor,
  nameScale,
  onNameScale,
  footerScale,
  onFooterScale,
  lineControl,
  lineOffset,
  onLineOffset,
  onToggle,
  onArToggle,
  onLangOrder,
  onValue
}) => {
  const logoRef = useRef<HTMLInputElement>(null)
  const watermarkRef = useRef<HTMLInputElement>(null)
  const has = (k: FieldKey): boolean => supportedFields.includes(k)

  const readImage = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: 'logo' | 'watermark'
  ): void => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onValue(key, String(reader.result))
    // allow re-selecting the same file later
    e.target.value = ''
    reader.readAsDataURL(file)
  }

  /**
   * Editable Arabic-numeral input for numeric fields: anything typed is
   * converted to Arabic-Indic digits, and it reads left-to-right.
   */
  const arabicNumberInput = (
    key: keyof EditorState['values'],
    value: string
  ): React.ReactNode => (
    <input
      dir="ltr"
      className={inputClass + ' text-right'}
      value={value}
      onChange={(e) => onValue(key, toArabicDigits(e.target.value))}
    />
  )

  return (
    <div className="flex h-full w-[380px] shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Letterhead Details
        </h2>
        <div className="mt-2">
          <span className="text-xs font-medium text-slate-500">Language order</span>
          <div className="mt-1 flex gap-1.5">
            {(['ar', 'en'] as LangOrder[]).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => onLangOrder(o)}
                className={`flex-1 rounded-md border px-2 py-1 text-xs font-medium ${
                  state.langOrder === o
                    ? 'border-goldDark bg-gold/20 text-slate-800'
                    : 'border-slate-300 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {o === 'ar' ? 'Arabic first' : 'English first'}
              </button>
            ))}
          </div>
        </div>

        <ScaleStepper label="Company name size" value={nameScale} onChange={onNameScale} />
        <ScaleStepper label="Footer details size" value={footerScale} onChange={onFooterScale} />

        {lineControl && (
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-500">{lineControl.label}</span>
            <div className="mt-1 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onLineOffset(lineOffset - 5)}
                className="h-7 w-7 rounded-md border border-slate-300 text-lg font-semibold leading-none text-slate-600 hover:bg-slate-50"
                title="Lift up"
              >
                ↑
              </button>
              <div className="flex-1 text-center text-sm font-medium tabular-nums text-slate-600">
                {lineOffset > 0 ? `+${lineOffset}` : lineOffset} px
              </div>
              <button
                type="button"
                onClick={() => onLineOffset(lineOffset + 5)}
                className="h-7 w-7 rounded-md border border-slate-300 text-lg font-semibold leading-none text-slate-600 hover:bg-slate-50"
                title="Lower down"
              >
                ↓
              </button>
              {lineOffset !== 0 && (
                <button
                  type="button"
                  onClick={() => onLineOffset(0)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                  title="Reset to default"
                >
                  ↺
                </button>
              )}
            </div>
          </div>
        )}

        {colorRoles.length > 0 && (
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-500">Colors</span>
            <div className="mt-1.5 flex flex-col gap-1.5">
              {colorRoles.map((role) => {
                const value = colors[role.key] ?? role.default
                const changed = value.toLowerCase() !== role.default.toLowerCase()
                return (
                  <div key={role.key} className="flex items-center gap-2">
                    <label
                      className="relative h-7 w-7 shrink-0 cursor-pointer overflow-hidden rounded-md border border-slate-300"
                      style={{ background: value }}
                      title={`Change ${role.label}`}
                    >
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => onColor(role.key, e.target.value)}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                    </label>
                    <span className="flex-1 text-xs text-slate-600">{role.label}</span>
                    <span className="font-mono text-[10px] uppercase text-slate-400">{value}</span>
                    {changed && (
                      <button
                        type="button"
                        onClick={() => onColor(role.key, null)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                        title="Reset to default"
                      >
                        ↺
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {has('logo') && (
          <Field label="Logo" enabled={state.enabled.logo} onToggle={(v) => onToggle('logo', v)}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => logoRef.current?.click()}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
              >
                {state.values.logo ? 'Change image' : 'Upload image'}
              </button>
              {state.values.logo && (
                <>
                  <img
                    src={state.values.logo}
                    alt="logo"
                    className="h-10 w-10 rounded object-contain"
                  />
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
                ref={logoRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                className="hidden"
                onChange={(e) => readImage(e, 'logo')}
              />
            </div>
          </Field>
        )}

        {has('watermark') && (
          <Field
            label="Watermark"
            enabled={state.enabled.watermark}
            onToggle={(v) => onToggle('watermark', v)}
          >
            <p className="mb-2 text-xs text-slate-400">Shown faintly in the centre of the page.</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => watermarkRef.current?.click()}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
              >
                {state.values.watermark ? 'Change image' : 'Upload image'}
              </button>
              {state.values.watermark && (
                <>
                  <img
                    src={state.values.watermark}
                    alt="watermark"
                    className="h-10 w-10 rounded object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => onValue('watermark', '')}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </>
              )}
              <input
                ref={watermarkRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                className="hidden"
                onChange={(e) => readImage(e, 'watermark')}
              />
            </div>
          </Field>
        )}

        {has('companyName') && (
          <Field
            label="Company Name"
            enabled={state.enabled.companyName}
            onToggle={(v) => onToggle('companyName', v)}
            arabic={{
              enabled: state.arEnabled.companyName,
              onToggle: (v) => onArToggle('companyName', v),
              input: (
                <input
                  dir="rtl"
                  className={inputClass}
                  value={state.values.companyNameAr}
                  onChange={(e) => onValue('companyNameAr', e.target.value)}
                />
              )
            }}
          >
            <input
              className={inputClass}
              value={state.values.companyNameEn}
              onChange={(e) => onValue('companyNameEn', e.target.value)}
            />
          </Field>
        )}

        {has('cr') && (
          <Field
            label="C.R."
            enabled={state.enabled.cr}
            onToggle={(v) => onToggle('cr', v)}
            arabic={{
              enabled: state.arEnabled.cr,
              onToggle: (v) => onArToggle('cr', v),
              input: arabicNumberInput('crAr', state.values.crAr)
            }}
          >
            <input
              className={inputClass}
              value={state.values.cr}
              onChange={(e) => onValue('cr', e.target.value)}
            />
          </Field>
        )}

        {has('poBox') && (
          <Field
            label="P.O. Box"
            enabled={state.enabled.poBox}
            onToggle={(v) => onToggle('poBox', v)}
            arabic={{
              enabled: state.arEnabled.poBox,
              onToggle: (v) => onArToggle('poBox', v),
              input: arabicNumberInput('poBoxAr', state.values.poBoxAr)
            }}
          >
            <input
              className={inputClass}
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
            arabic={{
              enabled: state.arEnabled.postalCode,
              onToggle: (v) => onArToggle('postalCode', v),
              input: arabicNumberInput('postalCodeAr', state.values.postalCodeAr)
            }}
          >
            <input
              className={inputClass}
              value={state.values.postalCode}
              onChange={(e) => onValue('postalCode', e.target.value)}
            />
          </Field>
        )}

        {has('address') && (
          <Field
            label="Address"
            enabled={state.enabled.address}
            onToggle={(v) => onToggle('address', v)}
            arabic={{
              enabled: state.arEnabled.address,
              onToggle: (v) => onArToggle('address', v),
              input: (
                <input
                  dir="rtl"
                  className={inputClass}
                  value={state.values.addressAr}
                  onChange={(e) => onValue('addressAr', e.target.value)}
                />
              )
            }}
          >
            <input
              className={inputClass}
              value={state.values.address}
              onChange={(e) => onValue('address', e.target.value)}
            />
          </Field>
        )}

        {has('tel') && (
          <Field
            label="Tel."
            enabled={state.enabled.tel}
            onToggle={(v) => onToggle('tel', v)}
            arabic={{
              enabled: state.arEnabled.tel,
              onToggle: (v) => onArToggle('tel', v),
              input: arabicNumberInput('telAr', state.values.telAr)
            }}
          >
            <input
              className={inputClass}
              value={state.values.tel}
              onChange={(e) => onValue('tel', e.target.value)}
            />
          </Field>
        )}

        {has('email') && (
          <Field
            label="Email"
            enabled={state.enabled.email}
            onToggle={(v) => onToggle('email', v)}
            arabic={{
              enabled: state.arEnabled.email,
              onToggle: (v) => onArToggle('email', v),
              input: (
                <input
                  dir="rtl"
                  className={inputClass}
                  value={state.values.emailAr}
                  onChange={(e) => onValue('emailAr', e.target.value)}
                />
              )
            }}
          >
            <input
              className={inputClass}
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
