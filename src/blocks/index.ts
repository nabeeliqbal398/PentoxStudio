import type { Block } from 'payload'

import { youtubeUrlField } from '../fields/youtube'

export const CalloutBlock: Block = {
  slug: 'callout',
  interfaceName: 'CalloutBlock',
  labels: { singular: 'Callout', plural: 'Callouts' },
  fields: [
    {
      name: 'tone',
      type: 'select',
      defaultValue: 'info',
      required: true,
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Tip', value: 'tip' },
        { label: 'Warning', value: 'warning' },
      ],
    },
    { name: 'title', type: 'text' },
    { name: 'body', type: 'textarea', required: true },
  ],
}

export const CtaBlock: Block = {
  slug: 'cta',
  interfaceName: 'CtaBlock',
  labels: { singular: 'Call to action', plural: 'Calls to action' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'text', type: 'textarea' },
    { name: 'buttonLabel', type: 'text', required: true, defaultValue: 'Get your free audit' },
    {
      name: 'buttonUrl',
      type: 'text',
      required: true,
      defaultValue: '/free-audit/',
      admin: { description: 'Site path (e.g. /free-audit/) or full URL.' },
    },
  ],
}

export const FaqBlock: Block = {
  slug: 'faq',
  interfaceName: 'FaqBlock',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Frequently asked questions' },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
  ],
}

export const YoutubeBlock: Block = {
  slug: 'youtube',
  interfaceName: 'YoutubeBlock',
  labels: { singular: 'YouTube video', plural: 'YouTube videos' },
  fields: [
    { ...youtubeUrlField('url'), required: true },
    { name: 'title', type: 'text', admin: { description: 'Accessible title for the embed.' } },
  ],
}

export const contentBlocks: Block[] = [CalloutBlock, CtaBlock, FaqBlock, YoutubeBlock]
