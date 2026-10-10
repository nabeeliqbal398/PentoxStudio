import type { Access, FieldAccess, Where } from 'payload'

export type Role = 'admin' | 'editor' | 'author'

type MaybeUser = { id?: number | string; roles?: Role[] | null } | null | undefined

export const hasRole = (user: MaybeUser, ...roles: Role[]): boolean =>
  Boolean(user?.roles?.some((role) => roles.includes(role)))

export const isLoggedIn: Access = ({ req: { user } }) => Boolean(user)

export const isAdmin: Access = ({ req: { user } }) => hasRole(user, 'admin')

export const isAdminOrEditor: Access = ({ req: { user } }) => hasRole(user, 'admin', 'editor')

export const isAdminField: FieldAccess = ({ req: { user } }) => hasRole(user, 'admin')

export const isAdminOrEditorField: FieldAccess = ({ req: { user } }) =>
  hasRole(user, 'admin', 'editor')

/** Never readable/writable through the REST/GraphQL API (server code uses the Local API). */
export const nobody = () => false

/** Public sees only published docs (drafts-enabled collections); admin/editor see everything. */
export const publishedOrStaff: Access = ({ req: { user } }) =>
  hasRole(user, 'admin', 'editor') ? true : { _status: { equals: 'published' } }

/** Posts: staff see all, authors also see their own drafts, public sees published only. */
export const publishedOrOwn: Access = ({ req: { user } }) => {
  if (hasRole(user, 'admin', 'editor')) return true
  const published: Where = { _status: { equals: 'published' } }
  if (!user) return published
  return { or: [published, { createdBy: { equals: user.id } }] }
}

/** Staff see everything; the public sees only docs where `field` is true (e.g. `verified`). */
export const publicWhenTrue =
  (field: string): Access =>
  ({ req: { user } }) =>
    hasRole(user, 'admin', 'editor') ? true : { [field]: { equals: true } }

/** Admin/editor: all docs; authors: only docs they created. */
export const staffOrOwn: Access = ({ req: { user } }) => {
  if (hasRole(user, 'admin', 'editor')) return true
  if (!user) return false
  return { createdBy: { equals: user.id } }
}
