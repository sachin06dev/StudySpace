import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { PRESET_CATEGORIES, getUserCategories } from './categories'
import {
  STUDY_DAY_THRESHOLD_MINUTES,
  DEFAULT_WEEKLY_GOAL_MINUTES,
  formatStudyDuration,
  getHeatmapLevel,
  getZonedDateParts,
  getLocalDayKey,
  getZonedDateString,
  zonedTimeToUtc,
  getZonedDateRanges,
  isSameLocalDay,
  normalizeDayOfWeek,
  formatDateTooltip,
  formatLocalDate,
  formatRelativeSessionDate,
  type HeatmapActivityLevel,
  type ZonedDateParts,
  type TimezoneDateRange,
} from '@/lib/analytics/utils'

export {
  STUDY_DAY_THRESHOLD_MINUTES,
  DEFAULT_WEEKLY_GOAL_MINUTES,
  formatStudyDuration,
  getHeatmapLevel,
  getZonedDateParts,
  getLocalDayKey,
  getZonedDateString,
  zonedTimeToUtc,
  getZonedDateRanges,
  isSameLocalDay,
  normalizeDayOfWeek,
  formatDateTooltip,
  formatLocalDate,
  formatRelativeSessionDate,
  type HeatmapActivityLevel,
  type ZonedDateParts,
  type TimezoneDateRange,
}



export interface DailyActivity {
  dateStr: string // YYYY-MM-DD
  dayOfWeek: number // 0 = Sun, 1 = Mon, ..., 6 = Sat
  dayName: string // 'Mon', 'Tue', etc.
  studyMinutes: number
  formattedDuration: string
  pomodoroCount: number
  notesCount: number
  tasksCompletedCount: number
  isQualifying: boolean
  level: HeatmapActivityLevel
  isToday: boolean
}

export interface StreakStats {
  currentStreak: number
  longestStreak: number
  activeDays: number
  totalStudyMinutes: number
  formattedTotalStudyTime: string
  totalPomodoros: number
}

export interface YearlyActivityData {
  year: number
  days: DailyActivity[]
  streaks: StreakStats
  isCurrentYear: boolean
}

export interface WeeklyGraphDay {
  dayName: string
  dateStr: string
  studyMinutes: number
  formattedDuration: string
  pomodoroCount: number
  isQualifying: boolean
  isToday: boolean
}

export interface WeeklyGraphData {
  days: WeeklyGraphDay[]
  currentWeekTotalMinutes: number
  formattedWeekTotal: string
  dailyAverageMinutes: number
  formattedDailyAverage: string
  previousWeekTotalMinutes: number
  formattedPreviousWeekTotal: string
  vsLastWeekPercent: number | null
  vsLastWeekDiffMinutes: number
  vsLastWeekStatus: 'up' | 'down' | 'same' | 'no_data'
}

export interface MonthlySummaryData {
  monthKey: string // "YYYY-MM"
  monthName: string // e.g. "August 2026"
  year: number
  month: number
  totalMinutes: number
  formattedTotal: string
  activeDays: number
  dailyAverageMinutes: number
  formattedDailyAverage: string
  pomodoroCount: number
  isCurrentMonth: boolean
}

export interface RecentPomodoroSession {
  id: string
  startedAt: string
  dateLabel: string // "Today", "Yesterday", "22 Aug"
  timeLabel: string // "3:45 PM"
  durationMinutes: number
  formattedDuration: string
}

export interface PomodoroAnalyticsData {
  totalCompleted: number
  totalFocusMinutes: number
  formattedFocusTime: string
  averageSessionMinutes: number
  longestSessionMinutes: number
  formattedLongestSession: string
  recentSessions: RecentPomodoroSession[]
  bestDayOfWeek: {
    dayName: string
    sessionCount: number
    focusMinutes: number
  } | null
}

export interface PlaylistProgressItem {
  id: string
  playlistId: string
  title: string
  channelName: string | null
  thumbnailUrl: string | null
  totalVideos: number
  completedVideos: number
  progressPercent: number
  totalDurationSeconds: number
  formattedDuration: string
}

export interface PlaylistProgressData {
  playlists: PlaylistProgressItem[]
  hasData: boolean
}

export interface SubjectDistributionItem {
  name: string
  count: number
  percentage: number
  color: string
  icon?: string | null
}

export interface SubjectDistributionData {
  categories: SubjectDistributionItem[]
  mostStudiedSubject: string | null
  totalResources: number
  hasData: boolean
}

export interface TimeOfDayData {
  morningMinutes: number // 5 AM - 12 PM
  afternoonMinutes: number // 12 PM - 5 PM
  eveningMinutes: number // 5 PM - 9 PM
  nightMinutes: number // 9 PM - 5 AM
  morningPomodoros: number
  afternoonPomodoros: number
  eveningPomodoros: number
  nightPomodoros: number
  peakPeriod: 'Morning' | 'Afternoon' | 'Evening' | 'Night' | null
  peakPercentage: number | null
  hasEnoughData: boolean
}

export interface ConsistencyScoreImprovement {
  title: string
  action: string
  pointsGain: number
  category: 'days' | 'streak' | 'goal'
}

export interface ConsistencyScoreData {
  overallScore: number // 0 - 100
  ratingLabel: string // 'Getting Started' | 'Building Momentum' | 'Staying Consistent' | 'Strong Habit' | 'Excellent Consistency'
  breakdown: {
    studyDaysScore: number // max 40
    streakScore: number // max 35
    goalScore: number // max 25
    activeDaysLast30: number
    currentStreak: number
    weekStudyMinutes: number
    goalMinutes: number
  }
  improvements: ConsistencyScoreImprovement[]
}

export interface WeeklyGoalData {
  goalMinutes: number
  goalHours: number
  currentMinutes: number
  progressPercent: number
  remainingMinutes: number
  formattedRemaining: string
  isAchieved: boolean
}

export interface MilestoneItem {
  id: string
  title: string
  description: string
  category: 'days' | 'streak'
  target: number
  current: number
  isUnlocked: boolean
  progressPercent: number
  icon: string
  badgeColor: string
}

export interface MilestoneData {
  milestones: MilestoneItem[]
  unlockedCount: number
  totalCount: number
}

export interface StudyInsightItem {
  id: string
  type: 'trend' | 'consistency' | 'peak' | 'goal' | 'milestone'
  title: string
  description: string
  icon: string
  highlight?: string
  actionTarget?: string // ID to scroll or trigger
}

export interface AnalyticsSummary {
  today: {
    studyMinutes: number
    pomodoroCount: number
    formattedDuration: string
  }
  week: {
    studyMinutes: number
    pomodoroCount: number
    formattedDuration: string
  }
  tasks: {
    total: number
    completed: number
    pending: number
    completionPercentage: number
  }
  timezone: string
}

export interface FullAnalyticsData {
  summary: AnalyticsSummary
  streaks: StreakStats
  heatmap: {
    days: DailyActivity[]
    startDate: string
    endDate: string
  }
  yearlyData: Record<number, YearlyActivityData>
  availableYears: number[]
  selectedYear: number
  weeklyGraph: WeeklyGraphData
  monthlySummary: MonthlySummaryData
  monthlySummaries: Record<string, MonthlySummaryData>
  availableMonthKeys: string[]
  pomodoro: PomodoroAnalyticsData
  playlistProgress: PlaylistProgressData
  subjectDistribution: SubjectDistributionData
  timeOfDay: TimeOfDayData
  consistencyScore: ConsistencyScoreData
  weeklyGoal: WeeklyGoalData
  milestones: MilestoneData
  insights: StudyInsightItem[]
  timezone: string
}

export interface CompactConsistencyData {
  recentDays: DailyActivity[]
  streaks: StreakStats
  timezone: string
}


/**
 * Fetches the user's configured timezone from `profiles.timezone`.
 */
