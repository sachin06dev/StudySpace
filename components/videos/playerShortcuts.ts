export interface ShortcutDefinition {
  id: string
  keys: string[]
  displayKeys: string[]
  description: string
  category: 'playback' | 'navigation' | 'audio' | 'notes'
}

export interface ShortcutCategoryMeta {
  id: string
  title: string
  category: 'playback' | 'navigation' | 'audio' | 'notes'
  shortcuts: ShortcutDefinition[]
}

export const PLAYER_SHORTCUTS: ShortcutDefinition[] = [
  // Playback & Display
  {
    id: 'play_pause',
    keys: [' ', 'k', 'K'],
    displayKeys: ['Space', 'k'],
    description: 'Play / Pause video',
    category: 'playback',
  },
  {
    id: 'toggle_fullscreen',
    keys: ['f', 'F'],
    displayKeys: ['f'],
    description: 'Toggle Fullscreen',
    category: 'playback',
  },
  {
    id: 'exit_or_close',
    keys: ['Escape'],
    displayKeys: ['Esc'],
    description: 'Cancel Note / Close Modal / Dismiss Overlay',
    category: 'playback',
  },

  // Navigation & Seeking
  {
    id: 'seek_rewind_5',
    keys: ['ArrowLeft'],
    displayKeys: ['←'],
    description: 'Rewind 5 seconds',
    category: 'navigation',
  },
  {
    id: 'seek_forward_5',
    keys: ['ArrowRight'],
    displayKeys: ['→'],
    description: 'Forward 5 seconds',
    category: 'navigation',
  },
  {
    id: 'seek_rewind_10',
    keys: ['j', 'J'],
    displayKeys: ['j'],
    description: 'Rewind 10 seconds',
    category: 'navigation',
  },
  {
    id: 'seek_forward_10',
    keys: ['l', 'L'],
    displayKeys: ['l'],
    description: 'Forward 10 seconds',
    category: 'navigation',
  },
  {
    id: 'seek_beginning',
    keys: ['0', 'Home'],
    displayKeys: ['0', 'Home'],
    description: 'Jump to Beginning (0%)',
    category: 'navigation',
  },
  {
    id: 'seek_end',
    keys: ['End'],
    displayKeys: ['End'],
    description: 'Jump to End (100%)',
    category: 'navigation',
  },
  {
    id: 'percent_jump',
    keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    displayKeys: ['1', '–', '9'],
    description: 'Jump to 10% – 90% of video',
    category: 'navigation',
  },

  // Audio & Speed
  {
    id: 'toggle_mute',
    keys: ['m', 'M'],
    displayKeys: ['m'],
    description: 'Toggle Mute / Unmute',
    category: 'audio',
  },
  {
    id: 'volume_adjust',
    keys: ['ArrowUp', 'ArrowDown'],
    displayKeys: ['↑', '↓'],
    description: 'Increase / Decrease volume 5%',
    category: 'audio',
  },
  {
    id: 'speed_adjust',
    keys: ['<', '>', ',', '.'],
    displayKeys: ['<', '>'],
    description: 'Decrease / Increase speed (0.25x – 2x)',
    category: 'audio',
  },

  // Study & Notes
  {
    id: 'add_note',
    keys: ['n', 'N'],
    displayKeys: ['n'],
    description: 'Add Timestamp Note at current time',
    category: 'notes',
  },
  {
    id: 'save_note',
    keys: ['Enter'],
    displayKeys: ['Ctrl/Cmd', 'Enter'],
    description: 'Save note while editing',
    category: 'notes',
  },
  {
    id: 'cancel_note',
    keys: ['z', 'Z'],
    displayKeys: ['Ctrl/Cmd', 'z'],
    description: 'Cancel note draft without saving',
    category: 'notes',
  },
  {
    id: 'shortcuts_help',
    keys: ['?'],
    displayKeys: ['?'],
    description: 'Toggle Keyboard Shortcuts modal',
    category: 'notes',
  },
]

export const SHORTCUT_CATEGORY_CONFIG = [
  {
    id: 'playback',
    title: 'Playback & Display',
    category: 'playback' as const,
  },
  {
    id: 'navigation',
    title: 'Navigation & Seeking',
    category: 'navigation' as const,
  },
  {
    id: 'audio',
    title: 'Audio & Speed',
    category: 'audio' as const,
  },
  {
    id: 'notes',
    title: 'Study & Notes',
    category: 'notes' as const,
  },
]
