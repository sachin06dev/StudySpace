import { createClient } from '@/lib/supabase/server'

export type ClassType = 'theory' | 'lab' | 'tutorial' | 'other'

export interface Subject {
  id: string
  user_id: string
  semester_id: string
  name: string
  code: string | null
  faculty: string | null
  default_room: string | null
  class_type: ClassType
  credits: number | null
  target_percentage: number | null
  baseline_attended: number
  baseline_total: number
  is_archived?: boolean
  created_at: string
  updated_at: string
}

export interface CreateSubjectInput {
  userId: string
  semesterId: string
  name: string
  code?: string | null
  faculty?: string | null
  defaultRoom?: string | null
  classType?: ClassType
  credits?: number | null
  targetPercentage?: number | null
  baselineAttended?: number
  baselineTotal?: number
}

export interface UpdateSubjectInput {
  name?: string
  code?: string | null
  faculty?: string | null
  defaultRoom?: string | null
  classType?: ClassType
  credits?: number | null
  targetPercentage?: number | null
  baselineAttended?: number
  baselineTotal?: number
  isArchived?: boolean
}

/**
 * Fetch all subjects for a given semester belonging to the user.
 */
export async function getSubjectsBySemester(
  semesterId: string,
  userId: string,
  includeArchived = false
): Promise<Subject[]> {
  const supabase = await createClient()
  let query = supabase
    .from('subjects')
    .select('*')
    .eq('semester_id', semesterId)
    .eq('user_id', userId)

  if (!includeArchived) {
    query = query.eq('is_archived', false)
  }

  const { data, error } = await query.order('name', { ascending: true })

  if (error) {
    console.error('Error fetching subjects:', error)
    throw new Error('Failed to fetch subjects')
  }

  return (data || []) as Subject[]
}

import { cache } from 'react'

/**
 * Fetch a single subject by ID.
 * Wrapped in React cache to deduplicate between generateMetadata and Page execution.
 */
export const getSubject = cache(async (id: string, userId: string): Promise<Subject | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error(`Error fetching subject ${id}:`, error)
    throw new Error('Failed to fetch subject')
  }

  return data as Subject | null
})

/**
 * Check if real attendance records already exist for a given subject.
 */
export async function hasRealAttendanceRecords(subjectId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('attendance_records')
    .select('id', { count: 'exact', head: true })
    .eq('subject_id', subjectId)
    .eq('user_id', userId)

  if (error) {
    console.error(`Error checking attendance records for subject ${subjectId}:`, error)
    return false
  }

  return (count ?? 0) > 0
}

/**
 * Create a new subject within a semester.
 */
