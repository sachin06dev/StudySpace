/**
 * Shared utility for resolving user display name according to the StudySpace identity priority:
 * 1. Explicit profile display_name or full_name
 * 2. user_metadata.display_name
 * 3. user_metadata.name
 * 4. user_metadata.full_name
 * 5. Cleanly formatted email local-part fallback (e.g. demo505user@example.com -> Demo505user)
 */

export interface UserIdentityInput {
  profile?: {
    display_name?: string | null
    full_name?: string | null
    name?: string | null
  } | null
  userMetadata?: Record<string, unknown> | null
  email?: string | null
}

/**
 * Formats an email local-part into readable text.
 * Example: 'demo505user' -> 'Demo505user', 'john.doe' -> 'John Doe'
 */
export function formatEmailLocalPart(email?: string | null): string {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return 'Student'
  }

  const localPart = email.split('@')[0]?.trim() || ''
  if (!localPart) {
    return 'Student'
  }

  // Handle dots, underscores, dashes
  if (/[._-]/.test(localPart)) {
    const parts = localPart.split(/[._-]+/).filter(Boolean)
    const formatted = parts
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ')
    if (formatted.length > 0) return formatted
  }

  // Capitalize first letter: demo505user -> Demo505user
  return localPart.charAt(0).toUpperCase() + localPart.slice(1)
}

/**
 * Resolves the canonical user display name from available identity fields.
 */
export function resolveUserDisplayName({
  profile,
  userMetadata,
  email,
}: UserIdentityInput): string {
  // 1. Explicit profile fields
  if (profile?.display_name && profile.display_name.trim()) {
    return profile.display_name.trim()
  }
  if (profile?.full_name && profile.full_name.trim()) {
    return profile.full_name.trim()
  }
  if (profile?.name && profile.name.trim()) {
    return profile.name.trim()
  }

  // 2. User metadata fields
  if (userMetadata) {
    const metaDisplayName = userMetadata.display_name
    if (typeof metaDisplayName === 'string' && metaDisplayName.trim()) {
      return metaDisplayName.trim()
    }

    const metaName = userMetadata.name
    if (typeof metaName === 'string' && metaName.trim()) {
      return metaName.trim()
    }

    const metaFullName = userMetadata.full_name
    if (typeof metaFullName === 'string' && metaFullName.trim()) {
      return metaFullName.trim()
    }
  }

  // 3. Formatted email local-part fallback
  return formatEmailLocalPart(email)
}
