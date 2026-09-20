export const VIBES = [
  { id: 'great',    emoji: '😄', label: 'Amazing',       hover: "Look at you, glowing like you just found $20 on the ground.", picked: "Bring that energy to the table — literally." },
  { id: 'chill',    emoji: '😌', label: 'Chill',         hover: "Zen mode. Probably haven't checked your phone in an hour.",   picked: "Nice and easy. This should go smoothly." },
  { id: 'meh',      emoji: '😅', label: 'Meh',           hover: "Ah, the classic 'fine, I guess' face. We've all been there.", picked: "Fair enough. Let's turn that around." },
  { id: 'tired',    emoji: '😩', label: 'Exhausted',     hover: "Rough day, rough week, or rough year? No judgment here.",     picked: "Noted. We'll keep it light-ish for you." },
  { id: 'chaotic',  emoji: '🙃', label: 'Chaotic',       hover: "Unhinged and proud of it. Respect the chaos.",                picked: "Buckle up — this round's about to match your energy." },
  { id: 'caffeine', emoji: '☕', label: 'Need caffeine', hover: "Bold of you to show up without coffee in hand.",              picked: "Go grab that coffee. We'll wait. Okay, not really — let's go." },
];

export const EXCITEMENT = [
  { id: 'hyped',  emoji: '🤩', label: 'Very excited',       hover: "Someone's already rehearsing their answers.",            picked: "Save some of that energy for the actual cards." },
  { id: 'meh2',   emoji: '🫠', label: "Don't care",         hover: "Melting into the couch levels of enthusiasm. Noted.",    picked: "We'll try to change your mind, no promises." },
  { id: 'forced', emoji: '😩', label: 'Forced to play',     hover: "Someone's forcing me to play. Send help!",               picked: "Noted, hostage. We'll make it quick-ish." },
  { id: 'unsure', emoji: '🤔', label: "Not sure, let's see", hover: "Reserving judgment until further notice.",              picked: "Fair. Let the cards do the convincing." },
];

export const HATE_LEVELS = [
  { level: 1, emoji: '😇', label: 'Zero hate',        message: "Aww. This is borderline concerning levels of fondness." },
  { level: 2, emoji: '😐', label: 'Barely anything',  message: "A little side-eye, nothing that won't survive today." },
  { level: 3, emoji: '😒', label: 'Some tension',     message: "Ah, the classic 'I like you but also you're annoying' zone." },
  { level: 4, emoji: '😤', label: 'Pretty riled up',  message: "Okay, someone owes someone an apology after this round." },
  { level: 5, emoji: '🤬', label: 'Maximum hate',     message: "Wow. The cards better come with a peace treaty." },
];

export const FACTS = [
  "Do you know your smile is more contagious than COVID - and might actually have a higher fatality rate? ☠️",
  "I heard Cadbury Dairy Milk makes you happy. I'd like to apply for the same job. 🫣",
  "I googled 'queen of England' and it just showed me your picture. 👸",
];

export const FACT_INTERVAL_MS = 5000;

export function findVibe(id) {
  return VIBES.find(v => v.id === id) ?? null;
}

export function findExcite(id) {
  return EXCITEMENT.find(v => v.id === id) ?? null;
}

export function findHate(level) {
  return HATE_LEVELS.find(h => h.level === level) ?? null;
}
