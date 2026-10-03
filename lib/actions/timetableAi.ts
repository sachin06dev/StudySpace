'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  scanTimetableImage,
  type DetectedClassItem,
  type ScanTimetableResult,
} from '@/lib/ai/timetableScanner'
import {
  createSemester,
  getSemester,
} from '@/lib/data/semesters'
import {
  getSubjectsBySemester,
  createSubject,
} from '@/lib/data/subjects'
import { createTimetableSlot } from '@/lib/data/timetable'

export type ActionResult<T = undefined> = {
  success: boolean
  data?: T
  error?: string
}

export interface SaveScannedTimetableInput {
  semesterId?: string | null
  newSemester?: {
    name: string
    startDate: string
    endDate: string
    setAsActive: boolean
  } | null
  classes: DetectedClassItem[]
}

/**
 * Server Action to parse a timetable image using AI Vision.
 */
export async function scanTimetableImageAction(
  formData: FormData
): Promise<ActionResult<ScanTimetableResult>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    const file = formData.get('file') as File | null
    if (!file || !(file instanceof File)) {
      return { success: false, error: 'No image file uploaded.' }
    }

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return { success: false, error: 'File size exceeds 10MB limit.' }
    }

    // Validate mime type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Uploaded file must be an image (PNG, JPEG, WebP).' }
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await scanTimetableImage(buffer, file.type)

    return { success: true, data: result }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to scan timetable image'
    return { success: false, error: message }
  }
}

/**
 * Server Action to save reviewed classes into Supabase database.
 */
export async function saveScannedTimetableAction(
  input: SaveScannedTimetableInput
): Promise<ActionResult<{ semesterId: string; savedSlotsCount: number }>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }

    if (!input.classes || input.classes.length === 0) {
      return { success: false, error: 'No classes provided to save.' }
    }

    let targetSemesterId = input.semesterId

    // 1. Resolve or create semester
    if (!targetSemesterId) {
      if (!input.newSemester || !input.newSemester.name.trim()) {
        return { success: false, error: 'Semester details are required.' }
      }

      const createdSem = await createSemester({
        userId: user.id,
        name: input.newSemester.name.trim(),
        startDate: input.newSemester.startDate,
        endDate: input.newSemester.endDate,
        isActive: input.newSemester.setAsActive,
      })
      targetSemesterId = createdSem.id
    } else {
      const existing = await getSemester(targetSemesterId, user.id)
      if (!existing) {
        return { success: false, error: 'Target semester not found.' }
      }
    }

    // 2. Fetch existing subjects in this semester to deduplicate by name
    const existingSubjects = await getSubjectsBySemester(targetSemesterId, user.id)
    const subjectMap = new Map<string, string>() // lowerCaseName -> subjectId

    for (const sub of existingSubjects) {
      subjectMap.set(sub.name.toLowerCase().trim(), sub.id)
    }

    // 3. Ensure all subjects exist or create them
    for (const item of input.classes) {
      const lowerName = item.subjectName.toLowerCase().trim()
      if (!subjectMap.has(lowerName)) {
        const newSub = await createSubject({
          userId: user.id,
          semesterId: targetSemesterId,
          name: item.subjectName.trim(),
          code: item.subjectCode?.trim() || null,
          faculty: item.faculty?.trim() || null,
          defaultRoom: item.room?.trim() || null,
          classType: item.classType || 'theory',
          targetPercentage: 75.0,
        })
        subjectMap.set(lowerName, newSub.id)
      }
    }

    // 4. Create timetable slots
    let count = 0
    for (const item of input.classes) {
      const lowerName = item.subjectName.toLowerCase().trim()
      const subjectId = subjectMap.get(lowerName)
      if (!subjectId) continue

      await createTimetableSlot({
        userId: user.id,
        semesterId: targetSemesterId,
        subjectId,
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime.length === 5 ? `${item.startTime}:00` : item.startTime,
        endTime: item.endTime.length === 5 ? `${item.endTime}:00` : item.endTime,
        roomOverride: item.room?.trim() || null,
        facultyOverride: item.faculty?.trim() || null,
        classTypeOverride: item.classType || null,
      })
      count++
    }

    revalidatePath('/timetable')
    revalidatePath('/attendance')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: {
        semesterId: targetSemesterId,
        savedSlotsCount: count,
      },
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred while saving'
    return { success: false, error: message }
  }
}
