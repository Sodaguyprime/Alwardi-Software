import type { TemplateDefinition } from '../types'
import goldenIdeaTemplate from './golden-idea'

/**
 * The single source of truth for available templates.
 * To add a template: build its folder, then add it to this array.
 */
export const templates: TemplateDefinition[] = [goldenIdeaTemplate]

export function getTemplate(id: string): TemplateDefinition {
  return templates.find((t) => t.id === id) ?? templates[0]
}
