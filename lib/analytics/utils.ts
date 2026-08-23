/**
 * Minimum tracked study minutes required for a calendar day to qualify
 * as an active study day and count toward streaks.
 */
export const STUDY_DAY_THRESHOLD_MINUTES = 20

/**
 * Default weekly study goal in minutes (10 hours).
 */
export const DEFAULT_WEEKLY_GOAL_MINUTES = 600

export type HeatmapActivityLevel = 0 | 1 | 2 | 3 | 4

/**
 * Formats duration in minutes to human-readable string.
 * Examples:
 * - 0 -> "0 min"
 * - 25 -> "25 min"
 * - 75 -> "1h 15m"
 * - 160 -> "2h 40m"
 */
export function formatStudyDuration(totalMinutes: number): string {
  const roundedMins = Math.max(0, Math.round(totalMinutes))
  if (roundedMins === 0) {
    return '0 min'
  }
  if (roundedMins < 60) {
    return `${roundedMins} min`
  }
  const hours = Math.floor(roundedMins / 60)
  const remMinutes = roundedMins % 60
  if (remMinutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${remMinutes}m`
}

/**
 * Determines the 5-level activity rating based on daily minutes:
 * Level 0 = 0m (no activity)
 * Level 1 = 1–20m (low / below qualifying threshold)
 * Level 2 = 21–45m (moderate / qualifying)
 * Level 3 = 46–90m (high)
 * Level 4 = 90m+ (very high)
 */
export function getHeatmapLevel(minutes: number): HeatmapActivityLevel {
  if (minutes <= 0) return 0
  if (minutes <= 20) return 1
  if (minutes <= 45) return 2
  if (minutes <= 90) return 3
  return 4
}

export * from './dateUtils'

