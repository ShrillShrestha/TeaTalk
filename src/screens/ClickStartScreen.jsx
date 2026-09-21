import clickImg from '../../imgs/click.gif';
import styles from './ClickStartScreen.module.css';

export default function ClickStartScreen({ onStart }) {
  return (
    <div className={styles.screen} onClick={onStart}>
      <img className={styles.art} src={clickImg} alt="Click to start" />
      <div className={styles.label}>CLICK TO START</div>
    </div>
  );
}
