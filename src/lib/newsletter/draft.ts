import type { Payload } from 'payload'

import { siteUrl } from './tokens'

// "Create newsletter draft" for a post: a Campaign in DRAFT status with the post's title, excerpt and a link.
// It never sends anything: an editor reviews it and starts the send from the campaign page.

const block = { direction: 'ltr', format: '', indent: 0, version: 1 }
const text = (value: string) => ({ type: 'text', version: 1, text: value, detail: 0, format: 0, mode: 'normal', style: '' })
const paragraph = (children: unknown[]) => ({ type: 'paragraph', ...block, textFormat: 0, textStyle: '', children })

export type DraftResult = { ok: true; id: number; existing: boolean } | { ok: false; error: string }

export async function createDraftFromPost(payload: Payload, postId: number): Promise<DraftResult> {
  const post = await payload.findByID({ collection: 'posts', id: postId, depth: 0, draft: true, overrideAccess: true }).catch(() => null)
  if (!post) return { ok: false, error: 'Post not found.' }

  // One draft per post: running the action twice opens the first one instead of creating a duplicate.
  const existing = await payload.find({ collection: 'campaigns', where: { fromPost: { equals: postId } }, limit: 1, depth: 0, overrideAccess: true })
  if (existing.docs[0]) return { ok: true, id: existing.docs[0].id, existing: true }

  const url = `${siteUrl()}/blog/${post.slug}/`
  const children: unknown[] = []
  if (post.excerpt) children.push(paragraph([text(post.excerpt)]))
  children.push(
    paragraph([
      {
        type: 'link',
        ...block,
        version: 3,
        id: `post-${postId}`,
        fields: { linkType: 'custom', url, newTab: false },
        children: [text(post.title)],
      },
    ]),
  )

  const campaign = await payload.create({
    collection: 'campaigns',
    overrideAccess: true,
    data: {
      subject: post.title,
      preheader: post.excerpt?.slice(0, 150),
      fromPost: postId,
      audience: 'all',
      status: 'draft',
      content: { root: { type: 'root', ...block, children } } as never,
    },
  })
  return { ok: true, id: campaign.id, existing: false }
}
