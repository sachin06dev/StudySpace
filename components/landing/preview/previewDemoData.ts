export type PreviewSection =
  | 'dashboard'
  | 'tasks'
  | 'pomodoro'
  | 'videos'
  | 'playlists'
  | 'resources'
  | 'notes'
  | 'documents'
  | 'analytics'

export interface PreviewTask {
  id: string
  title: string
  category: string
  priority: 'high' | 'medium' | 'normal'
  dueDate: string
  completed: boolean
}

export interface PreviewTimestampNote {
  id: string
  timestampSecs: number
  timestampLabel: string
  content: string
  videoTitle: string
  channelName: string
  createdAt: string
}

export interface PreviewPlaylist {
  id: string
  title: string
  channelName: string
  videoCount: number
  completedCount: number
  thumbnailUrl: string
  description: string
  category: string
  items: {
    id: string
    title: string
    duration: string
    completed: boolean
  }[]
}

export interface PreviewResource {
  id: string
  title: string
  url: string
  domain: string
  category: 'documentation' | 'practice' | 'course' | 'reference' | 'college'
  description: string
  savedDate: string
}

export interface PreviewDocument {
  id: string
  title: string
  fileName: string
  fileType: 'pdf' | 'docx' | 'notes'
  fileSize: string
  category: 'Notes' | 'Reference' | 'College' | 'Assignment'
  uploadedDate: string
  summary: string
  pageCount?: number
}

export interface PreviewAnalyticsData {
  summary: {
    totalStudyTime: string
    pomodoroCount: number
    tasksDone: string
    weeklyGoal: string
    currentStreak: number
    consistencyScore: number
  }
  weeklyHours: {
    day: string
    fullDay: string
    hours: number
    pomodoros: number
    label: string
  }[]
  subjectBreakdown: {
    subject: string
    percentage: number
    hours: string
    color: string
  }[]
}

// ----------------------------------------------------
// DEMO DATASET
// ----------------------------------------------------

export const INITIAL_TASKS: PreviewTask[] = [
  {
    id: 'task-1',
    title: 'Finish DSA Graph & Tree Traversal Assignment',
    category: 'Algorithms',
    priority: 'high',
    dueDate: 'Today',
    completed: true,
  },
  {
    id: 'task-2',
    title: 'Complete Pomodoro Session #3 on OS Memory',
    category: 'Operating Systems',
    priority: 'normal',
    dueDate: 'Today',
    completed: true,
  },
  {
    id: 'task-3',
    title: 'Review Graph Notes (DFS vs BFS Complexity)',
    category: 'Algorithms',
    priority: 'high',
    dueDate: 'Today',
    completed: false,
  },
  {
    id: 'task-4',
    title: 'Read OS Chapter 2: Threads & Concurrency',
    category: 'Operating Systems',
    priority: 'medium',
    dueDate: 'Tomorrow',
    completed: false,
  },
  {
    id: 'task-5',
    title: 'Practice LeetCode #15: 3Sum & Two Pointers',
    category: 'Practice',
    priority: 'high',
    dueDate: 'Tomorrow',
    completed: false,
  },
  {
    id: 'task-6',
    title: 'Review DBMS Normalization 1NF to BCNF',
    category: 'Database',
    priority: 'normal',
    dueDate: 'Oct 28',
    completed: true,
  },
]

export const PREVIEW_TIMESTAMP_NOTES: PreviewTimestampNote[] = [
  {
    id: 'note-1',
    timestampSecs: 252,
    timestampLabel: '04:12',
    content: 'DFS recursion stack trace: remember base case returns when visited array has node.',
    videoTitle: 'Data Structures & Algorithms — Lecture 14',
    channelName: 'CS Algorithms Hub',
    createdAt: '2 hours ago',
  },
  {
    id: 'note-2',
    timestampSecs: 765,
    timestampLabel: '12:45',
    content: 'Adjacency list vs matrix space complexity: O(V + E) sparse vs O(V²) dense.',
    videoTitle: 'Data Structures & Algorithms — Lecture 14',
    channelName: 'CS Algorithms Hub',
    createdAt: '1 hour ago',
  },
  {
    id: 'note-3',
    timestampSecs: 1100,
    timestampLabel: '18:20',
    content: 'BFS queue implementation level-order vs DFS recursion depth-first comparison.',
    videoTitle: 'Data Structures & Algorithms — Lecture 14',
    channelName: 'CS Algorithms Hub',
    createdAt: '45 mins ago',
  },
  {
    id: 'note-4',
    timestampSecs: 1490,
    timestampLabel: '24:50',
    content: 'Connected components & cycle detection using colored node states (white/gray/black).',
    videoTitle: 'Data Structures & Algorithms — Lecture 14',
    channelName: 'CS Algorithms Hub',
    createdAt: '10 mins ago',
  },
]

