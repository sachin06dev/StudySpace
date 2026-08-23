'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createTask,
  updateTask,
  toggleTaskStatus,
  deleteTask,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from '@/lib/data/tasks'

export type ActionResult<T = undefined> = {
  success: boolean
  data?: T
  error?: string
}

export async function createTaskAction(input: {
  title: string
  description?: string | null
  priority?: TaskPriority
  dueDate?: string | null
}): Promise<ActionResult<Task>> {
  try {
    const trimmedTitle = input.title ? input.title.trim() : ''
    if (!trimmedTitle) {
      return { success: false, error: 'Task title is required.' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const task = await createTask({
      userId: user.id,
      title: trimmedTitle,
      description: input.description,
      priority: input.priority,
      dueDate: input.dueDate,
    })

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    return { success: true, data: task }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function updateTaskAction(
  id: string,
  updates: {
    title?: string
    description?: string | null
    priority?: TaskPriority
    dueDate?: string | null
    status?: TaskStatus
  }
): Promise<ActionResult<Task>> {
  try {
    if (updates.title !== undefined) {
      const trimmed = updates.title.trim()
      if (!trimmed) {
        return { success: false, error: 'Task title cannot be empty.' }
      }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const task = await updateTask(id, user.id, updates)

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    return { success: true, data: task }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function toggleTaskStatusAction(
  id: string,
  targetStatus?: TaskStatus
): Promise<ActionResult<Task>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const task = await toggleTaskStatus(id, user.id, targetStatus)

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    return { success: true, data: task }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function deleteTaskAction(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    await deleteTask(id, user.id)

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}
