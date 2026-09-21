// A single deck, played start to finish in this exact order — no shuffle,
// no selection screen.
export const DECK = {
  id: 'teatalk',
  name: 'TeaTalk',
  glyph: '✦',
  questions: [
    "What's your favorite day of the week and why?",
    "What's your favorite childhood memory?",
    "What makes you happy?",
    "What do you miss the most about Nepal?",
    "Three things about yourself that you love",
    "What part of yourself do you think most people don't see?",
    "What is something you are passionate about but don't often get to talk about?",
    "Is it better to be kind or truthful?",
    "Are you proud of yourself?",
    "What was your first impression of me? Did it change?"
  ],
};

// Positions 0..n-1 in order. Kept as an explicit list so the room still stores
// the running order, the way the play screen expects.
export function deckOrder() {
  return Array.from({ length: DECK.questions.length }, (_, i) => i);
}
