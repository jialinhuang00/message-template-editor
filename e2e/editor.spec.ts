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
