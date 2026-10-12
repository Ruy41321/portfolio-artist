import type { Access, FieldAccess } from 'payload'

/** Any logged-in admin user. */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

export const authenticatedField: FieldAccess = ({ req: { user } }) => Boolean(user)

/** Everyone can read. */
export const anyone: Access = () => true

/** Logged-in users see everything; the public only sees published documents. */
export const publishedOrAuthenticated: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

/** Nobody through the API: only server code using the Local API with `overrideAccess`. */
export const nobody: Access = () => false
