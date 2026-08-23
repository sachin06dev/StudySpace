export type ResourceCategory =
  | 'documentation'
  | 'course'
  | 'reference'
  | 'practice'
  | 'college'
  | 'other'

export const VALID_RESOURCE_CATEGORIES: ResourceCategory[] = [
  'documentation',
  'course',
  'reference',
  'practice',
  'college',
  'other',
]

/**
 * Normalizes any category string to a valid ResourceCategory accepted by the database check constraint.
 */
export function normalizeResourceCategory(category?: string | null): ResourceCategory | null {
  if (!category || typeof category !== 'string') {
    return null
  }
  const trimmed = category.trim().toLowerCase()
  if (!trimmed) {
    return null
  }

  if (VALID_RESOURCE_CATEGORIES.includes(trimmed as ResourceCategory)) {
    return trimmed as ResourceCategory
  }

  // Handle common aliases
  if (trimmed === 'doc' || trimmed === 'docs') return 'documentation'
  if (trimmed === 'tutorials' || trimmed === 'tutorial') return 'course'
  if (trimmed === 'cheatsheet' || trimmed === 'cheatsheets' || trimmed === 'ref') return 'reference'
  if (trimmed === 'exercises' || trimmed === 'problems') return 'practice'
  if (trimmed === 'university' || trimmed === 'school' || trimmed === 'academics') return 'college'

  // Any other custom category is stored as 'other' in the database column
  return 'other'
}

/**
 * Parses raw description and category from database row.
 * If a custom category was encoded into the description prefix (e.g. `[cat:DSA] Actual description`),
 * it extracts the custom category name and strips the prefix from the description.
 */
export function parseResourceDescriptionAndCategory(
  rawDescription: string | null,
  rawCategory: string | null
): { description: string | null; category: string | null } {
  if (!rawDescription) {
    return { description: null, category: rawCategory }
  }

  const match = rawDescription.match(/^\[cat:(.+?)\](?:\s*([\s\S]*))?$/)
  if (match) {
    const customCat = match[1].trim()
    const cleanDesc = match[2]?.trim() || null
    return {
      category: customCat || rawCategory,
      description: cleanDesc,
    }
  }

  return { description: rawDescription, category: rawCategory }
}

/**
 * Encodes category into database-safe values.
 * If the category is one of the 6 canonical database enum values, stores it directly.
 * If the category is a custom category (e.g. "Frontend Framework", "DSA"), it encodes the custom
 * category name into the description prefix `[cat:Frontend Framework]` and sets dbCategory to 'other'
 * to safely satisfy the database check constraint.
 */
export function encodeResourceDescriptionWithCategory(
  description: string | null,
  category: string | null
): { description: string | null; dbCategory: ResourceCategory | null } {
  if (!category || !category.trim()) {
    return { description: description?.trim() || null, dbCategory: null }
  }

  const trimmedCat = category.trim()
  const lowerCat = trimmedCat.toLowerCase()

  if (VALID_RESOURCE_CATEGORIES.includes(lowerCat as ResourceCategory)) {
    return {
      description: description?.trim() || null,
      dbCategory: lowerCat as ResourceCategory,
    }
  }

  // It is a custom category: encode into description prefix and set dbCategory to 'other'
  const cleanDesc = description?.trim() || ''
  const encodedDesc = cleanDesc ? `[cat:${trimmedCat}] ${cleanDesc}` : `[cat:${trimmedCat}]`

  return {
    description: encodedDesc,
    dbCategory: 'other',
  }
}

/**
 * Validates if the given string is a valid HTTP/HTTPS URL.
 */
export function isValidUrl(input: string): boolean {
  if (!input || typeof input !== 'string') return false
  const trimmed = input.trim()
  if (trimmed.includes(' ') || trimmed.includes('\n') || trimmed.includes('\t')) {
    return false
  }

  const urlToTest = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const parsed = new URL(urlToTest)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false
    }
    if (!parsed.hostname || (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost')) {
      return false
    }
    if (
      parsed.hostname.startsWith('.') ||
      parsed.hostname.endsWith('.') ||
      parsed.hostname.startsWith('-') ||
      parsed.hostname.endsWith('-')
    ) {
      return false
    }
    return true
  } catch {
    return false
  }
}

/**
 * Normalizes a URL to ensure it has https:// protocol if omitted.
 */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  return `https://${trimmed}`
}

/**
 * Extracts the hostname from a URL.
 */
export function extractHostname(input: string): string | null {
  try {
    const normalized = normalizeUrl(input)
    const parsed = new URL(normalized)
    return parsed.hostname
  } catch {
    return null
  }
}

/**
 * Generates a Google S2 favicon URL from the input URL.
 */
export function getFaviconUrl(input: string): string | null {
  try {
    const hostname = extractHostname(input)
    if (!hostname) return null
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`
  } catch {
    return null
  }
}
