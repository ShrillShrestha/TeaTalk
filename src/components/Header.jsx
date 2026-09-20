import TeapotSVG from './TeapotSVG';
import styles from './Header.module.css';

const SCREEN_ACTIONS = {
  invite: { label: 'Start over',  actionKey: 'goHome'     },
  play:   { label: 'End session', actionKey: 'endSession' },
};

export default function Header({ screen, showTweaks, onToggleTweaks, actions }) {
  const screenAction = SCREEN_ACTIONS[screen];

  return (
    <div className={styles.header}>
      <div className={styles.logo} onClick={actions.goHome}>
        <TeapotSVG w={34} h={20} />
        <span className={styles.logoText}>TeaTalk</span>
      </div>

      <div className={styles.actions}>
        {screenAction && (
          <button className="header-btn" onClick={actions[screenAction.actionKey]}>
            {screenAction.label}
          </button>
        )}
        <button
          className={`header-btn ${showTweaks ? styles.tweaksBtnActive : ''}`}
          onClick={onToggleTweaks}
          title="Feel"
        >
          ✦
        </button>
      </div>
    </div>
  );
}
