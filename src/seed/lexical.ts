import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

// Minimal Lexical node builders so seeded long-form copy is valid editor state.
const text = (value: string) => ({
  type: 'text',
  version: 1,
  text: value,
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
})

const block = { direction: 'ltr', format: '', indent: 0, version: 1 }

export const p = (value: string) => ({
  type: 'paragraph',
  ...block,
  textFormat: 0,
  textStyle: '',
  children: [text(value)],
})

export const h = (tag: 'h2' | 'h3' | 'h4', value: string) => ({
  type: 'heading',
  tag,
  ...block,
  children: [text(value)],
})

export const ul = (items: string[]) => ({
  type: 'list',
  listType: 'bullet',
  start: 1,
  tag: 'ul',
  ...block,
  children: items.map((item, index) => ({
    type: 'listitem',
    value: index + 1,
    ...block,
    children: [text(item)],
  })),
})

export const richText = (children: unknown[]): DefaultTypedEditorState =>
  ({
    root: { type: 'root', ...block, children },
  }) as unknown as DefaultTypedEditorState
