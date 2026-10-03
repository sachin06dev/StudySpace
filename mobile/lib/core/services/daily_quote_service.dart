/// Deterministic daily motivational quote service for StudySpace Mobile.
///
/// Uses FNV-1a 32-bit hash on the date string to produce the same quote
/// for the same calendar day on every app open, matching the web dashboard.
library;

class DailyQuote {
  final String text;
  final String author;
  const DailyQuote(this.text, this.author);
}

/// 60 curated, concise, student-focused quotes — identical list to web's dailyQuote.ts.
const List<DailyQuote> _kQuotes = [
  DailyQuote('Small daily improvements lead to stunning long-term results.', 'Robin Sharma'),
  DailyQuote('The secret of getting ahead is getting started.', 'Mark Twain'),
  DailyQuote("You don't have to be great to start, but you have to start to be great.", 'Zig Ziglar'),
  DailyQuote('Consistency is the key that unlocks the door to excellence.', 'Unknown'),
  DailyQuote('Your future is created by what you do today, not tomorrow.', 'Robert T. Kiyosaki'),
  DailyQuote('Study while others are sleeping; work while others are loafing; prepare while others are playing.', 'William A. Ward'),
  DailyQuote('Education is not the filling of a pail, but the lighting of a fire.', 'W.B. Yeats'),
  DailyQuote('The more that you read, the more things you will know.', 'Dr. Seuss'),
  DailyQuote('A goal without a plan is just a wish.', 'Antoine de Saint-Exupery'),
  DailyQuote('It does not matter how slowly you go as long as you do not stop.', 'Confucius'),
  DailyQuote('Focus on progress, not perfection.', 'Unknown'),
  DailyQuote("Don't watch the clock; do what it does. Keep going.", 'Sam Levenson'),
  DailyQuote('The expert in anything was once a beginner.', 'Helen Hayes'),
  DailyQuote('Strive for progress, not perfection.', 'Unknown'),
  DailyQuote('Hard work beats talent when talent does not work hard.', 'Tim Notke'),
  DailyQuote('Success is the sum of small efforts repeated day in and day out.', 'Robert Collier'),
  DailyQuote('The only way to do great work is to love what you do.', 'Steve Jobs'),
  DailyQuote('You are capable of more than you know. Choose a goal that seems right for you and strive to be the best.', 'E.O. Wilson'),
  DailyQuote('Believe you can and you are halfway there.', 'Theodore Roosevelt'),
  DailyQuote('Everything you need is already inside you. Get started.', 'Unknown'),
  DailyQuote('One hour of focused study beats three hours of distracted study.', 'Unknown'),
  DailyQuote('Learning is a treasure that will follow its owner everywhere.', 'Chinese Proverb'),
  DailyQuote('The roots of education are bitter, but the fruit is sweet.', 'Aristotle'),
  DailyQuote('Discipline is choosing between what you want now and what you want most.', 'Augusta F. Kantra'),
  DailyQuote("Don't limit your challenges. Challenge your limits.", 'Unknown'),
  DailyQuote('The best preparation for tomorrow is doing your best today.', 'H. Jackson Brown Jr.'),
  DailyQuote('Push yourself because no one else is going to do it for you.', 'Unknown'),
  DailyQuote('Some people want it to happen, some wish it would happen, others make it happen.', 'Michael Jordan'),
  DailyQuote('I find that the harder I work, the more luck I seem to have.', 'Thomas Jefferson'),
  DailyQuote('What separates the talented individual from the successful one is a lot of hard work.', 'Stephen King'),
  DailyQuote('Be not afraid of going slowly; be afraid only of standing still.', 'Chinese Proverb'),
  DailyQuote('What seems hard now will one day be your warm-up.', 'Unknown'),
  DailyQuote("You've got to get up every morning with determination if you're going to go to bed with satisfaction.", 'George Lorimer'),
  DailyQuote('Education is the most powerful weapon which you can use to change the world.', 'Nelson Mandela'),
  DailyQuote('Stay positive, work hard, make it happen.', 'Unknown'),
  DailyQuote('You are braver than you believe, stronger than you seem, and smarter than you think.', 'A.A. Milne'),
  DailyQuote('Every strike brings me closer to the next home run.', 'Babe Ruth'),
  DailyQuote('Failure is simply the opportunity to begin again, this time more intelligently.', 'Henry Ford'),
  DailyQuote('Aim for the moon. If you miss, you may hit a star.', 'W. Clement Stone'),
  DailyQuote('The difference between ordinary and extraordinary is that little extra.', 'Jimmy Johnson'),
  DailyQuote("Don't stop when you're tired. Stop when you're done.", 'Unknown'),
  DailyQuote('You learn more from failure than from success. Do not let it stop you.', 'Unknown'),
  DailyQuote('Knowledge is power. Use it to do good.', 'Veronica Roth'),
  DailyQuote('Amateurs sit and wait for inspiration, the rest of us just get up and go to work.', 'Stephen King'),
  DailyQuote('There is no substitute for hard work.', 'Thomas A. Edison'),
  DailyQuote('Always do your best. What you plant now, you will harvest later.', 'Og Mandino'),
  DailyQuote('I am not a product of my circumstances. I am a product of my decisions.', 'Stephen Covey'),
  DailyQuote('Motivation gets you going, but discipline keeps you growing.', 'John C. Maxwell'),
  DailyQuote('Do something today that your future self will thank you for.', 'Sean Patrick Flanery'),
  DailyQuote('Dream big. Start small. Act now.', 'Robin Sharma'),
  DailyQuote('Do not wish for it. Work for it.', 'Unknown'),
  DailyQuote('The pain of discipline is far less than the pain of regret.', 'Unknown'),
  DailyQuote('Every day is a new beginning. Take a deep breath and start again.', 'Unknown'),
  DailyQuote("It always seems impossible until it's done.", 'Nelson Mandela'),
  DailyQuote('Your only limit is you.', 'Unknown'),
  DailyQuote('Develop a passion for learning. If you do, you will never cease to grow.', "Anthony J. D'Angelo"),
  DailyQuote('Action is the foundational key to all success.', 'Pablo Picasso'),
  DailyQuote('If you can dream it, you can do it.', 'Walt Disney'),
  DailyQuote('Keep going. Everything you need will come to you at the perfect time.', 'Unknown'),
  DailyQuote('The harder the struggle, the more glorious the triumph.', 'Unknown'),
  DailyQuote('Show up, work hard, be kind, and amazing things will happen.', "Conan O'Brien"),
];

