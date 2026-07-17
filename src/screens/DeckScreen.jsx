import { DECKS } from '../data/decks';
import styles from './DeckScreen.module.css';

export default function DeckScreen({ theme, hostName, guestName, onSelect }) {
  return (
    <div className={styles.screen}>
      <div className={styles.nameplate}>
        <div className={styles.nameplateNames}>
          <span>{hostName}</span>
          <span className={styles.nameplateAmpersand}>&amp;</span>
          <span>{guestName}</span>
        </div>
        <p className={styles.nameplateBody}>
          Choose a deck together — talk it over and tap when you agree.
        </p>
      </div>

      <div className={styles.deckList}>
        {DECKS.map(deck => {
          const colors = theme.decks[deck.id];
          return (
            <button
              key={deck.id}
              className={`card-btn ${styles.deckCard}`}
              style={{ '--deck-bg': colors.bg, '--deck-dot': colors.dot }}
              onClick={() => onSelect(deck.id)}
            >
              <div className={styles.deckIcon}>{deck.glyph}</div>
              <div className={styles.deckInfo}>
                <div className={styles.deckName}>{deck.name}</div>
                <div className={styles.deckBlurb}>{deck.blurb}</div>
              </div>
              <div className={styles.deckCount}>{deck.questions.length} cards</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
