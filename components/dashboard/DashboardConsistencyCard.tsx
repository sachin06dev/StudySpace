'use client'

import HeatmapGrid from '@/components/analytics/HeatmapGrid'
import type {
  CompactConsistencyData,
  DailyActivity,
  StreakStats,
  YearlyActivityData,
} from '@/lib/data/analytics'

export interface DashboardConsistencyCardProps {
  data?: CompactConsistencyData
  heatmap?: {
    days: DailyActivity[]
    streaks: StreakStats
    timezone: string
    yearlyData?: Record<number, YearlyActivityData>
    availableYears?: number[]
    selectedYear?: number
  }
}

export default function DashboardConsistencyCard({
  data,
  heatmap,
}: DashboardConsistencyCardProps) {
  if (heatmap) {
    return (
      <HeatmapGrid
        mode="dashboard"
        days={heatmap.days}
        streaks={heatmap.streaks}
        timezone={heatmap.timezone}
        yearlyData={heatmap.yearlyData}
      />
    )
  }

  if (data) {
    return (
      <HeatmapGrid
        mode="dashboard"
        days={data.recentDays}
        streaks={data.streaks}
        timezone={data.timezone}
      />
    )
  }

  return null
}