/// FNV-1a 32-bit hash — same algorithm as the web's dailyQuote.ts.
int _fnv32a(String str) {
  var hash = 0x811c9dc5;
  for (var i = 0; i < str.length; i++) {
    hash ^= str.codeUnitAt(i);
    // Emulate 32-bit unsigned multiplication (FNV prime = 16777619)
    // Using BigInt to avoid Dart integer overflow, then truncate to 32 bits.
    hash = ((BigInt.from(hash) * BigInt.from(16777619)) & BigInt.from(0xFFFFFFFF)).toInt();
  }
  return hash;
}

class DailyQuoteService {
  DailyQuoteService._();

  static final DailyQuoteService instance = DailyQuoteService._();

  /// Returns the deterministic daily quote for today.
  /// Matches the web dashboard's getDailyQuote(todayDate) output exactly.
  DailyQuote getQuote() {
    final now = DateTime.now();
    final dateStr =
        '${now.year.toString().padLeft(4, '0')}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
    return getQuoteForDate(dateStr);
  }

  /// Returns the deterministic daily quote for a specific date string (YYYY-MM-DD).
  DailyQuote getQuoteForDate(String dateStr) {
    if (dateStr.isEmpty) return _kQuotes[0];
    final index = _fnv32a(dateStr) % _kQuotes.length;
    return _kQuotes[index.abs()];
  }
}
