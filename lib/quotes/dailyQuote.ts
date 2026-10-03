/**
 * Deterministic daily motivational quote system for StudySpace.
 *
 * Uses a stable date-hash (FNV-1a inspired) so:
 * - Every refresh on the same calendar day returns the exact same quote.
 * - Different days return different quotes cycling through the full library.
 * - No external dependency or database call is needed.
 *
 * Quote selection: `index = fnv32a(dateStr) % QUOTES.length`
 */

export interface DailyQuote {
  text: string
  author: string
}

/** 60 curated, concise, student-focused study & productivity quotes. */
export const DAILY_QUOTES: DailyQuote[] = [
  { text: 'Small daily improvements lead to stunning long-term results.', author: 'Robin Sharma' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: "You don't have to be great to start, but you have to start to be great.", author: 'Zig Ziglar' },
  { text: 'Consistency is the key that unlocks the door to excellence.', author: 'Unknown' },
  { text: 'Your future is created by what you do today, not tomorrow.', author: 'Robert T. Kiyosaki' },
  { text: 'Study while others are sleeping; work while others are loafing; prepare while others are playing.', author: 'William A. Ward' },
  { text: 'Education is not the filling of a pail, but the lighting of a fire.', author: 'W.B. Yeats' },
  { text: 'The more that you read, the more things you will know.', author: 'Dr. Seuss' },
  { text: 'A goal without a plan is just a wish.', author: 'Antoine de Saint-Exupery' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'Focus on progress, not perfection.', author: 'Unknown' },
  { text: "Don't watch the clock; do what it does. Keep going.", author: 'Sam Levenson' },
  { text: 'The expert in anything was once a beginner.', author: 'Helen Hayes' },
  { text: 'Strive for progress, not perfection.', author: 'Unknown' },
  { text: 'Hard work beats talent when talent does not work hard.', author: 'Tim Notke' },
  { text: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'You are capable of more than you know. Choose a goal that seems right for you and strive to be the best.', author: 'E.O. Wilson' },
  { text: 'Believe you can and you are halfway there.', author: 'Theodore Roosevelt' },
  { text: 'Everything you need is already inside you. Get started.', author: 'Unknown' },
  { text: 'One hour of focused study beats three hours of distracted study.', author: 'Unknown' },
  { text: 'Learning is a treasure that will follow its owner everywhere.', author: 'Chinese Proverb' },
  { text: 'The roots of education are bitter, but the fruit is sweet.', author: 'Aristotle' },
  { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Augusta F. Kantra' },
  { text: "Don't limit your challenges. Challenge your limits.", author: 'Unknown' },
  { text: 'The best preparation for tomorrow is doing your best today.', author: 'H. Jackson Brown Jr.' },
  { text: 'Push yourself because no one else is going to do it for you.', author: 'Unknown' },
  { text: 'Some people want it to happen, some wish it would happen, others make it happen.', author: 'Michael Jordan' },
  { text: 'I find that the harder I work, the more luck I seem to have.', author: 'Thomas Jefferson' },
  { text: 'What separates the talented individual from the successful one is a lot of hard work.', author: 'Stephen King' },
  { text: 'Be not afraid of going slowly; be afraid only of standing still.', author: 'Chinese Proverb' },
  { text: 'What seems hard now will one day be your warm-up.', author: 'Unknown' },
  { text: "You've got to get up every morning with determination if you're going to go to bed with satisfaction.", author: 'George Lorimer' },
  { text: 'Education is the most powerful weapon which you can use to change the world.', author: 'Nelson Mandela' },
  { text: 'Stay positive, work hard, make it happen.', author: 'Unknown' },
  { text: 'You are braver than you believe, stronger than you seem, and smarter than you think.', author: 'A.A. Milne' },
  { text: 'Every strike brings me closer to the next home run.', author: 'Babe Ruth' },
  { text: 'Failure is simply the opportunity to begin again, this time more intelligently.', author: 'Henry Ford' },
  { text: 'Aim for the moon. If you miss, you may hit a star.', author: 'W. Clement Stone' },
  { text: 'The difference between ordinary and extraordinary is that little extra.', author: 'Jimmy Johnson' },
  { text: "Don't stop when you're tired. Stop when you're done.", author: 'Unknown' },
  { text: 'You learn more from failure than from success. Do not let it stop you.', author: 'Unknown' },
  { text: 'Knowledge is power. Use it to do good.', author: 'Veronica Roth' },
  { text: 'Amateurs sit and wait for inspiration, the rest of us just get up and go to work.', author: 'Stephen King' },
  { text: 'There is no substitute for hard work.', author: 'Thomas A. Edison' },
  { text: 'Always do your best. What you plant now, you will harvest later.', author: 'Og Mandino' },
  { text: 'I am not a product of my circumstances. I am a product of my decisions.', author: 'Stephen Covey' },
  { text: 'Motivation gets you going, but discipline keeps you growing.', author: 'John C. Maxwell' },
  { text: 'Do something today that your future self will thank you for.', author: 'Sean Patrick Flanery' },
  { text: 'Dream big. Start small. Act now.', author: 'Robin Sharma' },
  { text: 'Do not wish for it. Work for it.', author: 'Unknown' },
  { text: 'The pain of discipline is far less than the pain of regret.', author: 'Unknown' },
  { text: 'Every day is a new beginning. Take a deep breath and start again.', author: 'Unknown' },
  { text: "It always seems impossible until it's done.", author: 'Nelson Mandela' },
  { text: 'Your only limit is you.', author: 'Unknown' },
  { text: 'Develop a passion for learning. If you do, you will never cease to grow.', author: "Anthony J. D'Angelo" },
  { text: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
  { text: 'If you can dream it, you can do it.', author: 'Walt Disney' },
  { text: 'Keep going. Everything you need will come to you at the perfect time.', author: 'Unknown' },
  { text: 'The harder the struggle, the more glorious the triumph.', author: 'Unknown' },
  { text: 'Show up, work hard, be kind, and amazing things will happen.', author: "Conan O'Brien" },
]

/**
 * Fast, deterministic string hash (FNV-1a 32-bit variant).
 * Produces the same integer for the same input every time.
 */
function fnv32a(str: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = (Math.imul(hash, 16777619) >>> 0)
  }
  return hash
}

/**
 * Returns the deterministic daily quote for a given date string (e.g. "2026-09-22").
 * Same date always returns the same quote; no randomness; no DB dependency.
 *
 * @param dateStr - ISO date string in YYYY-MM-DD format (e.g. attendanceData.todayDate)
 */
export function getDailyQuote(dateStr: string): DailyQuote {
  if (!dateStr || typeof dateStr !== 'string') {
    return DAILY_QUOTES[0]
  }
  const index = fnv32a(dateStr) % DAILY_QUOTES.length
  return DAILY_QUOTES[index]
}