export const ALL_PREVIEW_NOTES: PreviewTimestampNote[] = [
  ...PREVIEW_TIMESTAMP_NOTES,
  {
    id: 'note-5',
    timestampSecs: 510,
    timestampLabel: '08:30',
    content: 'Process vs Thread memory space: threads share heap and data segment, but have separate stacks.',
    videoTitle: 'Operating Systems & Concurrency — Lecture 5',
    channelName: 'System Core Lectures',
    createdAt: 'Yesterday',
  },
  {
    id: 'note-6',
    timestampSecs: 910,
    timestampLabel: '15:10',
    content: 'B-Tree vs B+ Tree indexing: leaf nodes are linked lists in B+ Tree which makes range queries O(log N + k).',
    videoTitle: 'Database Systems & SQL Optimization',
    channelName: 'Data Architecture Lab',
    createdAt: '2 days ago',
  },
]

export const PREVIEW_PLAYLISTS: PreviewPlaylist[] = [
  {
    id: 'pl-1',
    title: 'Java Data Structures & Algorithms',
    channelName: 'CS Algorithms Hub',
    videoCount: 32,
    completedCount: 22,
    thumbnailUrl: 'https://images.unsplash.com/photo-1516116211227-bbc1b4b0e5d1?w=600&auto=format&fit=crop&q=80',
    description: 'Complete masterclass on Arrays, Linked Lists, Trees, Graphs, Dynamic Programming & LeetCode.',
    category: 'Algorithms',
    items: [
      { id: 'v1', title: 'Lecture 1: Time & Space Complexity Big-O', duration: '24:10', completed: true },
      { id: 'v2', title: 'Lecture 2: Array Manipulation & Two Pointers', duration: '30:45', completed: true },
      { id: 'v14', title: 'Lecture 14: Graph Traversals DFS & BFS', duration: '32:10', completed: false },
      { id: 'v15', title: 'Lecture 15: Dijkstra & Shortest Path', duration: '28:15', completed: false },
    ],
  },
  {
    id: 'pl-2',
    title: 'Full Stack Web Development & Next.js',
    channelName: 'Modern Dev School',
    videoCount: 24,
    completedCount: 10,
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    description: 'Deep dive into modern full-stack engineering, React Server Components, Tailwind CSS & Supabase.',
    category: 'Web Dev',
    items: [
      { id: 'w1', title: '01: Modern TypeScript Fundamentals', duration: '35:20', completed: true },
      { id: 'w2', title: '02: React App Router Architecture', duration: '41:10', completed: true },
      { id: 'w3', title: '03: Server Actions & Data Mutations', duration: '38:00', completed: false },
    ],
  },
  {
    id: 'pl-3',
    title: 'Operating Systems & Concurrency',
    channelName: 'System Core Lectures',
    videoCount: 18,
    completedCount: 5,
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    description: 'Process scheduling, deadlocks, virtual memory paging, semaphore synchronization & Unix internals.',
    category: 'Systems',
    items: [
      { id: 'os1', title: 'OS Overview & Kernel vs User Mode', duration: '29:40', completed: true },
      { id: 'os2', title: 'Process Scheduling Algorithms', duration: '34:15', completed: true },
      { id: 'os3', title: 'Paging & Virtual Memory Management', duration: '42:50', completed: false },
    ],
  },
  {
    id: 'pl-4',
    title: 'Database Management Systems & SQL',
    channelName: 'Data Architecture Lab',
    videoCount: 20,
    completedCount: 11,
    thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80',
    description: 'Relational database theory, schema normalization, ACID transactions, indexing & PostgreSQL.',
    category: 'Databases',
    items: [
      { id: 'db1', title: 'Relational Model & Keys', duration: '22:30', completed: true },
      { id: 'db2', title: 'SQL Joins & Subqueries', duration: '31:10', completed: true },
      { id: 'db3', title: 'Indexing & B-Tree Internals', duration: '27:45', completed: false },
    ],
  },
]

