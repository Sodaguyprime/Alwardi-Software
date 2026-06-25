import React, { useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_EDITOR_STATE, resolveColors, toArabicDigits, toFieldValues } from './types'
import type { ArabicFieldKey, EditorState, FieldKey, LangOrder } from './types'
import { getTemplate } from './templates/registry'
import TemplatePicker from './components/TemplatePicker'
import FieldPanel from './components/FieldPanel'
import PreviewPanel from './components/PreviewPanel'
import ExportBar from './components/ExportBar'
import HomeMenu from './components/HomeMenu'
import { buildStandaloneHtml, exportDocx, printLetterhead } from './lib/exporters'

type View = 'home' | 'letterhead'

function App(): React.JSX.Element {
  const [view, setView] = useState<View>('home')
  const [state, setState] = useState<EditorState>(DEFAULT_EDITOR_STATE)
  const [templateId, setTemplateId] = useState<string>('golden-idea')
  const [loaded, setLoaded] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()

  // Load persisted values on first launch.
  useEffect(() => {
    let active = true
    window.api
      .getFields()
      .then((saved) => {
        if (active && saved && (saved as { state?: EditorState }).state) {
          const s = saved as { state: EditorState; templateId?: string }
          // Deep-merge so fields added in later versions fall back to defaults
          // instead of becoming `undefined` (which breaks controlled inputs).
          setState({
            ...DEFAULT_EDITOR_STATE,
            ...s.state,
            enabled: { ...DEFAULT_EDITOR_STATE.enabled, ...s.state.enabled },
            arEnabled: { ...DEFAULT_EDITOR_STATE.arEnabled, ...s.state.arEnabled },
            nameScale: s.state.nameScale ?? DEFAULT_EDITOR_STATE.nameScale,
            footerScale: s.state.footerScale ?? DEFAULT_EDITOR_STATE.footerScale,
            lineOffset: s.state.lineOffset ?? DEFAULT_EDITOR_STATE.lineOffset,
            colors: { ...DEFAULT_EDITOR_STATE.colors, ...s.state.colors },
            values: { ...DEFAULT_EDITOR_STATE.values, ...s.state.values }
          })
          if (s.templateId) setTemplateId(s.templateId)
        }
      })
      .finally(() => active && setLoaded(true))
    return () => {
      active = false
    }
  }, [])

  // Debounced persistence.
  useEffect(() => {
    if (!loaded) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      window.api.setFields({ state, templateId })
    }, 300)
  }, [state, templateId, loaded])

  const template = useMemo(() => getTemplate(templateId), [templateId])
  const fields = useMemo(() => toFieldValues(state, template), [state, template])
  // Effective colours for the current template (override ?? default), for the picker UI.
  const colors = useMemo(() => resolveColors(template, state), [template, state])

  const handleToggle = (key: FieldKey, enabled: boolean): void =>
    setState((s) => ({ ...s, enabled: { ...s.enabled, [key]: enabled } }))

  // Turning Arabic on for a numeric field seeds its (editable) Arabic box with
  // the English number converted to Arabic-Indic digits — only if still empty.
  const NUMERIC_AR: Partial<Record<ArabicFieldKey, [keyof EditorState['values'], keyof EditorState['values']]>> = {
    cr: ['cr', 'crAr'],
    poBox: ['poBox', 'poBoxAr'],
    postalCode: ['postalCode', 'postalCodeAr'],
    tel: ['tel', 'telAr']
  }

  const handleArToggle = (key: ArabicFieldKey, enabled: boolean): void =>
    setState((s) => {
      const arEnabled = { ...s.arEnabled, [key]: enabled }
      const seed = NUMERIC_AR[key]
      if (enabled && seed) {
        const [enKey, arKey] = seed
        if (!s.values[arKey] && s.values[enKey]) {
          return {
            ...s,
            arEnabled,
            values: { ...s.values, [arKey]: toArabicDigits(s.values[enKey]) }
          }
        }
      }
      return { ...s, arEnabled }
    })

  const handleLangOrder = (order: LangOrder): void =>
    setState((s) => ({ ...s, langOrder: order }))

  // Company-name font size, clamped to a sensible range.
  const handleNameScale = (scale: number): void =>
    setState((s) => ({ ...s, nameScale: Math.min(2, Math.max(0.6, Math.round(scale * 100) / 100)) }))

  // Footer contact-line font size, clamped to a sensible range.
  const handleFooterScale = (scale: number): void =>
    setState((s) => ({ ...s, footerScale: Math.min(2, Math.max(0.6, Math.round(scale * 100) / 100)) }))

  // Divider-line vertical offset (clamped by the template's lineControl).
  const handleLineOffset = (offset: number): void =>
    setState((s) => {
      const lc = template.lineControl
      const clamped = lc ? Math.min(lc.max, Math.max(lc.min, offset)) : offset
      return { ...s, lineOffset: Math.round(clamped) }
    })

  // Set/clear a colour override for the current template.
  const handleColor = (key: string, value: string | null): void =>
    setState((s) => {
      const current = { ...(s.colors[templateId] ?? {}) }
      if (value === null) delete current[key]
      else current[key] = value
      return { ...s, colors: { ...s.colors, [templateId]: current } }
    })

  const handleValue = <K extends keyof EditorState['values']>(
    key: K,
    value: EditorState['values'][K]
  ): void => setState((s) => ({ ...s, values: { ...s.values, [key]: value } }))

  const handleReset = (): void => {
    setState(DEFAULT_EDITOR_STATE)
    window.api.clearFields()
  }

  const handleExportPdf = async (): Promise<void> => {
    const html = buildStandaloneHtml(template, fields)
    const res = await window.api.exportPdf(html)
    if (!res.ok && res.error) throw new Error(res.error)
  }

  if (view === 'home') {
    return <HomeMenu onOpen={(id) => id === 'letterhead' && setView('letterhead')} />
  }

  return (
    <div className="flex h-full flex-col">
      <TemplatePicker selectedId={templateId} onSelect={setTemplateId} onHome={() => setView('home')} />
      <div className="flex min-h-0 flex-1">
        <FieldPanel
          state={state}
          supportedFields={template.supportedFields}
          colorRoles={template.colorRoles ?? []}
          colors={colors}
          onColor={handleColor}
          nameScale={state.nameScale}
          onNameScale={handleNameScale}
          footerScale={state.footerScale}
          onFooterScale={handleFooterScale}
          lineControl={template.lineControl}
          lineOffset={state.lineOffset}
          onLineOffset={handleLineOffset}
          onToggle={handleToggle}
          onArToggle={handleArToggle}
          onLangOrder={handleLangOrder}
          onValue={handleValue}
        />
        <PreviewPanel template={template} fields={fields} />
      </div>
      <ExportBar
        onExportDocx={async () => {
          await exportDocx(template, fields)
        }}
        onExportPdf={handleExportPdf}
        onPrint={() => printLetterhead(template, fields)}
        onReset={handleReset}
      />
    </div>
  )
}

export default App