export async function getUserTimezone(userId: string): Promise<string> {
  const supabase = await createClient()
  let cookieTz: string | undefined
  try {
    const cookieStore = await cookies()
    cookieTz = cookieStore.get('user-timezone')?.value
  } catch {}

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('timezone')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error(`Error querying profile timezone for user ${userId}:`, error)
    }

    const dbTimezone = data?.timezone

    if (dbTimezone && dbTimezone !== 'UTC') {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: dbTimezone })
        return dbTimezone
      } catch {}
    }

    if (cookieTz) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: cookieTz })
        return cookieTz
      } catch {}
    }

    if (dbTimezone) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: dbTimezone })
        return dbTimezone
      } catch {}
    }

    return 'UTC'
  } catch (err) {
    console.error(`Error reading timezone for user ${userId}:`, err)
    return cookieTz || 'UTC'
  }
}

// ============================================================================
// Core Analytics Aggregation Engine
// ============================================================================

export interface InternalDailyAccumulator {
  dateStr: string
  studySeconds: number
  pomodoroCount: number
  notesCount: number
  tasksCompletedCount: number
}

/**
 * Builds a daily activity series for rolling N days up to today.
 */
function buildDailyActivitySeries(
  dailyMap: Map<string, InternalDailyAccumulator>,
  todayDateStr: string,
  timeZone: string,
  totalDays: number = 365
): DailyActivity[] {
  const result: DailyActivity[] = []
  const todayParts = getZonedDateParts(new Date(), timeZone)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day - i, 12, 0, 0))
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const dayNum = String(d.getUTCDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${dayNum}`
    const dayOfWeek = d.getUTCDay()
    const dayName = dayNames[dayOfWeek]

    const acc = dailyMap.get(dateStr)
    const totalMinutes = acc ? Math.round(acc.studySeconds / 60) : 0
    const pomodoroCount = acc ? acc.pomodoroCount : 0
    const notesCount = acc ? acc.notesCount : 0
    const tasksCompletedCount = acc ? acc.tasksCompletedCount : 0

    const isQualifying = totalMinutes >= STUDY_DAY_THRESHOLD_MINUTES
    const level = getHeatmapLevel(totalMinutes)
    const isToday = dateStr === todayDateStr

    result.push({
      dateStr,
      dayOfWeek,
      dayName,
      studyMinutes: totalMinutes,
      formattedDuration: formatStudyDuration(totalMinutes),
      pomodoroCount,
      notesCount,
      tasksCompletedCount,
      isQualifying,
      level,
      isToday,
    })
  }

  return result
}

/**
 * Builds a calendar-year specific activity series (Jan 1 to Dec 31, or Jan 1 to Today if current year).
 */
export function buildYearCalendarSeries(
  dailyMap: Map<string, InternalDailyAccumulator>,
  year: number,
  timeZone: string,
  todayStr: string
): { days: DailyActivity[]; streaks: StreakStats } {
  const nowParts = getZonedDateParts(new Date(), timeZone)
  const isCurrentYear = year === nowParts.year
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  const daysInYear = isLeapYear ? 366 : 365

  const days: DailyActivity[] = []
  let activeDays = 0
  let totalStudyMinutes = 0
  let totalPomodoros = 0

  // Iterate all calendar days of that year
  for (let i = 0; i < daysInYear; i++) {
    const d = new Date(Date.UTC(year, 0, 1 + i, 12, 0, 0))
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const dayNum = String(d.getUTCDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${dayNum}`
    const dayOfWeek = d.getUTCDay()
    const dayName = dayNames[dayOfWeek]

    // If future day in current year, stop or mark level 0
    const isFuture = isCurrentYear && dateStr > todayStr
    const isToday = dateStr === todayStr

    const acc = isFuture ? undefined : dailyMap.get(dateStr)
    const totalMinutes = acc ? Math.round(acc.studySeconds / 60) : 0
    const pomodoroCount = acc ? acc.pomodoroCount : 0
    const notesCount = acc ? acc.notesCount : 0
    const tasksCompletedCount = acc ? acc.tasksCompletedCount : 0

    const isQualifying = !isFuture && totalMinutes >= STUDY_DAY_THRESHOLD_MINUTES
    const level = isFuture ? 0 : getHeatmapLevel(totalMinutes)

    if (isQualifying) {
      activeDays += 1
    }
    totalStudyMinutes += totalMinutes
    totalPomodoros += pomodoroCount

    days.push({
      dateStr,
      dayOfWeek,
      dayName,
      studyMinutes: totalMinutes,
      formattedDuration: formatStudyDuration(totalMinutes),
      pomodoroCount,
      notesCount,
      tasksCompletedCount,
      isQualifying,
      level,
      isToday,
    })
  }

  // Calculate streaks within that year
  let longestStreak = 0
  let tempStreak = 0
  for (const day of days) {
    if (day.isQualifying) {
      tempStreak += 1
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }
    } else {
      tempStreak = 0
    }
  }

  // Current streak (only meaningful for current year)
  let currentStreak = 0
  if (isCurrentYear) {
    const todayParts = getZonedDateParts(new Date(), timeZone)
    const yesterday = new Date(Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day - 1, 12, 0, 0))
    const yesterdayStr = `${yesterday.getUTCFullYear()}-${String(yesterday.getUTCMonth() + 1).padStart(2, '0')}-${String(yesterday.getUTCDate()).padStart(2, '0')}`

    const activityByDate = new Map<string, DailyActivity>()
    for (const act of days) {
      activityByDate.set(act.dateStr, act)
    }

    const todayActivity = activityByDate.get(todayStr)
    const yesterdayActivity = activityByDate.get(yesterdayStr)

    if (todayActivity && todayActivity.isQualifying) {
      let checkOffset = 0
      while (true) {
        const checkDt = new Date(Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day - checkOffset, 12, 0, 0))
        const dStr = `${checkDt.getUTCFullYear()}-${String(checkDt.getUTCMonth() + 1).padStart(2, '0')}-${String(checkDt.getUTCDate()).padStart(2, '0')}`
        const act = activityByDate.get(dStr)
        if (act && act.isQualifying) {
          currentStreak += 1
          checkOffset += 1
        } else {
          break
        }
      }
    } else if (yesterdayActivity && yesterdayActivity.isQualifying) {
      let checkOffset = 1
      while (true) {
        const checkDt = new Date(Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day - checkOffset, 12, 0, 0))
        const dStr = `${checkDt.getUTCFullYear()}-${String(checkDt.getUTCMonth() + 1).padStart(2, '0')}-${String(checkDt.getUTCDate()).padStart(2, '0')}`
        const act = activityByDate.get(dStr)
        if (act && act.isQualifying) {
          currentStreak += 1
          checkOffset += 1
        } else {
          break
        }
      }
    }
  }

  return {
    days,
    streaks: {
      currentStreak,
      longestStreak,
      activeDays,
      totalStudyMinutes,
      formattedTotalStudyTime: formatStudyDuration(totalStudyMinutes),
      totalPomodoros,
    },
  }
}

/**
 * Calculates current streak, longest streak, and active days.
 */
