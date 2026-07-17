import TeapotSVG from '../components/TeapotSVG';
import NameInput from '../components/NameInput';
import styles from './HostScreen.module.css';

export default function HostScreen({ hostInput, setHostInput, onSubmit }) {
  return (
    <div className={styles.screen}>
      <div className={styles.logoWrap}>
        <div className={styles.steam}>
          <span className={styles.steamPuff} />
          <span className={styles.steamPuffDelayed} />
        </div>
        <TeapotSVG w={120} h={72} />
      </div>

      <h1 className={styles.heading}>
        A few questions.<br />
        <em className={styles.headingAccent}>A better conversation.</em>
      </h1>
      <p className={styles.body}>
        Take turns drawing a card and answering out loud — together, on your own two phones. No typing, no scores. Just the questions that get you talking.
      </p>

      <NameInput value={hostInput} onChange={setHostInput} onEnter={onSubmit} placeholder="e.g. Maya" />

      <button className="cta-btn" onClick={onSubmit} disabled={!hostInput.trim()}>
        Brew an invite →
      </button>
      <p className={styles.footnote}>
        You'll get a link to send to whoever you're sharing a pot of tea with.
      </p>
    </div>
  );
}
