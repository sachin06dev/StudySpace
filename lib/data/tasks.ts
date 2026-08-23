import { createClient } from '@/lib/supabase/server'

export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'pending' | 'completed'

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateTaskInput {
  userId: string
  title: string
  description?: string | null
  priority?: TaskPriority
  dueDate?: string | null
}

export interface UpdateTaskInput {
  title?: string
  description?: string | null
  priority?: TaskPriority
  dueDate?: string | null
  status?: TaskStatus
  completedAt?: string | null
}

export async function getTasks(userId: string): Promise<Task[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tasks:', error)
    throw new Error('Failed to fetch tasks')
  }

  return data as Task[]
}

export async function getTask(id: string, userId: string): Promise<Task | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error(`Error fetching task ${id}:`, error)
    throw new Error('Failed to fetch task')
  }

  return data as Task
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: input.userId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      priority: input.priority || 'medium',
      due_date: input.dueDate || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating task:', error)
    throw new Error('Failed to create task')
  }

  return data as Task
}

export async function updateTask(
  id: string,
  userId: string,
  updates: UpdateTaskInput
): Promise<Task> {
  const supabase = await createClient()
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (updates.title !== undefined) {
    payload.title = updates.title.trim()
  }
  if (updates.description !== undefined) {
    payload.description = updates.description?.trim() || null
  }
  if (updates.priority !== undefined) {
    payload.priority = updates.priority
  }
  if (updates.dueDate !== undefined) {
    payload.due_date = updates.dueDate || null
  }
  if (updates.status !== undefined) {
    payload.status = updates.status
  }
  if (updates.completedAt !== undefined) {
    payload.completed_at = updates.completedAt
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error(`Error updating task ${id}:`, error)
    throw new Error('Failed to update task')
  }

  return data as Task
}

export async function toggleTaskStatus(
  id: string,
  userId: string,
  targetStatus?: TaskStatus
): Promise<Task> {
  let newStatus: TaskStatus
  if (targetStatus) {
    newStatus = targetStatus
  } else {
    const task = await getTask(id, userId)
    if (!task) {
      throw new Error('Task not found')
    }
    newStatus = task.status === 'completed' ? 'pending' : 'completed'
  }

  const completedAt = newStatus === 'completed' ? new Date().toISOString() : null

  return updateTask(id, userId, {
    status: newStatus,
    completedAt,
  })
}

export async function deleteTask(id: string, userId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error(`Error deleting task ${id}:`, error)
    throw new Error('Failed to delete task')
  }
}
