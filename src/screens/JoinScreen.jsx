import TeapotSVG from '../components/TeapotSVG';
import NameInput from '../components/NameInput';
import styles from './JoinScreen.module.css';

export default function JoinScreen({ hostName, guestInput, setGuestInput, onSubmit }) {
  return (
    <div className={styles.screen}>
      <TeapotSVG w={104} h={62} />
      <div className={styles.spacer} />
      <h1 className={styles.heading}>
        <strong className={styles.headingAccent}>{hostName}</strong> poured you a cup.
      </h1>
      <p className={styles.body}>
        Add your name and join the table for a round of TeaTalk.
      </p>

      <NameInput value={guestInput} onChange={setGuestInput} onEnter={onSubmit} placeholder="e.g. Sam" />

      <button className="cta-btn" onClick={onSubmit} disabled={!guestInput.trim()}>
        Join the table →
      </button>
    </div>
  );
}
