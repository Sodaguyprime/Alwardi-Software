import React, { useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_EDITOR_STATE, toFieldValues } from './types'
import type { EditorState, FieldKey } from './types'
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
          setState({ ...DEFAULT_EDITOR_STATE, ...s.state })
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
  const fields = useMemo(() => toFieldValues(state), [state])

  const handleToggle = (key: FieldKey, enabled: boolean): void =>
    setState((s) => ({ ...s, enabled: { ...s.enabled, [key]: enabled } }))

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
          onToggle={handleToggle}
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
