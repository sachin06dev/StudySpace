import type { Subject } from '@/lib/data/subjects'
import type { AttendanceRecord } from '@/lib/data/attendance'

export type RiskState = 'SAFE' | 'WARNING' | 'CRITICAL'

export interface SubjectAttendanceSummary {
  subject: Subject
  effectiveAttended: number
  effectiveTotal: number
  presentCount: number
  absentCount: number
  cancelledCount: number
  percentage: number
  targetPercentage: number
  bunkAllowance: number // How many classes user can miss
  recoveryRequirement: number // How many consecutive classes needed to reach target
  riskState: RiskState
  statusMessage: string
}

export interface OverallAttendanceSummary {
  totalAttended: number
  totalClasses: number
  overallPercentage: number
  targetPercentage: number
  bunkAllowance: number
  recoveryRequirement: number
  riskState: RiskState
  statusMessage: string
  criticalSubjectsCount: number
  warningSubjectsCount: number
  safeSubjectsCount: number
  totalSubjectsCount: number
}

/**
 * Calculate the maximum additional classes a student can miss while staying at or above target.
 */
export function calculateBunkAllowance(attended: number, total: number, target: number): number {
  if (target <= 0) return 999
  if (target > 100) return 0
  if (total === 0) return 0

  const currentPercent = (attended / total) * 100
  if (currentPercent < target) return 0

  // attended / (total + m) >= target / 100 => m <= (attended * 100 / target) - total
  const maxMiss = Math.floor((attended * 100) / target - total)
  return Math.max(0, maxMiss)
}

/**
 * Calculate the minimum consecutive classes a student must attend to reach target percentage.
 */
export function calculateRecoveryRequirement(attended: number, total: number, target: number): number {
  if (target <= 0) return 0
  if (total === 0) return 0

  const currentPercent = (attended / total) * 100
  if (currentPercent >= target) return 0

  if (target >= 100) {
    // If target is 100% and any absence exists, 100% can never be mathematically reached
    return attended < total ? Infinity : 0
  }

  // (attended + r) / (total + r) >= target / 100 => r >= (target * total - 100 * attended) / (100 - target)
  const req = Math.ceil((target * total - 100 * attended) / (100 - target))
  return Math.max(0, req)
}

/**
 * Determine risk state and human-readable explanation message.
 */
export function determineRiskState(
  percentage: number,
  target: number,
  bunkAllowance: number,
  recoveryRequirement: number,
  totalClasses: number
): { riskState: RiskState; statusMessage: string } {
  if (totalClasses === 0) {
    return {
      riskState: 'SAFE',
      statusMessage: 'No classes tracked yet',
    }
  }

  if (percentage < target) {
    const recText =
      recoveryRequirement === Infinity
        ? 'Cannot reach target mathematically'
        : `Attend next ${recoveryRequirement} class${recoveryRequirement === 1 ? '' : 'es'} to recover`

    return {
      riskState: 'CRITICAL',
      statusMessage: recText,
    }
  }

  // Attendance is >= target
  if (bunkAllowance <= 1) {
    return {
      riskState: 'WARNING',
      statusMessage:
        bunkAllowance === 0
          ? 'On track, but cannot miss next class'
          : 'You can miss 1 class',
    }
  }

  return {
    riskState: 'SAFE',
    statusMessage: `You can miss ${bunkAllowance} class${bunkAllowance === 1 ? '' : 'es'}`,
  }
}

/**
 * Calculate attendance metrics for a specific subject.
 */
export function calculateSubjectAttendance(
  subject: Subject,
  records: AttendanceRecord[],
  defaultTarget: number = 75.0
): SubjectAttendanceSummary {
  const target = subject.target_percentage != null ? Number(subject.target_percentage) : defaultTarget

  let presentCount = 0
  let absentCount = 0
  let cancelledCount = 0

  for (const record of records) {
    if (record.subject_id !== subject.id) continue
    if (record.status === 'present') {
      presentCount++
    } else if (record.status === 'absent') {
      absentCount++
    } else if (record.status === 'cancelled') {
      cancelledCount++
    }
  }

  const effectiveAttended = (subject.baseline_attended || 0) + presentCount
  const effectiveTotal = (subject.baseline_total || 0) + presentCount + absentCount

  const percentage =
    effectiveTotal > 0 ? Math.round((effectiveAttended / effectiveTotal) * 1000) / 10 : 100.0

  const bunkAllowance = calculateBunkAllowance(effectiveAttended, effectiveTotal, target)
  const recoveryRequirement = calculateRecoveryRequirement(effectiveAttended, effectiveTotal, target)

  const { riskState, statusMessage } = determineRiskState(
    percentage,
    target,
    bunkAllowance,
    recoveryRequirement,
    effectiveTotal
  )

  return {
    subject,
    effectiveAttended,
    effectiveTotal,
    presentCount,
    absentCount,
    cancelledCount,
    percentage,
    targetPercentage: target,
    bunkAllowance,
    recoveryRequirement,
    riskState,
    statusMessage,
  }
}

/**
 * Calculate overall attendance summary across all subjects.
 */
export function calculateOverallAttendance(
  subjectSummaries: SubjectAttendanceSummary[],
  defaultTarget: number = 75.0
): OverallAttendanceSummary {
  let totalAttended = 0
  let totalClasses = 0
  let criticalCount = 0
  let warningCount = 0
  let safeCount = 0

  for (const item of subjectSummaries) {
    totalAttended += item.effectiveAttended
    totalClasses += item.effectiveTotal

    if (item.riskState === 'CRITICAL') {
      criticalCount++
    } else if (item.riskState === 'WARNING') {
      warningCount++
    } else {
      safeCount++
    }
  }

  const overallPercentage =
    totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 1000) / 10 : 100.0

  const bunkAllowance = calculateBunkAllowance(totalAttended, totalClasses, defaultTarget)
  const recoveryRequirement = calculateRecoveryRequirement(totalAttended, totalClasses, defaultTarget)

  const { riskState, statusMessage } = determineRiskState(
    overallPercentage,
    defaultTarget,
    bunkAllowance,
    recoveryRequirement,
    totalClasses
  )

  return {
    totalAttended,
    totalClasses,
    overallPercentage,
    targetPercentage: defaultTarget,
    bunkAllowance,
    recoveryRequirement,
    riskState,
    statusMessage,
    criticalSubjectsCount: criticalCount,
    warningSubjectsCount: warningCount,
    safeSubjectsCount: safeCount,
    totalSubjectsCount: subjectSummaries.length,
  }
}
