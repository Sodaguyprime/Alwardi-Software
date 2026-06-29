import React, { createContext, useContext } from 'react'
import type { FieldValues } from '../types'

export interface LayoutOffset {
  x: number
  y: number
}

interface LayoutEditValue {
  /** True while "Free move" editing mode is active in the live preview. */
  enabled: boolean
  /** Start dragging the element registered under `key`. */
  beginDrag: (key: string, e: React.PointerEvent) => void
}

/**
 * Present only inside the live editor's preview. Absent during static export
 * (PDF/print render), where elements simply sit at their saved offsets with no
 * drag handles.
 */
const LayoutEditContext = createContext<LayoutEditValue | null>(null)
export const LayoutEditProvider = LayoutEditContext.Provider

type MovableProps = React.HTMLAttributes<HTMLDivElement> & { style: React.CSSProperties }

/**
 * Returns a `movable(key, style)` helper for a template preview. It merges the
 * saved drag offset for `key` into the element's `transform`, so the element
 * renders wherever the user dragged it — this flows through to PDF/print too.
 * When "Free move" mode is on, it also wires up the drag handle (move cursor,
 * dashed outline, pointer-down to start dragging).
 */
export function useMovable(fields: FieldValues): (key: string, style: React.CSSProperties) => MovableProps {
  const edit = useContext(LayoutEditContext)
  return (key, style) => {
    const off = fields.layout?.[key]
    const base = style.transform ? `${style.transform} ` : ''
    const transform = off ? `${base}translate(${off.x}px, ${off.y}px)` : style.transform
    const editing = edit?.enabled ?? false
    return {
      style: {
        ...style,
        transform,
        ...(editing
          ? { cursor: 'move', outline: '1px dashed rgba(37, 99, 235, 0.7)', outlineOffset: 2 }
          : null)
      },
      onPointerDown: editing ? (e) => edit!.beginDrag(key, e) : undefined
    }
  }
}
