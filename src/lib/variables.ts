import { SUPPORTED_VARIABLES, type SupportedVariable } from '@/types'

/**
 * A well-formed variable token: `{{ name }}` with optional inner spaces.
 * Only ever used with `matchAll` / `replace`, which do not rely on `lastIndex`.
 */
export const VARIABLE_TOKEN = /\{\{\s*(\w+)\s*\}\}/g

/** Names of every well-formed `{{ ... }}` token in the content, in order. */
export function extractVariableNames(content: string): string[] {
  return [...content.matchAll(VARIABLE_TOKEN)].map((match) => match[1])
}

export function isSupportedVariable(name: string): name is SupportedVariable {
  return (SUPPORTED_VARIABLES as readonly string[]).includes(name)
}
