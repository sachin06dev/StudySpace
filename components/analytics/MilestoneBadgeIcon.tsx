import type { MilestoneItem } from '@/lib/data/analytics'

export interface MilestoneBadgeIconProps {
  item: MilestoneItem
  size?: 'sm' | 'md' | 'lg'
}

export default function MilestoneBadgeIcon({
  item,
  size = 'sm',
}: MilestoneBadgeIconProps) {
  const isUnlocked = item.isUnlocked

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-14 h-14 rounded-2xl',
  }[size]

  const iconSizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-base',
    lg: 'w-7 h-7 text-2xl',
  }[size]

  switch (item.id) {
    case 'days-5': // First Steps (Seedling / Paper Plane)
      return (
        <div
          className={`${sizeClasses} flex items-center justify-center shrink-0 transition-all ${
            isUnlocked
              ? 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-sm shadow-emerald-500/20 ring-2 ring-emerald-400/40'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
          }`}
          aria-hidden="true"
        >
          <svg
            className={iconSizeClasses}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </div>
      )
    case 'days-10': // Double Digits (Target)
      return (
        <div
          className={`${sizeClasses} flex items-center justify-center shrink-0 transition-all ${
            isUnlocked
              ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-sm shadow-indigo-500/20 ring-2 ring-indigo-400/40'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
          }`}
          aria-hidden="true"
        >
          <svg
            className={iconSizeClasses}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
          </svg>
        </div>
      )
    case 'days-25': // Quarter Century (Star)
      return (
        <div
          className={`${sizeClasses} flex items-center justify-center shrink-0 transition-all ${
            isUnlocked
              ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-white shadow-sm shadow-amber-500/20 ring-2 ring-amber-400/40'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
          }`}
          aria-hidden="true"
        >
          <svg className={iconSizeClasses} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      )
    case 'days-50': // Halfway to 100 (Rocket / Flask)
      return (
        <div
          className={`${sizeClasses} flex items-center justify-center shrink-0 transition-all ${
            isUnlocked
              ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-sm shadow-purple-500/20 ring-2 ring-purple-400/40'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
          }`}
          aria-hidden="true"
        >
          <svg
            className={iconSizeClasses}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
        </div>
      )
    case 'days-100': // Century Club (Trophy)
      return (
        <div
          className={`${sizeClasses} flex items-center justify-center shrink-0 transition-all ${
            isUnlocked
              ? 'bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-300'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
          }`}
          aria-hidden="true"
        >
          <svg
            className={iconSizeClasses}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        </div>
      )
    case 'streak-3': // Spark (Lightning)
      return (
        <div
          className={`${sizeClasses} flex items-center justify-center shrink-0 transition-all ${
            isUnlocked
              ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm shadow-amber-500/20 ring-2 ring-amber-400/40'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
          }`}
          aria-hidden="true"
        >
          <svg className={iconSizeClasses} fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
      )
    case 'streak-7': // Week Warrior (Flame)
      return (
        <div
          className={`${sizeClasses} flex items-center justify-center shrink-0 transition-all ${
            isUnlocked
              ? 'bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-sm shadow-rose-500/20 ring-2 ring-rose-400/40'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
          }`}
          aria-hidden="true"
        >
          <svg
            className={iconSizeClasses}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
            />
          </svg>
        </div>
      )
    case 'streak-14': // Fortnight Focus (Shield)
      return (
        <div
          className={`${sizeClasses} flex items-center justify-center shrink-0 transition-all ${
            isUnlocked
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-500/20 ring-2 ring-blue-400/40'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
          }`}
          aria-hidden="true"
        >
          <svg
            className={iconSizeClasses}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
      )
    case 'streak-30': // Iron Habit (Diamond)
      return (
        <div
          className={`${sizeClasses} flex items-center justify-center shrink-0 transition-all ${
            isUnlocked
              ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-md shadow-violet-500/30 ring-2 ring-violet-400/50'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
          }`}
          aria-hidden="true"
        >
          <svg
            className={iconSizeClasses}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2l8 6-8 14-8-14 8-6z"
            />
          </svg>
        </div>
      )
    default:
      return (
        <div
          className={`${sizeClasses} bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${iconSizeClasses}`}
          aria-hidden="true"
        >
          {item.icon}
        </div>
      )
  }
}
