import styles from './Curtain.module.css';

// A warm wash that irises over the screen while the next one is swapped in
// behind it, so the change never reads as a hard cut. Driven by useRoom's
// curtain state: 'closing' covers, 'opening' clears, 'idle' is out of the way.
export default function Curtain({ state }) {
  if (state === 'idle') return null;

  return (
    <div className={`${styles.curtain} ${state === 'closing' ? styles.closing : styles.opening}`}>
      <div className={styles.typing}>
        <span className={styles.dot} />
        <span className={styles.dotB} />
        <span className={styles.dotC} />
      </div>
    </div>
  );
}
