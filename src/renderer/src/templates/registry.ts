import type { TemplateDefinition } from '../types'
import goldenIdeaTemplate from './golden-idea'
import karmaTemplate from './karma'
import plainsTemplate from './plains'
import sihoolTemplate from './sihool'
import chevronTemplate from './chevron'
import thamerTemplate from './thamer'

/**
 * The single source of truth for available templates.
 * To add a template: build its folder, then add it to this array.
 */
export const templates: TemplateDefinition[] = [
  goldenIdeaTemplate,
  karmaTemplate,
  plainsTemplate,
  sihoolTemplate,
  chevronTemplate,
  thamerTemplate
]

export function getTemplate(id: string): TemplateDefinition {
  return templates.find((t) => t.id === id) ?? templates[0]
}
