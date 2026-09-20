import TeapotSVG from '../components/TeapotSVG';
import styles from './VibeCheckScreen.module.css';

export default function VibeCheckScreen({ hostName, guestName, onContinue }) {
  return (
    <div className={styles.screen}>
      <div className={styles.logoWrap}>
        <div className={styles.steam}>
          <span className={styles.steamPuff} />
          <span className={styles.steamPuffDelayed} />
        </div>
        <TeapotSVG w={96} h={58} themed cups={false} />
      </div>

      <div className={styles.eyebrow}>{hostName} &amp; {guestName} are at the table</div>
      <h1 className={styles.heading}>
        Let's check the vibe first<em className={styles.headingAccent}>.</em>
      </h1>
      <p className={styles.body}>
        One quick question before the cards come out — no wrong answers, promise.
      </p>

      <button className="cta-btn" onClick={onContinue}>Okay, let's do it →</button>
    </div>
  );
}
