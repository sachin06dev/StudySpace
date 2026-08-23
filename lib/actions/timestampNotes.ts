'use server'

import { createClient } from '@/lib/supabase/server'
import {
  createNote,
  updateNote,
  deleteNote,
  type VideoTimestampNote,
} from '@/lib/data/timestampNotes'

export type ActionResult<T = undefined> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Server action to create a new timestamp note for a video.
 */
export async function createNoteAction(input: {
  videoId: string
  timestampSeconds: number
  content: string
}): Promise<ActionResult<VideoTimestampNote>> {
  try {
    const trimmedContent = input.content ? input.content.trim() : ''
    if (!trimmedContent) {
      return { success: false, error: 'Note content cannot be empty.' }
    }

    if (!input.videoId) {
      return { success: false, error: 'Video ID is required.' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const note = await createNote({
      userId: user.id,
      videoId: input.videoId,
      timestampSeconds: Math.max(0, Math.floor(input.timestampSeconds || 0)),
      content: trimmedContent,
    })

    return { success: true, data: note }
  } catch (err: unknown) {
    console.error('Error in createNoteAction:', err)
    const message = err instanceof Error ? err.message : 'Failed to create timestamp note.'
    return { success: false, error: message }
  }
}

/**
 * Server action to update note content.
 */
export async function updateNoteAction(
  id: string,
  content: string
): Promise<ActionResult<VideoTimestampNote>> {
  try {
    const trimmedContent = content ? content.trim() : ''
    if (!trimmedContent) {
      return { success: false, error: 'Note content cannot be empty.' }
    }

    if (!id) {
      return { success: false, error: 'Note ID is required.' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const updatedNote = await updateNote(id, user.id, trimmedContent)

    return { success: true, data: updatedNote }
  } catch (err: unknown) {
    console.error('Error in updateNoteAction:', err)
    const message = err instanceof Error ? err.message : 'Failed to update timestamp note.'
    return { success: false, error: message }
  }
}

/**
 * Server action to delete a timestamp note.
 */
export async function deleteNoteAction(id: string): Promise<ActionResult> {
  try {
    if (!id) {
      return { success: false, error: 'Note ID is required.' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    await deleteNote(id, user.id)

    return { success: true }
  } catch (err: unknown) {
    console.error('Error in deleteNoteAction:', err)
    const message = err instanceof Error ? err.message : 'Failed to delete timestamp note.'
    return { success: false, error: message }
  }
}
