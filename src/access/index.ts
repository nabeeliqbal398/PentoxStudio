import type { Access, FieldAccess } from 'payload'

export type Role = 'admin' | 'editor' | 'author'

type MaybeUser = { roles?: Role[] | null } | null | undefined

export const hasRole = (user: MaybeUser, ...roles: Role[]): boolean =>
  Boolean(user?.roles?.some((role) => roles.includes(role)))

export const isLoggedIn: Access = ({ req: { user } }) => Boolean(user)

export const isAdmin: Access = ({ req: { user } }) => hasRole(user, 'admin')

export const isAdminOrEditor: Access = ({ req: { user } }) => hasRole(user, 'admin', 'editor')

export const isAdminField: FieldAccess = ({ req: { user } }) => hasRole(user, 'admin')
