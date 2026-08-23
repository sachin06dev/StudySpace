'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createResource,
  updateResource,
  deleteResource,
  isValidUrl,
  VALID_RESOURCE_CATEGORIES,
  type WebsiteResource,
  type ResourceCategory,
} from '@/lib/data/resources'
import { createUserCategory } from '@/lib/data/categories'

export type ActionResult<T = undefined> = {
  success: boolean
  data?: T
  error?: string
}

export async function createResourceAction(input: {
  title: string
  url: string
  description?: string | null
  category?: ResourceCategory | string | null
}): Promise<ActionResult<WebsiteResource>> {
  try {
    const trimmedTitle = input.title ? input.title.trim() : ''
    if (!trimmedTitle) {
      return { success: false, error: 'Resource title is required.' }
    }

    const trimmedUrl = input.url ? input.url.trim() : ''
    if (!trimmedUrl) {
      return { success: false, error: 'Resource URL is required.' }
    }

    if (!isValidUrl(trimmedUrl)) {
      return { success: false, error: 'Please enter a valid website URL.' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Your session expired. Please sign in again.' }
    }

    const rawCategory = input.category ? (typeof input.category === 'string' ? input.category.trim() : input.category) : null

    // If it is a custom category, register it to the user's custom categories
    if (rawCategory && !VALID_RESOURCE_CATEGORIES.includes(rawCategory.toLowerCase() as ResourceCategory)) {
      try {
        await createUserCategory(user.id, { name: rawCategory })
      } catch {
        // Ignored if already exists
      }
    }

    const resource = await createResource({
      userId: user.id,
      title: trimmedTitle,
      url: trimmedUrl,
      description: input.description?.trim() || null,
      category: rawCategory,
    })

    revalidatePath('/resources')
    revalidatePath('/dashboard')
    revalidatePath('/analytics')
    return { success: true, data: resource }
  } catch (err: unknown) {
    const errObj = err as Record<string, unknown>
    console.error('[createResourceAction] Failed:', {
      message: (err as Error)?.message,
      code: errObj?.code,
      details: errObj?.details,
      hint: errObj?.hint,
    })

    if (errObj?.code === '23505') {
      return { success: false, error: 'This resource already exists in your library.' }
    }
    if (errObj?.code === '42501') {
      return { success: false, error: 'Permission denied. Please sign in again.' }
    }

    return {
      success: false,
      error: "Couldn't add this resource. Please check the resource details and try again.",
    }
  }
}

export async function updateResourceAction(
  id: string,
  updates: {
    title?: string
    url?: string
    description?: string | null
    category?: ResourceCategory | string | null
  }
): Promise<ActionResult<WebsiteResource>> {
  try {
    if (!id) {
      return { success: false, error: 'Resource ID is required.' }
    }

    if (updates.title !== undefined && !updates.title.trim()) {
      return { success: false, error: 'Resource title cannot be empty.' }
    }

    if (updates.url !== undefined) {
      const trimmedUrl = updates.url.trim()
      if (!trimmedUrl) {
        return { success: false, error: 'Resource URL cannot be empty.' }
      }
      if (!isValidUrl(trimmedUrl)) {
        return { success: false, error: 'Please enter a valid website URL.' }
      }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Your session expired. Please sign in again.' }
    }

    const resource = await updateResource(id, user.id, updates)

    revalidatePath('/resources')
    revalidatePath('/dashboard')
    revalidatePath('/analytics')
    return { success: true, data: resource }
  } catch (err: unknown) {
    const errObj = err as Record<string, unknown>
    console.error('[updateResourceAction] Failed:', {
      message: (err as Error)?.message,
      code: errObj?.code,
      details: errObj?.details,
      hint: errObj?.hint,
    })

    if (errObj?.code === '42501') {
      return { success: false, error: 'Permission denied. Please sign in again.' }
    }

    return {
      success: false,
      error: "Couldn't update this resource. Please try again.",
    }
  }
}

export async function deleteResourceAction(id: string): Promise<ActionResult> {
  try {
    if (!id) {
      return { success: false, error: 'Resource ID is required.' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Your session expired. Please sign in again.' }
    }

    await deleteResource(id, user.id)

    revalidatePath('/resources')
    revalidatePath('/dashboard')
    revalidatePath('/analytics')
    return { success: true }
  } catch (err: unknown) {
    const errObj = err as Record<string, unknown>
    console.error('[deleteResourceAction] Failed:', {
      message: (err as Error)?.message,
      code: errObj?.code,
      details: errObj?.details,
      hint: errObj?.hint,
    })

    return {
      success: false,
      error: "Couldn't delete this resource. Please try again.",
    }
  }
}

