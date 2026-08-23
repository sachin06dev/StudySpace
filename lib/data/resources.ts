import { createClient } from '@/lib/supabase/server'
import {
  type ResourceCategory,
  VALID_RESOURCE_CATEGORIES,
  normalizeResourceCategory,
  parseResourceDescriptionAndCategory,
  encodeResourceDescriptionWithCategory,
  normalizeUrl,
  getFaviconUrl,
  isValidUrl,
  extractHostname,
} from '@/lib/resources/utils'

export {
  type ResourceCategory,
  VALID_RESOURCE_CATEGORIES,
  normalizeResourceCategory,
  parseResourceDescriptionAndCategory,
  encodeResourceDescriptionWithCategory,
  normalizeUrl,
  getFaviconUrl,
  isValidUrl,
  extractHostname,
}

export interface WebsiteResource {
  id: string
  user_id: string
  title: string
  url: string
  description: string | null
  category: string | null
  favicon_url: string | null
  created_at: string
  updated_at: string
}

export interface CreateResourceInput {
  userId: string
  title: string
  url: string
  description?: string | null
  category?: ResourceCategory | string | null
  faviconUrl?: string | null
}

export interface UpdateResourceInput {
  title?: string
  url?: string
  description?: string | null
  category?: ResourceCategory | string | null
  faviconUrl?: string | null
}

/**
 * Fetches all website resources for a user, ordered with newest first.
 */
export async function getResources(userId: string): Promise<WebsiteResource[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('website_resources')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Get Resources] Error fetching website resources:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    throw new Error('Failed to fetch website resources')
  }

  return (data || []).map((row) => {
    const { category, description } = parseResourceDescriptionAndCategory(
      row.description,
      row.category
    )
    return {
      ...row,
      category,
      description,
    }
  }) as WebsiteResource[]
}

/**
 * Fetches a single resource by ID and user ID.
 */
export async function getResource(id: string, userId: string): Promise<WebsiteResource | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('website_resources')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error(`[Get Resource] Error fetching website resource ${id}:`, {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    throw new Error('Failed to fetch website resource')
  }

  const { category, description } = parseResourceDescriptionAndCategory(
    data.description,
    data.category
  )

  return {
    ...data,
    category,
    description,
  } as WebsiteResource
}

/**
 * Creates a new website resource for a user.
 */
export async function createResource(input: CreateResourceInput): Promise<WebsiteResource> {
  const supabase = await createClient()

  const normalizedUrl = normalizeUrl(input.url)
  const favicon = input.faviconUrl ?? getFaviconUrl(normalizedUrl)

  const { description: encodedDescription, dbCategory } = encodeResourceDescriptionWithCategory(
    input.description || null,
    input.category || null
  )

  const { data, error } = await supabase
    .from('website_resources')
    .insert({
      user_id: input.userId,
      title: input.title.trim(),
      url: normalizedUrl,
      description: encodedDescription,
      category: dbCategory,
      favicon_url: favicon,
    })
    .select()
    .single()

  if (error) {
    console.error('[Add Resource] Supabase insert failed', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    throw error
  }

  const { category, description } = parseResourceDescriptionAndCategory(
    data.description,
    data.category
  )

  return {
    ...data,
    category,
    description,
  } as WebsiteResource
}

/**
 * Updates an existing website resource.
 */
export async function updateResource(
  id: string,
  userId: string,
  updates: UpdateResourceInput
): Promise<WebsiteResource> {
  const supabase = await createClient()

  // First fetch current record if category or description needs updating
  let currentRecord: WebsiteResource | null = null
  if (updates.category !== undefined || updates.description !== undefined) {
    currentRecord = await getResource(id, userId)
  }

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (updates.title !== undefined) {
    payload.title = updates.title.trim()
  }

  if (updates.url !== undefined) {
    const normalizedUrl = normalizeUrl(updates.url)
    payload.url = normalizedUrl
    payload.favicon_url = updates.faviconUrl ?? getFaviconUrl(normalizedUrl)
  } else if (updates.faviconUrl !== undefined) {
    payload.favicon_url = updates.faviconUrl
  }

  if (updates.category !== undefined || updates.description !== undefined) {
    const targetCategory =
      updates.category !== undefined ? updates.category : currentRecord?.category || null
    const targetDesc =
      updates.description !== undefined ? updates.description : currentRecord?.description || null

    const { description: encodedDescription, dbCategory } = encodeResourceDescriptionWithCategory(
      targetDesc,
      targetCategory
    )

    payload.description = encodedDescription
    payload.category = dbCategory
  }

  const { data, error } = await supabase
    .from('website_resources')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error(`[Update Resource] Supabase update failed for ${id}:`, {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    throw error
  }

  const { category, description } = parseResourceDescriptionAndCategory(
    data.description,
    data.category
  )

  return {
    ...data,
    category,
    description,
  } as WebsiteResource
}

/**
 * Deletes a website resource.
 */
export async function deleteResource(id: string, userId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('website_resources')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error(`Error deleting website resource ${id}:`, error)
    throw new Error(error.message || 'Failed to delete website resource')
  }
}

