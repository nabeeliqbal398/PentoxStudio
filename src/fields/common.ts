import type { NumberField } from 'payload'

export const sortOrderField: NumberField = {
  name: 'sortOrder',
  type: 'number',
  defaultValue: 0,
  index: true,
  admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
}
