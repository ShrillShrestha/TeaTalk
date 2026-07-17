import styles from './InviteScreen.module.css';

export default function InviteScreen({ hostName, link, copied, onCopy }) {
  return (
    <div className={styles.screen}>
      <div className={styles.eyebrow}>The kettle's on</div>
      <h1 className={styles.heading}>Your table is set, {hostName}.</h1>
      <p className={styles.body}>
        Send this link to your guest. Once they join, you'll both move to deck selection automatically.
      </p>

      <div className={styles.linkRow}>
        <span className={styles.linkText}>{link}</span>
        <button className="copy-btn" onClick={onCopy}>
          {copied ? 'Copied ✓' : 'Copy link'}
        </button>
      </div>

      <div className={styles.waitingRow}>
        <span className={styles.waitingDot} />
        Waiting for your guest to join…
      </div>
    </div>
  );
}
