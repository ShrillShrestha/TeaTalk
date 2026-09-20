import styles from './DoneScreen.module.css';

export default function DoneScreen() {
  return (
    <div className={styles.screen}>
      <div className={styles.icon}>🙌</div>
      <h1 className={styles.heading}>That's the whole pot.</h1>
    </div>
  );
}
