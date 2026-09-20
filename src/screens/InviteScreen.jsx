import { findVibe, findExcite, findHate } from '../data/survey';
import styles from './InviteScreen.module.css';

export default function InviteScreen({ hostName, link, copied, onCopy, guestName, guestJoined, survey }) {
  return (
    <div className={styles.screen}>
      <div className={styles.eyebrow}>The kettle's on</div>
      <h1 className={styles.heading}>Your table is set, {hostName}.</h1>
      <p className={styles.body}>
        Send this link to your guest. Once they're settled, the first card turns over for both of you automatically.
      </p>

      <div className={styles.linkRow}>
        <span className={styles.linkText}>{link}</span>
        <button className="copy-btn" onClick={onCopy}>
          {copied ? 'Copied ✓' : 'Copy link'}
        </button>
      </div>

      <div className={styles.waitingRow}>
        <span className={styles.waitingDot} />
        {guestJoined
          ? `${guestName} is getting settled…`
          : 'Waiting for your guest to join…'}
      </div>

      {guestJoined && <SurveyPeek guestName={guestName} survey={survey} />}
    </div>
  );
}

// The guest's vibe-check answers land here one at a time while the host waits.
function SurveyPeek({ guestName, survey }) {
  const vibe   = findVibe(survey?.vibe);
  const excite = findExcite(survey?.excite);
  const hate   = survey?.hate ? findHate(survey.hate) : null;

  if (!vibe && !excite && !hate) return null;

  return (
    <div className={styles.peek}>
      <div className={styles.peekTitle}>{guestName}'s vibe check</div>
      {vibe   && <div className={styles.peekRow}><span>{vibe.emoji}</span> Feeling {vibe.label.toLowerCase()}</div>}
      {excite && <div className={styles.peekRow}><span>{excite.emoji}</span> {excite.label}</div>}
      {hate   && <div className={styles.peekRow}><span>{hate.emoji}</span> {hate.label}</div>}
    </div>
  );
}
