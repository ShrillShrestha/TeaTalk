import styles from './DoneScreen.module.css';

export default function DoneScreen({ hostName, guestName, answeredTotal, onReplay, onBackToDeck }) {
  return (
    <div className={styles.screen}>
      <div className={styles.icon}>♥</div>
      <h1 className={styles.heading}>That's the whole pot.</h1>
      <p className={styles.body}>
        {hostName} &amp; {guestName}, you answered {answeredTotal} question{answeredTotal !== 1 ? 's' : ''} together. Hope the tea's still warm.
      </p>
      <div className={styles.actions}>
        <button className={styles.replayBtn} onClick={onReplay}>Shuffle this deck again</button>
        <button className={`ghost-btn ${styles.backBtn}`} onClick={onBackToDeck}>Choose another deck</button>
      </div>
    </div>
  );
}
