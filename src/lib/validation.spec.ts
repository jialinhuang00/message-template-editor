import { describe, expect, it } from 'vitest'
import { validateTemplate } from '@/lib/validation'
import type { TemplateForm } from '@/types'

/** A form that passes every rule; tests override one field at a time. */
function validForm(overrides: Partial<TemplateForm> = {}): TemplateForm {
  return {
    name: 'Order ready',
    channel: 'LINE',
    language: 'en',
    title: '',
    content: 'Hi {{ customer_name }}, your order {{ order_id }} is ready.',
    ...overrides,
  }
}

const messages = (form: TemplateForm) => validateTemplate(form).map((e) => e.message)

describe('validateTemplate', () => {
  it('returns no errors for a valid form', () => {
    expect(validateTemplate(validForm())).toEqual([])
  })

  it('accepts a variable without inner spaces', () => {
    expect(validateTemplate(validForm({ content: '{{customer_name}}' }))).toEqual([])
  })

  describe('required fields', () => {
    it('flags an empty name', () => {
      expect(messages(validForm({ name: '   ' }))).toContain('Template name is required')
    })

    it('flags an unselected channel', () => {
      expect(messages(validForm({ channel: '' }))).toContain('Channel is required')
    })

    it('flags empty content', () => {
      expect(messages(validForm({ content: '' }))).toContain('Message content is required')
    })
  })

  describe('length', () => {
    it('accepts exactly 500 characters', () => {
      expect(validateTemplate(validForm({ content: 'a'.repeat(500) }))).toEqual([])
    })

    it('rejects 501 characters', () => {
      expect(messages(validForm({ content: 'a'.repeat(501) }))).toContain(
        'Message content cannot exceed 500 characters',
      )
    })
  })

  describe('variables', () => {
    it('flags an unknown variable by name', () => {
      expect(messages(validForm({ content: 'Hi {{ user_name }}' }))).toContain(
        'Unknown variable: user_name',
      )
    })

    it('flags each unknown variable', () => {
      const msgs = messages(validForm({ content: '{{ foo }} {{ bar }}' }))
      expect(msgs).toContain('Unknown variable: foo')
      expect(msgs).toContain('Unknown variable: bar')
    })

    it('flags a missing closing brace as invalid syntax', () => {
      expect(messages(validForm({ content: 'Hi {{ customer_name }' }))).toContain(
        'Invalid variable syntax',
      )
    })

    it('flags a single-brace token as invalid syntax', () => {
      expect(messages(validForm({ content: 'Hi { customer_name }}' }))).toContain(
        'Invalid variable syntax',
      )
    })

    it('does not flag a well-formed token as invalid syntax', () => {
      expect(messages(validForm())).not.toContain('Invalid variable syntax')
    })
  })

  describe('channel-specific rules', () => {
    const spaces = `Hi${' '.repeat(6)}there`

    it('flags 6+ consecutive spaces on WhatsApp', () => {
      expect(messages(validForm({ channel: 'WhatsApp', content: spaces }))).toContain(
        'WhatsApp message cannot contain more than 5 consecutive spaces',
      )
    })

    it('allows exactly 5 consecutive spaces on WhatsApp', () => {
      const five = `Hi${' '.repeat(5)}there`
      expect(messages(validForm({ channel: 'WhatsApp', content: five }))).not.toContain(
        'WhatsApp message cannot contain more than 5 consecutive spaces',
      )
    })

    it('does not apply the WhatsApp rule to other channels', () => {
      expect(messages(validForm({ channel: 'LINE', content: spaces }))).not.toContain(
        'WhatsApp message cannot contain more than 5 consecutive spaces',
      )
    })
  })

  it('accumulates multiple errors at once', () => {
    const msgs = messages(validForm({ name: '', channel: '', content: '{{ user_name }}' }))
    expect(msgs).toContain('Template name is required')
    expect(msgs).toContain('Channel is required')
    expect(msgs).toContain('Unknown variable: user_name')
  })
})
