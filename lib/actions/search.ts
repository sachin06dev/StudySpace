'use server'

import { createClient } from '@/lib/supabase/server'
import { performGlobalSearch, type GroupedSearchResults } from '@/lib/data/search'

export interface SearchActionResponse {
  success: boolean
  error?: string
  results: GroupedSearchResults[]
}

/**
 * Authenticated Server Action for global multi-entity search.
 * Verifies Supabase session cookie, strictly scopes queries to the caller's user_id.
 */
export async function searchGlobalAction(query: string): Promise<SearchActionResponse> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized. Please log in to search your workspace.',
        results: [],
      }
    }

    const trimmed = query?.trim() ?? ''
    if (trimmed.length < 2) {
      return {
        success: true,
        results: [],
      }
    }

    const results = await performGlobalSearch(user.id, trimmed)
    return {
      success: true,
      results,
    }
  } catch (error: unknown) {
    console.error('Error executing global search action:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Search encountered an unexpected error.',
      results: [],
    }
  }
}
