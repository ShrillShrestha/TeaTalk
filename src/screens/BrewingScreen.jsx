import TeapotSVG from '../components/TeapotSVG';
import { FACTS } from '../data/survey';
import styles from './BrewingScreen.module.css';

export default function BrewingScreen({ factIndex }) {
  return (
    <div className={styles.screen}>
      <div className={styles.logoWrap}>
        <div className={styles.steam}>
          <span className={styles.steamPuff} />
          <span className={styles.steamPuffDelayed} />
        </div>
        <TeapotSVG w={88} h={53} themed cups={false} className={styles.teapot} />
      </div>

      <div className={styles.title}>Brewing game...</div>
      <div className={styles.eyebrow}>playing some fun facts</div>

      <div key={factIndex} className={styles.factSlot}>
        <p className={styles.fact}>{FACTS[factIndex] ?? FACTS[0]}</p>
      </div>

      <div className={styles.dots}>
        {FACTS.map((_, i) => (
          <span
            key={i}
            className={styles.dot}
            style={{ opacity: i === factIndex ? 1 : 0.25 }}
          />
        ))}
      </div>
    </div>
  );
}
