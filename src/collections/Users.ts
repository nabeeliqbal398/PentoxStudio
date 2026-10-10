import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import { hasRole, isAdmin, isAdminField, type Role } from '../access'
import { adminGroups } from '../lib/adminGroups'

export const roleOptions: { label: string; value: Role }[] = [
  { label: 'Admin', value: 'admin' },
  { label: 'Editor', value: 'editor' },
  { label: 'Author', value: 'author' },
]

// The first account created through the admin UI must be able to run the CMS.
const makeFirstUserAdmin: CollectionBeforeValidateHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data

  const { totalDocs } = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
    req,
  })

  return totalDocs === 0 ? { ...data, roles: ['admin'] } : data
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'roles'],
    group: adminGroups.settings,
  },
  auth: {
    // Rate-limited login: lock the account for 10 minutes after 5 failed attempts.
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    tokenExpiration: 8 * 60 * 60,
  },
  access: {
    // Only admins create users; the very first user is created via the admin UI "create first user" screen.
    create: isAdmin,
    read: ({ req: { user } }) => {
      if (!user) return false
      if (hasRole(user, 'admin', 'editor')) return true
      return { id: { equals: user.id } }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (hasRole(user, 'admin')) return true
      return { id: { equals: user.id } }
    },
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [makeFirstUserAdmin],
  },
  fields: [
    // Email and password are added by `auth: true`.
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['author'],
      saveToJWT: true,
      options: roleOptions,
      // Collection-level `create` is already admin-only; only admins may change roles afterwards.
      access: { update: isAdminField },
      admin: {
        description:
          'Admin: everything. Editor: manage all content. Author: write own posts. The very first account is always created as Admin.',
      },
    },
  ],
}