export async function createSubject(input: CreateSubjectInput): Promise<Subject> {
  const supabase = await createClient()

  // Validate baseline integrity
  const baselineAttended = input.baselineAttended ?? 0
  const baselineTotal = input.baselineTotal ?? 0
  if (baselineAttended < 0 || baselineTotal < 0 || baselineAttended > baselineTotal) {
    throw new Error('Baseline attended must be between 0 and baseline total')
  }

  // Validate target percentage if provided
  if (input.targetPercentage !== undefined && input.targetPercentage !== null) {
    if (input.targetPercentage < 0 || input.targetPercentage > 100) {
      throw new Error('Target percentage must be between 0 and 100')
    }
  }

  const { data, error } = await supabase
    .from('subjects')
    .insert({
      user_id: input.userId,
      semester_id: input.semesterId,
      name: input.name.trim(),
      code: input.code?.trim() || null,
      faculty: input.faculty?.trim() || null,
      default_room: input.defaultRoom?.trim() || null,
      class_type: input.classType || 'theory',
      credits: input.credits ?? null,
      target_percentage: input.targetPercentage ?? null,
      baseline_attended: baselineAttended,
      baseline_total: baselineTotal,
      is_archived: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating subject:', error)
    throw new Error('Failed to create subject')
  }

  return data as Subject
}

/**
 * Update a subject.
 */
export async function updateSubject(
  id: string,
  userId: string,
  updates: UpdateSubjectInput
): Promise<Subject> {
  const supabase = await createClient()

  // If baseline is being updated, verify whether real attendance records exist
  if (updates.baselineAttended !== undefined || updates.baselineTotal !== undefined) {
    const currentSubject = await getSubject(id, userId)
    if (!currentSubject) {
      throw new Error('Subject not found')
    }

    const newAttended = updates.baselineAttended ?? currentSubject.baseline_attended
    const newTotal = updates.baselineTotal ?? currentSubject.baseline_total

    if (newAttended < 0 || newTotal < 0 || newAttended > newTotal) {
      throw new Error('Baseline attended must be between 0 and baseline total')
    }

    const hasRecords = await hasRealAttendanceRecords(id, userId)
    if (
      hasRecords &&
      (updates.baselineAttended !== currentSubject.baseline_attended ||
        updates.baselineTotal !== currentSubject.baseline_total)
    ) {
      // Do not silently alter baseline if records exist
      throw new Error(
        'Cannot modify baseline attendance because live attendance records already exist for this subject.'
      )
    }
  }

  if (updates.targetPercentage !== undefined && updates.targetPercentage !== null) {
    if (updates.targetPercentage < 0 || updates.targetPercentage > 100) {
      throw new Error('Target percentage must be between 0 and 100')
    }
  }

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (updates.name !== undefined) payload.name = updates.name.trim()
  if (updates.code !== undefined) payload.code = updates.code?.trim() || null
  if (updates.faculty !== undefined) payload.faculty = updates.faculty?.trim() || null
  if (updates.defaultRoom !== undefined) payload.default_room = updates.defaultRoom?.trim() || null
  if (updates.classType !== undefined) payload.class_type = updates.classType
  if (updates.credits !== undefined) payload.credits = updates.credits ?? null
  if (updates.targetPercentage !== undefined) payload.target_percentage = updates.targetPercentage ?? null
  if (updates.baselineAttended !== undefined) payload.baseline_attended = updates.baselineAttended
  if (updates.baselineTotal !== undefined) payload.baseline_total = updates.baselineTotal
  if (updates.isArchived !== undefined) payload.is_archived = updates.isArchived

  const { data, error } = await supabase
    .from('subjects')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error(`Error updating subject ${id}:`, error)
    throw new Error('Failed to update subject')
  }

  return data as Subject
}

/**
 * Archive a subject safely: marks is_archived = true and cleans up recurring timetable slots
 * so future classes are not scheduled, while preserving 100% of historical attendance records.
 */
export async function archiveSubject(id: string, userId: string): Promise<Subject> {
  const supabase = await createClient()

  // 1. Remove recurring timetable slots for this subject
  const { error: slotsError } = await supabase
    .from('timetable_slots')
    .delete()
    .eq('subject_id', id)
    .eq('user_id', userId)

  if (slotsError) {
    console.error(`Error removing slots for subject ${id}:`, slotsError)
  }

  // 2. Mark subject archived
  const { data, error } = await supabase
    .from('subjects')
    .update({
      is_archived: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error(`Error archiving subject ${id}:`, error)
    throw new Error('Failed to archive subject')
  }

  return data as Subject
}

/**
 * Delete a subject permanently.
 * Safety check: If real attendance records or baseline classes exist, reject hard deletion
 * and advise archiving instead to protect academic history.
 */
export async function deleteSubject(id: string, userId: string): Promise<void> {
  const supabase = await createClient()

  const subject = await getSubject(id, userId)
  if (!subject) {
    throw new Error('Subject not found')
  }

  const hasRecords = await hasRealAttendanceRecords(id, userId)
  if (hasRecords || subject.baseline_total > 0) {
    throw new Error(
      'Cannot permanently delete this subject because attendance records exist. Please archive the subject instead to preserve your academic records.'
    )
  }

  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error(`Error deleting subject ${id}:`, error)
    throw new Error('Failed to delete subject')
  }
}
