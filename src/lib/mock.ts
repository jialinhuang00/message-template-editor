import type { SupportedVariable } from '@/types'

/** Mock values used to render the live preview. A real app would fill these per recipient. */
export const MOCK_VALUES: Record<SupportedVariable, string> = {
  customer_name: 'Alex',
  order_id: 'A123456',
  shop_name: 'Omnichat Demo Store',
}
