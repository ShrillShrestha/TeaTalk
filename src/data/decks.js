export const DECKS = [
  {
    id: 'friends',
    name: 'Friends & Strangers',
    glyph: '✦',
    blurb: 'From first hello to the deep stuff.',
    questions: [
      "What brought you here today?",
      "What's something that made you smile this week?",
      "How do you like to spend a free weekend?",
      "What's a topic you could talk about for hours?",
      "What did you want to be when you were a kid?",
      "What's the best place you've ever traveled to?",
      "What's something you've changed your mind about recently?",
      "When do you feel most like yourself?",
      "What do you value most in a friendship?",
      "What's something you're proud of but rarely mention?",
      "What's a fear you've slowly grown out of?",
      "What does home mean to you?",
      "What do you wish people understood about you sooner?",
      "When did you last feel really seen by someone?",
    ],
  },
  {
    id: 'love',
    name: 'Love & Dating',
    glyph: '♥',
    blurb: 'For two hearts feeling it out.',
    questions: [
      "What first draws you to someone?",
      "What does a perfect date look like to you?",
      "How do you know when you really trust someone?",
      "What's your love language — giving and receiving?",
      "What's a relationship lesson you learned the hard way?",
      "What makes you feel most cared for?",
      "What are you looking for in a partner right now?",
      "When did you last feel butterflies?",
      "What's a dealbreaker you won't budge on?",
      "How do you like to show someone you like them?",
      "What does commitment mean to you?",
      "What's something you've wanted to say on a date but never did?",
    ],
  },
];

export function shuffle(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