function calculateStreaks(
  dailyActivities: DailyActivity[],
  todayStr: string,
  timeZone: string
): StreakStats {
  let activeDays = 0
  let totalStudyMinutes = 0
  let totalPomodoros = 0

  const activityByDate = new Map<string, DailyActivity>()
  for (const act of dailyActivities) {
    activityByDate.set(act.dateStr, act)
    if (act.isQualifying) {
      activeDays += 1
    }
    totalStudyMinutes += act.studyMinutes
    totalPomodoros += act.pomodoroCount
  }

  const todayParts = getZonedDateParts(new Date(), timeZone)
  const yesterday = new Date(Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day - 1, 12, 0, 0))
  const yesterdayStr = `${yesterday.getUTCFullYear()}-${String(yesterday.getUTCMonth() + 1).padStart(2, '0')}-${String(yesterday.getUTCDate()).padStart(2, '0')}`

  const todayActivity = activityByDate.get(todayStr)
  const yesterdayActivity = activityByDate.get(yesterdayStr)

  let currentStreak = 0

  if (todayActivity && todayActivity.isQualifying) {
    let checkOffset = 0
    while (true) {
      const checkDt = new Date(Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day - checkOffset, 12, 0, 0))
      const dStr = `${checkDt.getUTCFullYear()}-${String(checkDt.getUTCMonth() + 1).padStart(2, '0')}-${String(checkDt.getUTCDate()).padStart(2, '0')}`
      const act = activityByDate.get(dStr)
      if (act && act.isQualifying) {
        currentStreak += 1
        checkOffset += 1
      } else {
        break
      }
    }
  } else if (yesterdayActivity && yesterdayActivity.isQualifying) {
    let checkOffset = 1
    while (true) {
      const checkDt = new Date(Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day - checkOffset, 12, 0, 0))
      const dStr = `${checkDt.getUTCFullYear()}-${String(checkDt.getUTCMonth() + 1).padStart(2, '0')}-${String(checkDt.getUTCDate()).padStart(2, '0')}`
      const act = activityByDate.get(dStr)
      if (act && act.isQualifying) {
        currentStreak += 1
        checkOffset += 1
      } else {
        break
      }
    }
  }

  let longestStreak = 0
  let tempStreak = 0

  for (const act of dailyActivities) {
    if (act.isQualifying) {
      tempStreak += 1
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }
    } else {
      tempStreak = 0
    }
  }

  return {
    currentStreak,
    longestStreak,
    activeDays,
    totalStudyMinutes,
    formattedTotalStudyTime: formatStudyDuration(totalStudyMinutes),
    totalPomodoros,
  }
}

/**
 * Calculates weekly study graph data for the current week (Monday to Sunday)
 * along with comparison against the previous week.
 */
function calculateWeeklyGraph(
  dailyMap: Map<string, InternalDailyAccumulator>,
  todayStr: string,
  timeZone: string
): WeeklyGraphData {
  const now = new Date()
  const parts = getZonedDateParts(now, timeZone)

  const weekdayMap: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  }

  const dayNum = weekdayMap[parts.weekday] || 1
  const daysSinceMonday = dayNum - 1

  const days: WeeklyGraphDay[] = []
  let currentWeekTotalMinutes = 0
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // 1. Current Week: Mon - Sun (7 days)
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.UTC(parts.year, parts.month - 1, parts.day - daysSinceMonday + i, 12, 0, 0))
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const dayNumStr = String(d.getUTCDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${dayNumStr}`
    const acc = dailyMap.get(dateStr)
    const minutes = acc ? Math.round(acc.studySeconds / 60) : 0
    const pomodoroCount = acc ? acc.pomodoroCount : 0
    const isQualifying = minutes >= STUDY_DAY_THRESHOLD_MINUTES
    const isToday = dateStr === todayStr

    currentWeekTotalMinutes += minutes

    days.push({
      dayName: dayNames[i],
      dateStr,
      studyMinutes: minutes,
      formattedDuration: formatStudyDuration(minutes),
      pomodoroCount,
      isQualifying,
      isToday,
    })
  }

  // 2. Previous Week: Previous Mon - Sun (7 days)
  let previousWeekTotalMinutes = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.UTC(parts.year, parts.month - 1, parts.day - daysSinceMonday - 7 + i, 12, 0, 0))
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const dayNumStr = String(d.getUTCDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${dayNumStr}`
    const acc = dailyMap.get(dateStr)
    const minutes = acc ? Math.round(acc.studySeconds / 60) : 0
    previousWeekTotalMinutes += minutes
  }

  // 3. Comparison
  const vsLastWeekDiffMinutes = currentWeekTotalMinutes - previousWeekTotalMinutes
  let vsLastWeekPercent: number | null = null
  let vsLastWeekStatus: 'up' | 'down' | 'same' | 'no_data' = 'no_data'

  if (previousWeekTotalMinutes === 0) {
    if (currentWeekTotalMinutes > 0) {
      vsLastWeekPercent = 100
      vsLastWeekStatus = 'up'
    } else {
      vsLastWeekPercent = null
      vsLastWeekStatus = 'no_data'
    }
  } else {
    vsLastWeekPercent = Math.round(
      ((currentWeekTotalMinutes - previousWeekTotalMinutes) / previousWeekTotalMinutes) * 100
    )
    if (vsLastWeekPercent > 0) {
      vsLastWeekStatus = 'up'
    } else if (vsLastWeekPercent < 0) {
      vsLastWeekStatus = 'down'
    } else {
      vsLastWeekStatus = 'same'
    }
  }

  const dailyAverageMinutes = Math.round(currentWeekTotalMinutes / 7)

  return {
    days,
    currentWeekTotalMinutes,
    formattedWeekTotal: formatStudyDuration(currentWeekTotalMinutes),
    dailyAverageMinutes,
    formattedDailyAverage: formatStudyDuration(dailyAverageMinutes),
    previousWeekTotalMinutes,
    formattedPreviousWeekTotal: formatStudyDuration(previousWeekTotalMinutes),
    vsLastWeekPercent,
    vsLastWeekDiffMinutes,
    vsLastWeekStatus,
  }
}

/**
 * Calculates monthly summary for a specific year and month.
 */
