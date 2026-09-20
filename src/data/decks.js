// A single deck, played start to finish in this exact order — no shuffle,
// no selection screen.
export const DECK = {
  id: 'teatalk',
  name: 'TeaTalk',
  glyph: '✦',
  questions: [
    "What's your morning routine?",
    "What's your favorite day of the week and why?",
    "What makes you happy?",
    "What's your favorite childhood memory?",
    "What were your dreams as a child?",
    "What do you miss the most about Nepal?",
    "Three things about yourself that you love",
    "How would your close friends describe you?",
    "What part of yourself do you think most people don't see?",
    "Are you proud of yourself?",
    "What is something you are passionate about but don't often get to talk about?",
    "What does love mean to you?",
    "Is it better to be kind or truthful?",
    "What does a healthy relationship look like to you?",
    "How do you prefer to resolve conflicts?",
    "Do you think we would have been able to connect better if we were in the same place?",
    "What was your first impression of me? Did it change?"
  ],
};

// Positions 0..n-1 in order. Kept as an explicit list so the room still stores
// the running order, the way the play screen expects.
export function deckOrder() {
  return Array.from({ length: DECK.questions.length }, (_, i) => i);
}
