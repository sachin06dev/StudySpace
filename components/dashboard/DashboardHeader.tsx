import React from 'react'
import DashboardLiveClock from './DashboardLiveClock'

interface DashboardHeaderProps {
  heading: string
  subheading: string
  formattedDate: string
  timezone: string
}

export default function DashboardHeader({
  heading,
  subheading,
  formattedDate,
  timezone,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
          {heading}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subheading}</p>
      </div>

      <DashboardLiveClock timezone={timezone} formattedDate={formattedDate} />
    </div>
  )
}


