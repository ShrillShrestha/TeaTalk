// A single deck, played start to finish in this exact order — no shuffle,
// no selection screen.
export const DECK = {
  id: 'teatalk',
  name: 'TeaTalk',
  glyph: '✦',
  questions: [
    "How would your close friends describe you?",
    "What is your morning routine?",
    "What's your favorite day of the week and why?",
    "What does a perfect day look like for you?",
    "Three things about yourself that you love",
    "What do you miss the most about Nepal?",
    "What's your favorite childhood memory?",
    "What makes you happy?",
    "What were your dreams as a child?",
    "What does love mean to you?",
    "What part of yourself do you think most people don't see?",
    "What is something you are passionate about but don't often get to talk about?",
    "What does a healthy relationship look like to you?",
    "How do you prefer to resolve conflicts?",
    "Do you think we will be able to connect better if we were in the same place?",
    "Are you proud of yourself?",
    "Is it better to be kind or truthful?",
    "What was your first impression of me? Did it change? If yes, why?",
  ],
};

// Positions 0..n-1 in order. Kept as an explicit list so the room still stores
// the running order, the way the play screen expects.
export function deckOrder() {
  return Array.from({ length: DECK.questions.length }, (_, i) => i);
}
