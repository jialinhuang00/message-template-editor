import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('clicking a validation error focuses its field', async ({ page }) => {
  // Editing content makes the form dirty while Template Name stays empty,
  // surfacing the "required" error in the Validation panel.
  await page.locator('#content').fill('{{ order_id }}')

  await page.getByRole('button', { name: /Template name is required/ }).click()

  await expect(page.locator('#name')).toBeFocused()
})

test('switching channel is reflected in the preview', async ({ page }) => {
  await page.locator('#content').fill('Hi {{ customer_name }}')

  await page.getByRole('button', { name: 'WhatsApp' }).click()

  // Default channel is LINE, so a visible "WhatsApp" proves the switch.
  await expect(page.getByText('WhatsApp')).toBeVisible()
})

test('Tab loads the example into empty content', async ({ page }) => {
  await page.locator('#content').focus()
  await page.locator('#content').press('Tab')

  await expect(page.locator('#content')).toHaveValue(/Hi \{\{ customer_name \}\}/)
})

test('clicking a variable button inserts the token and the preview substitutes it', async ({
  page,
}) => {
  await page.getByRole('button', { name: '{{ customer_name }}' }).click()

  await expect(page.locator('#content')).toHaveValue('{{ customer_name }}')
  // English mock value for customer_name is "Alex".
  await expect(page.getByText('Alex')).toBeVisible()
})

test('the preview substitutes variables live as you type', async ({ page }) => {
  await page.locator('#content').fill('Hi {{ customer_name }}, order {{ order_id }}')

  await expect(page.getByText('Hi Alex, order A123456')).toBeVisible()
})

test('flags an unknown variable and invalid brace syntax', async ({ page }) => {
  await page.locator('#content').fill('{{ unknown_key }}')
  await expect(page.getByText('Unknown variable: unknown_key')).toBeVisible()

  await page.locator('#content').fill('{{{ customer_name }}}')
  await expect(page.getByText('Invalid variable syntax')).toBeVisible()
})

test('WhatsApp flags more than 5 consecutive spaces', async ({ page }) => {
  await page.getByRole('button', { name: 'WhatsApp' }).click()
  await page.locator('#content').fill(`Hi${' '.repeat(6)}there`)

  await expect(page.getByText(/more than 5 consecutive spaces/)).toBeVisible()
})

test('submitting saves the template, clears the form, and lists it for import', async ({
  page,
}) => {
  await page.locator('#name').fill('Order ready')
  await page.locator('#content').fill('Hi {{ customer_name }}')
  await page.getByRole('button', { name: 'Submit Template' }).click()

  // Payload panel shows and the form resets for the next entry.
  await expect(page.getByText('Submitted Payload')).toBeVisible()
  await expect(page.locator('#name')).toHaveValue('')

  // The saved template appears in the import selector.
  await page.locator('#library').click()
  await expect(page.getByRole('option', { name: /Order ready/ })).toBeVisible()
})

test('re-submitting a loaded template overwrites it instead of duplicating', async ({ page }) => {
  // Save one.
  await page.locator('#name').fill('Promo')
  await page.locator('#content').fill('Hi {{ customer_name }}')
  await page.getByRole('button', { name: 'Submit Template' }).click()
  await expect(page.getByText('Submitted Payload')).toBeVisible()

  // Load it back (carries its id), edit, and submit again.
  await page.locator('#library').click()
  await page.getByRole('option', { name: /Promo/ }).click()
  await expect(page.locator('#name')).toHaveValue('Promo')
  await page.locator('#content').fill('Hi {{ customer_name }}, welcome')
  await page.getByRole('button', { name: 'Submit Template' }).click()
  await expect(page.getByText('Submitted Payload')).toBeVisible()

  // Still exactly one "Promo" entry.
  await page.locator('#library').click()
  await expect(page.getByRole('option', { name: /Promo/ })).toHaveCount(1)
})
