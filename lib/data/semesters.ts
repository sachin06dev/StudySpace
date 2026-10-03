import { createClient } from '@/lib/supabase/server'

export interface Semester {
  id: string
  user_id: string
  name: string
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateSemesterInput {
  userId: string
  name: string
  startDate: string
  endDate: string
  isActive?: boolean
}

export interface UpdateSemesterInput {
  name?: string
  startDate?: string
  endDate?: string
  isActive?: boolean
}

/**
 * Fetch all semesters for a user, active first then newest.
 */
export async function getSemesters(userId: string): Promise<Semester[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('semesters')
    .select('*')
    .eq('user_id', userId)
    .order('is_active', { ascending: false })
    .order('start_date', { ascending: false })

  if (error) {
    console.error('Error fetching semesters:', error)
    throw new Error('Failed to fetch semesters')
  }

  return (data || []) as Semester[]
}

/**
 * Fetch the currently active semester for a user.
 */
export async function getActiveSemester(userId: string): Promise<Semester | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('semesters')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    console.error('Error fetching active semester:', error)
    throw new Error('Failed to fetch active semester')
  }

  return data as Semester | null
}

/**
 * Fetch a single semester by ID.
 */
export async function getSemester(id: string, userId: string): Promise<Semester | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('semesters')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error(`Error fetching semester ${id}:`, error)
    throw new Error('Failed to fetch semester')
  }

  return data as Semester | null
}

/**
 * Create a new semester.
 * If isActive is true, any existing active semester is deactivated first to respect the partial unique index.
 */
export async function createSemester(input: CreateSemesterInput): Promise<Semester> {
  const supabase = await createClient()

  if (input.isActive) {
    // Deactivate existing active semester first
    const { error: deactError } = await supabase
      .from('semesters')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', input.userId)
      .eq('is_active', true)

    if (deactError) {
      console.error('Error deactivating existing active semester:', deactError)
      throw new Error('Failed to prepare active semester state')
    }
  }

  const { data, error } = await supabase
    .from('semesters')
    .insert({
      user_id: input.userId,
      name: input.name.trim(),
      start_date: input.startDate,
      end_date: input.endDate,
      is_active: input.isActive ?? false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating semester:', error)
    throw new Error('Failed to create semester')
  }

  return data as Semester
}

/**
 * Update an existing semester.
 */
export async function updateSemester(
  id: string,
  userId: string,
  updates: UpdateSemesterInput
): Promise<Semester> {
  const supabase = await createClient()

  if (updates.isActive === true) {
    // Deactivate any currently active semester (other than this one)
    const { error: deactError } = await supabase
      .from('semesters')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_active', true)
      .neq('id', id)

    if (deactError) {
      console.error('Error deactivating existing active semester:', deactError)
      throw new Error('Failed to update active semester state')
    }
  }

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (updates.name !== undefined) payload.name = updates.name.trim()
  if (updates.startDate !== undefined) payload.start_date = updates.startDate
  if (updates.endDate !== undefined) payload.end_date = updates.endDate
  if (updates.isActive !== undefined) payload.is_active = updates.isActive

  const { data, error } = await supabase
    .from('semesters')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error(`Error updating semester ${id}:`, error)
    throw new Error('Failed to update semester')
  }

  return data as Semester
}

/**
 * Atomically activate a semester for a user (deactivates current active semester first).
 */
export async function setActiveSemester(id: string, userId: string): Promise<Semester> {
  return updateSemester(id, userId, { isActive: true })
}

/**
 * Archive a semester (sets is_active = false).
 */
export async function archiveSemester(id: string, userId: string): Promise<Semester> {
  return updateSemester(id, userId, { isActive: false })
}

/**
 * Delete a semester.
 */
export async function deleteSemester(id: string, userId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('semesters')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error(`Error deleting semester ${id}:`, error)
    throw new Error('Failed to delete semester')
  }
}