export function calculateSpecificMonthSummary(
  dailyMap: Map<string, InternalDailyAccumulator>,
  year: number,
  month: number, // 1 to 12
  timeZone: string
): MonthlySummaryData {
  const nowParts = getZonedDateParts(new Date(), timeZone)
  const isCurrentMonth = year === nowParts.year && month === nowParts.month
  const monthKey = `${year}-${String(month).padStart(2, '0')}`

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const monthName = `${monthNames[month - 1]} ${year}`

  let totalMinutes = 0
  let activeDays = 0
  let pomodoroCount = 0

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const daysElapsed = isCurrentMonth ? Math.min(nowParts.day, daysInMonth) : daysInMonth

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const dayNumStr = String(d.getUTCDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${dayNumStr}`
    const acc = dailyMap.get(dateStr)
    if (acc) {
      const mins = Math.round(acc.studySeconds / 60)
      totalMinutes += mins
      pomodoroCount += acc.pomodoroCount
      if (mins >= STUDY_DAY_THRESHOLD_MINUTES) {
        activeDays += 1
      }
    }
  }

  const dailyAverageMinutes = daysElapsed > 0 ? Math.round(totalMinutes / daysElapsed) : 0

  return {
    monthKey,
    monthName,
    year,
    month,
    totalMinutes,
    formattedTotal: formatStudyDuration(totalMinutes),
    activeDays,
    dailyAverageMinutes,
    formattedDailyAverage: formatStudyDuration(dailyAverageMinutes),
    pomodoroCount,
    isCurrentMonth,
  }
}

/**
 * Generates map of all recent historical months up to the current month.
 */
function buildMonthlySummariesMap(
  dailyMap: Map<string, InternalDailyAccumulator>,
  timeZone: string,
  monthsCount: number = 24
): { summaries: Record<string, MonthlySummaryData>; keys: string[]; currentSummary: MonthlySummaryData } {
  const nowParts = getZonedDateParts(new Date(), timeZone)
  const summaries: Record<string, MonthlySummaryData> = {}
  const keys: string[] = []

  let currentSummary: MonthlySummaryData | null = null

  for (let i = 0; i < monthsCount; i++) {
    // Subtract i months
    let targetYear = nowParts.year
    let targetMonth = nowParts.month - i

    while (targetMonth < 1) {
      targetMonth += 12
      targetYear -= 1
    }

    const summary = calculateSpecificMonthSummary(dailyMap, targetYear, targetMonth, timeZone)
    summaries[summary.monthKey] = summary
    keys.push(summary.monthKey)

    if (i === 0) {
      currentSummary = summary
    }
  }

  return {
    summaries,
    keys,
    currentSummary: currentSummary || calculateSpecificMonthSummary(dailyMap, nowParts.year, nowParts.month, timeZone),
  }
}

/**
 * Calculates consistency score (0–100) using the exact 100-point transparent formula:
 * 1. Active Days (40 pts): (qualifyingDaysLast30 / 30) × 40
 * 2. Streak Factor (35 pts): min(35, (currentStreak / 14) × 35)
 * 3. Weekly Goal Progress (25 pts): min(25, (weekStudyMinutes / goalMinutes) × 25)
 */
function calculateConsistencyScore(
  activeDaysLast30: number,
  currentStreak: number,
  weekStudyMinutes: number,
  goalMinutes: number = DEFAULT_WEEKLY_GOAL_MINUTES
): ConsistencyScoreData {
  // 1. Active Days factor (max 40 pts) — 30 calendar days base
  const studyDaysScoreRaw = (Math.min(30, activeDaysLast30) / 30) * 40
  const studyDaysScore = Math.min(40, Math.round(studyDaysScoreRaw * 10) / 10)

  // 2. Streak factor (max 35 pts) — 14 days target streak
  const streakScoreRaw = (Math.min(14, currentStreak) / 14) * 35
  const streakScore = Math.min(35, Math.round(streakScoreRaw * 10) / 10)

  // 3. Weekly Goal factor (max 25 pts) — 100% of weekly goal
  const goalRate = goalMinutes > 0 ? Math.min(1, weekStudyMinutes / goalMinutes) : 0
  const goalScoreRaw = goalRate * 25
  const goalScore = Math.min(25, Math.round(goalScoreRaw * 10) / 10)

  const overallScore = Math.min(100, Math.max(0, Math.round(studyDaysScore + streakScore + goalScore)))

  let ratingLabel = 'Getting Started'
  if (overallScore >= 85) {
    ratingLabel = 'Excellent Consistency'
  } else if (overallScore >= 70) {
    ratingLabel = 'Strong Habit'
  } else if (overallScore >= 50) {
    ratingLabel = 'Staying Consistent'
  } else if (overallScore >= 25) {
    ratingLabel = 'Building Momentum'
  }

  // Calculate concrete practical ways to gain points
  const improvements: ConsistencyScoreImprovement[] = []

  if (activeDaysLast30 < 30) {
    improvements.push({
      title: 'Active Study Days',
      action: `Log a qualifying session (≥${STUDY_DAY_THRESHOLD_MINUTES} min) today to gain points`,
      pointsGain: 1.3,
      category: 'days',
    })
  }

  if (currentStreak < 14) {
    const nextStreak = currentStreak + 1
    const nextScore = Math.min(35, Math.round(((nextStreak / 14) * 35) * 10) / 10)
    const streakGain = Math.round((nextScore - streakScore) * 10) / 10
    improvements.push({
      title: 'Consistency Streak',
      action: `Maintain your streak tomorrow to reach ${nextStreak} ${nextStreak === 1 ? 'day' : 'days'}`,
      pointsGain: streakGain > 0 ? streakGain : 2.5,
      category: 'streak',
    })
  }

  if (weekStudyMinutes < goalMinutes) {
    const remMins = goalMinutes - weekStudyMinutes
    const goalGain = Math.round((25 - goalScore) * 10) / 10
    improvements.push({
      title: 'Weekly Study Goal',
      action: `Complete ${formatStudyDuration(remMins)} more this week to reach 100% target`,
      pointsGain: goalGain > 0 ? goalGain : 5.0,
      category: 'goal',
    })
  }

  return {
    overallScore,
    ratingLabel,
    breakdown: {
      studyDaysScore,
      streakScore,
      goalScore,
      activeDaysLast30,
      currentStreak,
      weekStudyMinutes,
      goalMinutes,
    },
    improvements,
  }
}

/**
 * Generates milestone badges and unlocked status based on user metrics.
 */
function calculateMilestones(activeDays: number, currentStreak: number, longestStreak: number): MilestoneData {
  const maxStreak = Math.max(currentStreak, longestStreak)

  const rawMilestones: Array<{
    id: string
    title: string
    description: string
    category: 'days' | 'streak'
    target: number
    current: number
    icon: string
    badgeColor: string
  }> = [
    {
      id: 'days-5',
      title: 'First Steps',
      description: 'Log 5 qualifying active study days',
      category: 'days',
      target: 5,
      current: activeDays,
      icon: '🌱',
      badgeColor: 'emerald',
    },
    {
      id: 'days-10',
      title: 'Double Digits',
      description: 'Reach 10 active study days',
      category: 'days',
      target: 10,
      current: activeDays,
      icon: '🎯',
      badgeColor: 'indigo',
    },
    {
      id: 'days-25',
      title: 'Quarter Century',
      description: 'Accumulate 25 active study days',
      category: 'days',
      target: 25,
      current: activeDays,
      icon: '⭐',
      badgeColor: 'amber',
    },
    {
      id: 'days-50',
      title: 'Halfway to 100',
      description: 'Complete 50 active study days',
      category: 'days',
      target: 50,
      current: activeDays,
      icon: '🚀',
      badgeColor: 'purple',
    },
    {
      id: 'days-100',
      title: 'Century Club',
      description: 'Achieve 100 active study days',
      category: 'days',
      target: 100,
      current: activeDays,
      icon: '🏆',
      badgeColor: 'amber',
    },
    {
      id: 'streak-3',
      title: 'Spark',
      description: 'Build a 3-day consecutive study streak',
      category: 'streak',
      target: 3,
      current: maxStreak,
      icon: '⚡',
      badgeColor: 'amber',
    },
    {
      id: 'streak-7',
      title: 'Week Warrior',
      description: 'Maintain a 7-day study streak',
      category: 'streak',
      target: 7,
      current: maxStreak,
      icon: '🔥',
      badgeColor: 'rose',
    },
    {
      id: 'streak-14',
      title: 'Fortnight Focus',
      description: 'Reach a 14-day study streak',
      category: 'streak',
      target: 14,
      current: maxStreak,
      icon: '🛡️',
      badgeColor: 'blue',
    },
    {
      id: 'streak-30',
      title: 'Iron Habit',
      description: 'Achieve a 30-day unbroken study streak',
      category: 'streak',
      target: 30,
      current: maxStreak,
      icon: '💎',
      badgeColor: 'violet',
    },
  ]

  let unlockedCount = 0
  const milestones: MilestoneItem[] = rawMilestones.map((m) => {
    const isUnlocked = m.current >= m.target
    if (isUnlocked) unlockedCount += 1
    const progressPercent = Math.min(100, Math.round((m.current / m.target) * 100))

    return {
      ...m,
      isUnlocked,
      progressPercent,
    }
  })

  return {
    milestones,
    unlockedCount,
    totalCount: milestones.length,
  }
}

/**
 * Formulates deterministic insights based purely on real historical records.
 */
function generateDeterministicInsights(
  streaks: StreakStats,
  weeklyGraph: WeeklyGraphData,
  timeOfDay: TimeOfDayData,
  pomodoro: PomodoroAnalyticsData,
  weeklyGoal: WeeklyGoalData
): StudyInsightItem[] {
  const insights: StudyInsightItem[] = []

  // 1. Weekly Trend
  if (weeklyGraph.vsLastWeekStatus === 'up' && weeklyGraph.vsLastWeekPercent) {
    insights.push({
      id: 'insight-trend-up',
      type: 'trend',
      title: 'Weekly Study Momentum',
      description: `Your focus time increased by ${weeklyGraph.vsLastWeekPercent}% this week compared to last week (${weeklyGraph.formattedWeekTotal} vs ${weeklyGraph.formattedPreviousWeekTotal}).`,
      highlight: `+${weeklyGraph.vsLastWeekPercent}%`,
      icon: '📈',
      actionTarget: 'weekly-chart',
    })
  } else if (weeklyGraph.currentWeekTotalMinutes > 0) {
    insights.push({
      id: 'insight-weekly-total',
      type: 'trend',
      title: 'This Week’s Focus Time',
      description: `You have logged ${weeklyGraph.formattedWeekTotal} of focused study time with a daily average of ${weeklyGraph.formattedDailyAverage}.`,
      highlight: weeklyGraph.formattedWeekTotal,
      icon: '⏱️',
      actionTarget: 'weekly-chart',
    })
  }

  // 2. Consistency & Streak
  if (streaks.currentStreak >= 3) {
    insights.push({
      id: 'insight-streak-active',
      type: 'consistency',
      title: 'Active Consistency Streak',
      description: `You are on an active ${streaks.currentStreak}-day study streak! Keep logging at least ${STUDY_DAY_THRESHOLD_MINUTES} minutes daily to keep the fire going.`,
      highlight: `${streaks.currentStreak} Days`,
      icon: '🔥',
      actionTarget: 'heatmap-grid',
    })
  } else if (streaks.activeDays > 0) {
    insights.push({
      id: 'insight-active-days',
      type: 'consistency',
      title: 'Consistency Foundation',
      description: `You have logged ${streaks.activeDays} qualifying study days across your study journey.`,
      highlight: `${streaks.activeDays} Days`,
      icon: '📅',
      actionTarget: 'heatmap-grid',
    })
  }

  // 3. Peak Focus Period
  if (timeOfDay.hasEnoughData && timeOfDay.peakPeriod && timeOfDay.peakPercentage) {
    insights.push({
      id: 'insight-peak-time',
      type: 'peak',
      title: 'Optimal Focus Window',
      description: `You are most productive in the ${timeOfDay.peakPeriod}, accounting for ${timeOfDay.peakPercentage}% of your total study duration.`,
      highlight: timeOfDay.peakPeriod,
      icon: '☀️',
      actionTarget: 'productive-time',
    })
  }

  // 4. Best Pomodoro Day
  if (pomodoro.bestDayOfWeek && pomodoro.bestDayOfWeek.sessionCount > 0) {
    insights.push({
      id: 'insight-best-day',
      type: 'consistency',
      title: 'Top Study Day',
      description: `${pomodoro.bestDayOfWeek.dayName} is your most active study day with ${pomodoro.bestDayOfWeek.sessionCount} completed Pomodoro sessions.`,
      highlight: pomodoro.bestDayOfWeek.dayName,
      icon: '⚡',
      actionTarget: 'pomodoro-stats',
    })
  }

  // 5. Goal Proximity
  if (weeklyGoal.isAchieved) {
    insights.push({
      id: 'insight-goal-achieved',
      type: 'goal',
      title: 'Weekly Goal Completed!',
      description: `Congratulations! You have reached your weekly goal of ${formatStudyDuration(weeklyGoal.goalMinutes)}.`,
      highlight: 'Goal Met 🎉',
      icon: '🎉',
      actionTarget: 'weekly-goal',
    })
  } else if (weeklyGoal.currentMinutes > 0) {
    insights.push({
      id: 'insight-goal-remaining',
      type: 'goal',
      title: 'Weekly Goal Progress',
      description: `You are ${weeklyGoal.formattedRemaining} away from hitting your weekly goal of ${formatStudyDuration(weeklyGoal.goalMinutes)} (${weeklyGoal.progressPercent}% achieved).`,
      highlight: `${weeklyGoal.progressPercent}%`,
      icon: '🎯',
      actionTarget: 'weekly-goal',
    })
  }

  // Fallback starter insight
  if (insights.length === 0) {
    insights.push({
      id: 'insight-getting-started',
      type: 'consistency',
      title: 'Welcome to StudySpace Analytics',
      description: `Start a Pomodoro focus session or save videos to your library. At least ${STUDY_DAY_THRESHOLD_MINUTES} minutes of daily study qualifies as an active day.`,
      highlight: 'Get Started',
      icon: '✨',
      actionTarget: 'heatmap-grid',
    })
  }

  return insights
}

// ============================================================================
// Public Data Layer Functions
// ============================================================================

/**
 * Aggregates all comprehensive analytics metrics for the Analytics 2.1 Dashboard.
 */
export async function getComprehensiveAnalytics(
  userId: string,
  targetTimezone?: string | null
): Promise<FullAnalyticsData> {
  const supabase = await createClient()

  // 1. Resolve user timezone
  const userTimezone = targetTimezone || (await getUserTimezone(userId))
  const todayStr = getZonedDateString(new Date(), userTimezone)
  const nowParts = getZonedDateParts(new Date(), userTimezone)

  // 2. Fetch all required user activity in parallel
  const [
    pomodoroRes,
    notesRes,
    tasksRes,
    savedPlaylistsRes,
    resourcesRes,
    documentsRes,
    userSettingsRes,
    customCategoriesRes,
  ] = await Promise.all([
    // All focus pomodoro sessions for user
    supabase
      .from('pomodoro_sessions')
      .select('id, session_type, planned_seconds, actual_seconds, started_at, status')
      .eq('user_id', userId)
      .eq('session_type', 'focus')
      .order('started_at', { ascending: true }),

    // All timestamp notes for user
    supabase
      .from('video_timestamp_notes')
      .select('id, created_at')
      .eq('user_id', userId),

    // All tasks for user
    supabase
      .from('tasks')
      .select('id, status, completed_at')
      .eq('user_id', userId),

    // Saved playlists for course progress
    supabase
      .from('saved_playlists')
      .select(`
        id,
        playlist_id,
        playlist:youtube_playlists (
          id,
          youtube_playlist_id,
          title,
          channel_name,
          thumbnail_url
        )
      `)
      .eq('user_id', userId),

    // Website resources for subject distribution
    supabase
      .from('website_resources')
      .select('id, category')
      .eq('user_id', userId),

    // Documents for subject distribution
    supabase
      .from('documents')
      .select('id, category')
      .eq('user_id', userId),

    // User settings for weekly goal
    supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),

    // User custom categories (with metadata fallback)
    getUserCategories(userId),
  ])

  const pomodoroSessions = pomodoroRes.data || []
  const notes = notesRes.data || []
  const tasks = tasksRes.data || []
  const savedPlaylists = (savedPlaylistsRes.data || []).filter((p) => p.playlist)
  const resources = resourcesRes.data || []
  const documents = documentsRes.data || []
  const customCategories = (customCategoriesRes as Array<{ name?: string; icon?: string | null }>) || []

  // Resolve weekly study goal (minutes) with multi-tier fallback (table -> cookie -> auth metadata -> 600)
  let weeklyGoalMinutes = DEFAULT_WEEKLY_GOAL_MINUTES
  const dbGoalMinutes = (userSettingsRes.data as { weekly_goal_minutes?: number } | null)?.weekly_goal_minutes
  if (dbGoalMinutes && Number(dbGoalMinutes) > 0) {
    weeklyGoalMinutes = Number(dbGoalMinutes)
  } else {
    try {
      const cookieStore = await cookies()
      const cookieVal = cookieStore.get('user-weekly-goal-minutes')?.value
      if (cookieVal && !isNaN(parseInt(cookieVal, 10)) && parseInt(cookieVal, 10) > 0) {
        weeklyGoalMinutes = parseInt(cookieVal, 10)
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.user_metadata?.weekly_goal_minutes && Number(user.user_metadata.weekly_goal_minutes) > 0) {
          weeklyGoalMinutes = Number(user.user_metadata.weekly_goal_minutes)
        }
      }
    } catch {}
  }

  // 3. Build unified daily activity map
  const dailyMap = new Map<string, InternalDailyAccumulator>()

  const getOrCreateAcc = (dStr: string): InternalDailyAccumulator => {
    let acc = dailyMap.get(dStr)
    if (!acc) {
      acc = {
        dateStr: dStr,
        studySeconds: 0,
        pomodoroCount: 0,
        notesCount: 0,
        tasksCompletedCount: 0,
      }
      dailyMap.set(dStr, acc)
    }
    return acc
  }

  // Accumulate Pomodoro sessions
  const dayOfWeekCount: Record<string, { count: number; seconds: number }> = {
    Mon: { count: 0, seconds: 0 },
    Tue: { count: 0, seconds: 0 },
    Wed: { count: 0, seconds: 0 },
    Thu: { count: 0, seconds: 0 },
    Fri: { count: 0, seconds: 0 },
    Sat: { count: 0, seconds: 0 },
    Sun: { count: 0, seconds: 0 },
  }

  let totalPomodoroFocusSeconds = 0
  let completedPomodoroCount = 0
  let longestPomodoroSeconds = 0
  const completedFocusSessionsList: Array<{
    id: string
    started_at: string
    actual_seconds: number
    planned_seconds: number
  }> = []

  // Time of Day distribution
  let morningSeconds = 0
  let afternoonSeconds = 0
  let eveningSeconds = 0
  let nightSeconds = 0
  let morningPomodoros = 0
  let afternoonPomodoros = 0
  let eveningPomodoros = 0
  let nightPomodoros = 0

  let earliestActivityYear = nowParts.year

  for (const session of pomodoroSessions) {
    if (session.status === 'completed' || session.actual_seconds > 0) {
      const durSeconds = session.actual_seconds > 0 ? session.actual_seconds : session.planned_seconds
      const sessionDate = new Date(session.started_at)
      const dStr = getZonedDateString(sessionDate, userTimezone)
      const parts = getZonedDateParts(sessionDate, userTimezone)

      if (parts.year < earliestActivityYear) {
        earliestActivityYear = parts.year
      }

      const acc = getOrCreateAcc(dStr)
      acc.studySeconds += durSeconds
      if (session.status === 'completed') {
        acc.pomodoroCount += 1
        completedPomodoroCount += 1
        if (durSeconds > longestPomodoroSeconds) {
          longestPomodoroSeconds = durSeconds
        }
        completedFocusSessionsList.push({
          id: session.id,
          started_at: session.started_at,
          actual_seconds: session.actual_seconds,
          planned_seconds: session.planned_seconds,
        })
        if (dayOfWeekCount[parts.weekday]) {
          dayOfWeekCount[parts.weekday].count += 1
        }
      }

      totalPomodoroFocusSeconds += durSeconds

      // Day of week focus seconds
      const dayName = parts.weekday
      if (dayOfWeekCount[dayName]) {
        dayOfWeekCount[dayName].seconds += durSeconds
      }

      // Time of day classification
      const hr = parts.hour
      if (hr >= 5 && hr < 12) {
        morningSeconds += durSeconds
        if (session.status === 'completed') morningPomodoros += 1
      } else if (hr >= 12 && hr < 17) {
        afternoonSeconds += durSeconds
        if (session.status === 'completed') afternoonPomodoros += 1
      } else if (hr >= 17 && hr < 21) {
        eveningSeconds += durSeconds
        if (session.status === 'completed') eveningPomodoros += 1
      } else {
        nightSeconds += durSeconds
        if (session.status === 'completed') nightPomodoros += 1
      }
    }
  }

  // Accumulate Timestamp Notes
  for (const note of notes) {
    if (note.created_at) {
      const noteDate = new Date(note.created_at)
      const dStr = getZonedDateString(noteDate, userTimezone)
      const parts = getZonedDateParts(noteDate, userTimezone)
      if (parts.year < earliestActivityYear) {
        earliestActivityYear = parts.year
      }
      const acc = getOrCreateAcc(dStr)
      acc.notesCount += 1
    }
  }

  // Accumulate Completed Tasks
  for (const t of tasks) {
    if (t.status === 'completed' && t.completed_at) {
      const taskDate = new Date(t.completed_at)
      const dStr = getZonedDateString(taskDate, userTimezone)
      const parts = getZonedDateParts(taskDate, userTimezone)
      if (parts.year < earliestActivityYear) {
        earliestActivityYear = parts.year
      }
      const acc = getOrCreateAcc(dStr)
      acc.tasksCompletedCount += 1
    }
  }

  // 4. Generate 365-day Rolling Series & Streaks
  const heatmapDays = buildDailyActivitySeries(dailyMap, todayStr, userTimezone, 365)
  const streaks = calculateStreaks(heatmapDays, todayStr, userTimezone)
  const weeklyGraph = calculateWeeklyGraph(dailyMap, todayStr, userTimezone)

  // 5. Generate Year-by-Year Navigation Data
  const availableYears: number[] = []
  const yearlyData: Record<number, YearlyActivityData> = {}

  // Include from earliestActivityYear up to currentYear (minimum current year & previous year)
  const minYear = Math.min(earliestActivityYear, nowParts.year - 1)
  for (let yr = nowParts.year; yr >= minYear; yr--) {
    availableYears.push(yr)
    const calData = buildYearCalendarSeries(dailyMap, yr, userTimezone, todayStr)
    yearlyData[yr] = {
      year: yr,
      days: calData.days,
      streaks: calData.streaks,
      isCurrentYear: yr === nowParts.year,
    }
  }

  // 6. Generate Month-by-Month Navigation Data
  const { summaries: monthlySummaries, keys: availableMonthKeys, currentSummary: monthlySummary } =
    buildMonthlySummariesMap(dailyMap, userTimezone, 24)

  // 7. Pomodoro Analytics
  const weekdayFullNameMap: Record<string, string> = {
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
    Sun: 'Sunday',
  }

  let bestDayOfWeek: PomodoroAnalyticsData['bestDayOfWeek'] = null
  for (const [dName, data] of Object.entries(dayOfWeekCount)) {
    if (data.count > 0) {
      if (
        !bestDayOfWeek ||
        data.count > bestDayOfWeek.sessionCount ||
        (data.count === bestDayOfWeek.sessionCount && data.seconds > bestDayOfWeek.focusMinutes * 60)
      ) {
        bestDayOfWeek = {
          dayName: weekdayFullNameMap[dName] || dName,
          sessionCount: data.count,
          focusMinutes: Math.round(data.seconds / 60),
        }
      }
    }
  }

  const avgPomodoroDuration =
    completedPomodoroCount > 0 ? Math.round(totalPomodoroFocusSeconds / 60 / completedPomodoroCount) : 0

  const longestSessionMinutes = Math.round(longestPomodoroSeconds / 60)

  // Build 4-5 recent completed sessions formatted in local timezone
  const recentSessions: RecentPomodoroSession[] = completedFocusSessionsList
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
    .slice(0, 5)
    .map((s) => {
      const durSec = s.actual_seconds > 0 ? s.actual_seconds : s.planned_seconds
      const durationMinutes = Math.max(1, Math.round(durSec / 60))
      const rel = formatRelativeSessionDate(s.started_at, userTimezone)
      return {
        id: s.id,
        startedAt: s.started_at,
        dateLabel: rel.dateLabel,
        timeLabel: rel.timeLabel,
        durationMinutes,
        formattedDuration: formatStudyDuration(durationMinutes),
      }
    })

  const pomodoroAnalytics: PomodoroAnalyticsData = {
    totalCompleted: completedPomodoroCount,
    totalFocusMinutes: Math.round(totalPomodoroFocusSeconds / 60),
    formattedFocusTime: formatStudyDuration(totalPomodoroFocusSeconds / 60),
    averageSessionMinutes: avgPomodoroDuration,
    longestSessionMinutes,
    formattedLongestSession: formatStudyDuration(longestSessionMinutes),
    recentSessions,
    bestDayOfWeek,
  }

  // 8. Course / Playlist Progress Analytics
  const playlistItemsList: PlaylistProgressItem[] = []
  if (savedPlaylists.length > 0) {
    const playlistIds = savedPlaylists.map((p) => p.playlist_id).filter(Boolean)

    const { data: pItems } = await supabase
      .from('playlist_items')
      .select('playlist_id, video_id')
      .in('playlist_id', playlistIds)

    const pItemsData = pItems || []
    const allVideoIds = Array.from(new Set(pItemsData.map((pi) => pi.video_id)))

    const userSavedVideosMap = new Map<string, { status: string; progress: number }>()
    if (allVideoIds.length > 0) {
      const { data: svData } = await supabase
        .from('saved_videos')
        .select('video_id, status, watch_progress_seconds')
        .eq('user_id', userId)
        .in('video_id', allVideoIds)

      if (svData) {
        for (const sv of svData) {
          userSavedVideosMap.set(sv.video_id, {
            status: sv.status,
            progress: sv.watch_progress_seconds,
          })
        }
      }
    }

    for (const sp of savedPlaylists) {
      const itemsForPlaylist = pItemsData.filter((pi) => pi.playlist_id === sp.playlist_id)
      const totalVideos = itemsForPlaylist.length

      let completedVideos = 0
      let totalDurationSeconds = 0

      for (const item of itemsForPlaylist) {
        const saved = userSavedVideosMap.get(item.video_id)
        if (saved) {
          if (saved.status === 'completed') {
            completedVideos += 1
          }
          totalDurationSeconds += saved.progress || 0
        }
      }

      const progressPercent = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0
      const pObj = sp.playlist as unknown as {
        id: string
        title: string
        channel_name: string | null
        thumbnail_url: string | null
      }

      playlistItemsList.push({
        id: sp.id,
        playlistId: sp.playlist_id,
        title: pObj.title || 'Untitled Playlist',
        channelName: pObj.channel_name,
        thumbnailUrl: pObj.thumbnail_url,
        totalVideos,
        completedVideos,
        progressPercent,
        totalDurationSeconds,
        formattedDuration: formatStudyDuration(totalDurationSeconds / 60),
      })
    }
  }

  const playlistProgress: PlaylistProgressData = {
    playlists: playlistItemsList,
    hasData: playlistItemsList.length > 0,
  }

  // 9. Subject / Category Distribution
  const categoryCountMap = new Map<string, number>()
  let totalResourceCount = 0

  for (const r of resources) {
    if (r.category && typeof r.category === 'string' && r.category.trim()) {
      const cat = r.category.trim()
      categoryCountMap.set(cat, (categoryCountMap.get(cat) || 0) + 1)
      totalResourceCount += 1
    }
  }

  for (const d of documents) {
    if (d.category && typeof d.category === 'string' && d.category.trim()) {
      const cat = d.category.trim()
      categoryCountMap.set(cat, (categoryCountMap.get(cat) || 0) + 1)
      totalResourceCount += 1
    }
  }

  const colorPalette = [
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#14b8a6', // Teal
    '#f97316', // Orange
    '#06b6d4', // Cyan
  ]

  const categories: SubjectDistributionItem[] = []
  let mostStudiedSubject: string | null = null
  let maxCatCount = 0

  let colorIdx = 0
  for (const [catName, count] of categoryCountMap.entries()) {
    const percentage = totalResourceCount > 0 ? Math.round((count / totalResourceCount) * 100) : 0
    if (count > maxCatCount) {
      maxCatCount = count
      mostStudiedSubject = catName
    }

    // Check if preset has icon or custom category has icon
    const preset = PRESET_CATEGORIES.find((p) => p.name.toLowerCase() === catName.toLowerCase())
    const custom = customCategories.find((c: { name?: string; icon?: string | null }) => c.name?.toLowerCase() === catName.toLowerCase())
    const icon = custom?.icon || preset?.icon || null

    categories.push({
      name: catName,
      count,
      percentage,
      color: colorPalette[colorIdx % colorPalette.length],
      icon,
    })
    colorIdx += 1
  }

  categories.sort((a, b) => b.count - a.count)

  const subjectDistribution: SubjectDistributionData = {
    categories,
    mostStudiedSubject,
    totalResources: totalResourceCount,
    hasData: categories.length > 0,
  }

  // 10. Time of Day Analysis
  const totalPeriodSeconds = morningSeconds + afternoonSeconds + eveningSeconds + nightSeconds
  let peakPeriod: TimeOfDayData['peakPeriod'] = null
  let peakPercentage: number | null = null

  if (totalPeriodSeconds > 0) {
    const periods = [
      { name: 'Morning' as const, secs: morningSeconds },
      { name: 'Afternoon' as const, secs: afternoonSeconds },
      { name: 'Evening' as const, secs: eveningSeconds },
      { name: 'Night' as const, secs: nightSeconds },
    ]
    periods.sort((a, b) => b.secs - a.secs)
    peakPeriod = periods[0].name
    peakPercentage = Math.round((periods[0].secs / totalPeriodSeconds) * 100)
  }

  const timeOfDay: TimeOfDayData = {
    morningMinutes: Math.round(morningSeconds / 60),
    afternoonMinutes: Math.round(afternoonSeconds / 60),
    eveningMinutes: Math.round(eveningSeconds / 60),
    nightMinutes: Math.round(nightSeconds / 60),
    morningPomodoros,
    afternoonPomodoros,
    eveningPomodoros,
    nightPomodoros,
    peakPeriod,
    peakPercentage,
    hasEnoughData: completedPomodoroCount >= 3,
  }

  // 11. Consistency Score (0 - 100)
  const last30Days = heatmapDays.slice(-30)
  const activeDaysLast30 = last30Days.filter((d) => d.isQualifying).length
  const consistencyScore = calculateConsistencyScore(
    activeDaysLast30,
    streaks.currentStreak,
    weeklyGraph.currentWeekTotalMinutes,
    weeklyGoalMinutes
  )

  // 12. Weekly Goal Data
  const currentMinutes = weeklyGraph.currentWeekTotalMinutes
  const progressPercent = Math.min(100, Math.round((currentMinutes / weeklyGoalMinutes) * 100))
  const remainingMinutes = Math.max(0, weeklyGoalMinutes - currentMinutes)
  const isAchieved = currentMinutes >= weeklyGoalMinutes

  const weeklyGoal: WeeklyGoalData = {
    goalMinutes: weeklyGoalMinutes,
    goalHours: Math.round(weeklyGoalMinutes / 60),
    currentMinutes,
    progressPercent,
    remainingMinutes,
    formattedRemaining: formatStudyDuration(remainingMinutes),
    isAchieved,
  }

  // 13. Milestones
  const milestones = calculateMilestones(streaks.activeDays, streaks.currentStreak, streaks.longestStreak)

  // 14. Deterministic Insights
  const insights = generateDeterministicInsights(
    streaks,
    weeklyGraph,
    timeOfDay,
    pomodoroAnalytics,
    weeklyGoal
  )

  // 15. Top Summary metrics (cohesive with dailyMap and localized date)
  const todayAcc = dailyMap.get(todayStr)
  const todayStudyMinutes = todayAcc ? Math.round(todayAcc.studySeconds / 60) : 0
  const todayPomodoroCount = todayAcc ? todayAcc.pomodoroCount : 0

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'completed').length
  const pendingTasks = totalTasks - completedTasks
  const taskCompletionPercentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  const summary: AnalyticsSummary = {
    today: {
      studyMinutes: todayStudyMinutes,
      pomodoroCount: todayPomodoroCount,
      formattedDuration: formatStudyDuration(todayStudyMinutes),
    },
    week: {
      studyMinutes: weeklyGraph.currentWeekTotalMinutes,
      pomodoroCount: weeklyGraph.days.reduce((acc, d) => {
        const item = dailyMap.get(d.dateStr)
        return acc + (item?.pomodoroCount || 0)
      }, 0),
      formattedDuration: weeklyGraph.formattedWeekTotal,
    },
    tasks: {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      completionPercentage: taskCompletionPercentage,
    },
    timezone: userTimezone,
  }

  return {
    summary,
    streaks: yearlyData[nowParts.year]?.streaks || streaks,
    heatmap: {
      days: yearlyData[nowParts.year]?.days || heatmapDays,
      startDate: yearlyData[nowParts.year]?.days?.[0]?.dateStr || heatmapDays[0]?.dateStr || todayStr,
      endDate: yearlyData[nowParts.year]?.days?.[yearlyData[nowParts.year]?.days?.length - 1]?.dateStr || todayStr,
    },
    yearlyData,
    availableYears: [nowParts.year],
    selectedYear: nowParts.year,
    weeklyGraph,
    monthlySummary,
    monthlySummaries,
    availableMonthKeys,
    pomodoro: pomodoroAnalytics,
    playlistProgress,
    subjectDistribution,
    timeOfDay,
    consistencyScore,
    weeklyGoal,
    milestones,
    insights,
    timezone: userTimezone,
  }
}

export interface DashboardAnalyticsData {
  today: {
    studyMinutes: number
    pomodoroCount: number
    formattedDuration: string
    completedTasks: number
    totalTasks: number
    pendingTasks: number
    taskCompletionPercentage: number
  }
  consistency: CompactConsistencyData
  heatmap: {
    days: DailyActivity[]
    streaks: StreakStats
    timezone: string
    yearlyData: Record<number, YearlyActivityData>
    availableYears: number[]
    selectedYear: number
  }
  timezone: string
}

/**
 * Streamlined, high-performance data loader specifically for Dashboard metrics & heatmap.
 * Eliminates querying and processing 8+ secondary tables (documents, resources, categories,
 * course progress, monthly summaries, milestones, deterministic insights) on dashboard load.
 */
export async function getDashboardActivityAndHeatmap(
  userId: string,
  targetTimezone?: string | null
): Promise<DashboardAnalyticsData> {
  const supabase = await createClient()

  // 1. Resolve user timezone
  const userTimezone = targetTimezone || (await getUserTimezone(userId))
  const todayStr = getZonedDateString(new Date(), userTimezone)
  const nowParts = getZonedDateParts(new Date(), userTimezone)

  // 2. Fetch only the 3 tables needed for study time, pomodoro counts, notes, tasks and heatmap
  const [pomodoroRes, notesRes, tasksRes] = await Promise.all([
    supabase
      .from('pomodoro_sessions')
      .select('id, session_type, planned_seconds, actual_seconds, started_at, status')
      .eq('user_id', userId)
      .eq('session_type', 'focus')
      .order('started_at', { ascending: true }),

    supabase
      .from('video_timestamp_notes')
      .select('id, created_at')
      .eq('user_id', userId),

    supabase
      .from('tasks')
      .select('id, status, completed_at')
      .eq('user_id', userId),
  ])

  const pomodoroSessions = pomodoroRes.data || []
  const notes = notesRes.data || []
  const tasks = tasksRes.data || []

  // 3. Build unified daily activity map
  const dailyMap = new Map<string, InternalDailyAccumulator>()

  const getOrCreateAcc = (dStr: string): InternalDailyAccumulator => {
    let acc = dailyMap.get(dStr)
    if (!acc) {
      acc = {
        dateStr: dStr,
        studySeconds: 0,
        pomodoroCount: 0,
        notesCount: 0,
        tasksCompletedCount: 0,
      }
      dailyMap.set(dStr, acc)
    }
    return acc
  }

  let earliestActivityYear = nowParts.year

  for (const session of pomodoroSessions) {
    if (session.status === 'completed' || session.actual_seconds > 0) {
      const durSeconds = session.actual_seconds > 0 ? session.actual_seconds : session.planned_seconds
      const sessionDate = new Date(session.started_at)
      const dStr = getZonedDateString(sessionDate, userTimezone)
      const parts = getZonedDateParts(sessionDate, userTimezone)

      if (parts.year < earliestActivityYear) {
        earliestActivityYear = parts.year
      }

      const acc = getOrCreateAcc(dStr)
      acc.studySeconds += durSeconds
      if (session.status === 'completed') {
        acc.pomodoroCount += 1
      }
    }
  }

  for (const note of notes) {
    if (note.created_at) {
      const noteDate = new Date(note.created_at)
      const dStr = getZonedDateString(noteDate, userTimezone)
      const parts = getZonedDateParts(noteDate, userTimezone)
      if (parts.year < earliestActivityYear) {
        earliestActivityYear = parts.year
      }
      const acc = getOrCreateAcc(dStr)
      acc.notesCount += 1
    }
  }

  for (const t of tasks) {
    if (t.status === 'completed' && t.completed_at) {
      const taskDate = new Date(t.completed_at)
      const dStr = getZonedDateString(taskDate, userTimezone)
      const parts = getZonedDateParts(taskDate, userTimezone)
      if (parts.year < earliestActivityYear) {
        earliestActivityYear = parts.year
      }
      const acc = getOrCreateAcc(dStr)
      acc.tasksCompletedCount += 1
    }
  }

  // 4. Generate rolling series & streaks
  const heatmapDays = buildDailyActivitySeries(dailyMap, todayStr, userTimezone, 365)
  const streaks = calculateStreaks(heatmapDays, todayStr, userTimezone)

  // 5. Generate Year-by-Year Navigation Data
  const availableYears: number[] = []
  const yearlyData: Record<number, YearlyActivityData> = {}
  const minYear = Math.min(earliestActivityYear, nowParts.year - 1)
  for (let yr = nowParts.year; yr >= minYear; yr--) {
    availableYears.push(yr)
    const calData = buildYearCalendarSeries(dailyMap, yr, userTimezone, todayStr)
    yearlyData[yr] = {
      year: yr,
      days: calData.days,
      streaks: calData.streaks,
      isCurrentYear: yr === nowParts.year,
    }
  }

  // 6. Compute today's metrics
  const todayAcc = dailyMap.get(todayStr)
  const todayStudyMinutes = todayAcc ? Math.round(todayAcc.studySeconds / 60) : 0
  const todayPomodoroCount = todayAcc ? todayAcc.pomodoroCount : 0

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'completed').length
  const pendingTasks = totalTasks - completedTasks
  const taskCompletionPercentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  const compactConsistency: CompactConsistencyData = {
    recentDays: heatmapDays.slice(-91),
    streaks,
    timezone: userTimezone,
  }

  return {
    today: {
      studyMinutes: todayStudyMinutes,
      pomodoroCount: todayPomodoroCount,
      formattedDuration: formatStudyDuration(todayStudyMinutes),
      completedTasks,
      totalTasks,
      pendingTasks,
      taskCompletionPercentage,
    },
    consistency: compactConsistency,
    heatmap: {
      days: yearlyData[nowParts.year]?.days || heatmapDays,
      streaks: yearlyData[nowParts.year]?.streaks || streaks,
      timezone: userTimezone,
      yearlyData,
      availableYears,
      selectedYear: nowParts.year,
    },
    timezone: userTimezone,
  }
}

/**
 * Fetches compact consistency data for the Dashboard (recent 91 days heatmap + streaks).
 */
export async function getCompactConsistencyData(
  userId: string,
  targetTimezone?: string | null
): Promise<CompactConsistencyData> {
  const full = await getComprehensiveAnalytics(userId, targetTimezone)
  const recentDays = full.heatmap.days.slice(-91)

  return {
    recentDays,
    streaks: full.streaks,
    timezone: full.timezone,
  }
}

/**
 * Backward-compatible function for existing callers.
 */
export async function getAnalyticsSummary(
  userId: string,
  preFetchedTimezone?: string | null
): Promise<AnalyticsSummary> {
  const full = await getComprehensiveAnalytics(userId, preFetchedTimezone)
  return full.summary
}

