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

  const Preview = template.Preview

  return (
    <div ref={containerRef} className="flex h-full flex-1 items-center justify-center overflow-auto bg-slate-100 p-8">
      <div
        style={{
          width: A4_W * scale,
          height: A4_H * scale,
          flexShrink: 0
        }}
      >
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
    </div>
  )
}

export default PreviewPanel
