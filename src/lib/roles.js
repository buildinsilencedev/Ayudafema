/**
 * Role helpers.
 * Roles live in public.profiles.role — not in JWT claims by default.
 * Supabase allows embedding custom claims via a hook, but until that's
 * configured we check the profile row fetched in useAuth.
 */

/** @param {{ role?: string } | null} profile */
export function isAttorney(profile) {
  return profile?.role === 'attorney' || profile?.role === 'admin'
}

/** @param {{ role?: string } | null} profile */
export function isAdmin(profile) {
  return profile?.role === 'admin'
}