export const PREVIEW_RESOURCES: PreviewResource[] = [
  {
    id: 'res-1',
    title: 'MDN Web Docs — JavaScript Reference & Guide',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    domain: 'developer.mozilla.org',
    category: 'documentation',
    description: 'Comprehensive documentation and standard specifications for modern JavaScript and Web APIs.',
    savedDate: 'Oct 22, 2026',
  },
  {
    id: 'res-2',
    title: 'LeetCode Study Plan — Top Interview 150',
    url: 'https://leetcode.com/studyplan/top-interview-150/',
    domain: 'leetcode.com',
    category: 'practice',
    description: 'Must-do DSA problem set curated for software engineering technical interview readiness.',
    savedDate: 'Oct 20, 2026',
  },
  {
    id: 'res-3',
    title: 'MIT 6.006 Introduction to Algorithms',
    url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms/',
    domain: 'ocw.mit.edu',
    category: 'course',
    description: 'OpenCourseWare lecture materials, problem sets, and recitations covering algorithms and analysis.',
    savedDate: 'Oct 18, 2026',
  },
  {
    id: 'res-4',
    title: 'PostgreSQL 16 Documentation & SQL Cheatsheet',
    url: 'https://www.postgresql.org/docs/16/index.html',
    domain: 'postgresql.org',
    category: 'reference',
    description: 'Official PostgreSQL docs covering query optimization, indexing strategies, and JSONB operators.',
    savedDate: 'Oct 15, 2026',
  },
  {
    id: 'res-5',
    title: 'University Operating Systems Final Exam Question Bank',
    url: 'https://cs.university.edu/courses/os-pyq-archive',
    domain: 'cs.university.edu',
    category: 'college',
    description: 'Previous year university exam papers on Semaphore sync, Banker Algorithm, and Page replacement.',
    savedDate: 'Oct 10, 2026',
  },
]

export const PREVIEW_DOCUMENTS: PreviewDocument[] = [
  {
    id: 'doc-1',
    title: 'DSA Unit 2 Tree & Graph Traversals.pdf',
    fileName: 'DSA_Unit_2_Trees_Graphs.pdf',
    fileType: 'pdf',
    fileSize: '4.2 MB',
    category: 'Notes',
    uploadedDate: 'Oct 21, 2026',
    pageCount: 28,
    summary: 'Comprehensive handwritten & typed notes on Binary Trees, BSTs, AVL rotations, and BFS/DFS graph traversals with code snippets.',
  },
  {
    id: 'doc-2',
    title: 'DBMS SQL Cheatsheet & Normalization.pdf',
    fileName: 'DBMS_Normalization_Guide.pdf',
    fileType: 'pdf',
    fileSize: '1.8 MB',
    category: 'Reference',
    uploadedDate: 'Oct 19, 2026',
    pageCount: 14,
    summary: 'Quick revision formulas for functional dependencies, candidate keys, 1NF, 2NF, 3NF, BCNF decomposition and indexing comparison.',
  },
  {
    id: 'doc-3',
    title: 'Operating Systems PYQs 2020-2025.pdf',
    fileName: 'OS_Solved_PYQs_2020_2025.pdf',
    fileType: 'pdf',
    fileSize: '8.5 MB',
    category: 'College',
    uploadedDate: 'Oct 14, 2026',
    pageCount: 52,
    summary: 'Solved university questions covering CPU scheduling numericals, Banker deadlock avoidance, and FIFO/LRU page fault calculations.',
  },
  {
    id: 'doc-4',
    title: 'Computer Networks Important Exam Review.docx',
    fileName: 'CN_Final_Exam_Review.docx',
    fileType: 'docx',
    fileSize: '3.1 MB',
    category: 'College',
    uploadedDate: 'Oct 11, 2026',
    pageCount: 18,
    summary: 'OSI vs TCP/IP model, Subnetting CIDR calculations, TCP 3-way handshake, Flow control (Sliding Window), and Routing protocols (OSPF/BGP).',
  },
]

export const PREVIEW_ANALYTICS: PreviewAnalyticsData = {
  summary: {
    totalStudyTime: '18h 30m',
    pomodoroCount: 24,
    tasksDone: '18 / 21',
    weeklyGoal: '18.5 / 20 hrs',
    currentStreak: 7,
    consistencyScore: 94,
  },
  weeklyHours: [
    { day: 'Mon', fullDay: 'Monday', hours: 2.5, pomodoros: 4, label: '2h 30m' },
    { day: 'Tue', fullDay: 'Tuesday', hours: 3.0, pomodoros: 5, label: '3h 00m' },
    { day: 'Wed', fullDay: 'Wednesday', hours: 4.0, pomodoros: 6, label: '4h 00m' },
    { day: 'Thu', fullDay: 'Thursday', hours: 2.8, pomodoros: 4, label: '2h 50m' },
    { day: 'Fri', fullDay: 'Friday', hours: 3.5, pomodoros: 5, label: '3h 30m' },
    { day: 'Sat', fullDay: 'Saturday', hours: 1.5, pomodoros: 2, label: '1h 30m' },
    { day: 'Sun', fullDay: 'Sunday', hours: 1.2, pomodoros: 2, label: '1h 15m' },
  ],
  subjectBreakdown: [
    { subject: 'Data Structures & Algorithms', percentage: 45, hours: '8h 20m', color: 'bg-indigo-500' },
    { subject: 'Operating Systems', percentage: 25, hours: '4h 40m', color: 'bg-purple-500' },
    { subject: 'Database Management', percentage: 20, hours: '3h 45m', color: 'bg-emerald-500' },
    { subject: 'Web Development', percentage: 10, hours: '1h 45m', color: 'bg-amber-500' },
  ],
}
