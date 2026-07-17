import styles from './TweaksPanel.module.css';

export default function TweaksPanel({ palette, corners, texture, onPalette, onCorners, onTexture }) {
  const chip = active => `tweak-chip ${active ? styles.chipActive : styles.chipInactive}`;

  return (
    <div className="tweaks-panel">
      <div className={styles.panelHeader}>Feel</div>
      <div className={styles.rows}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Palette</span>
          <div className={styles.chips}>
            {['Clay', 'Dusk', 'Sage'].map(p => (
              <button key={p} className={chip(palette === p)} onClick={() => onPalette(p)}>{p}</button>
            ))}
          </div>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Corners</span>
          <div className={styles.chips}>
            {['Pillowy', 'Crisp'].map(c => (
              <button key={c} className={chip(corners === c)} onClick={() => onCorners(c)}>{c}</button>
            ))}
          </div>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Texture</span>
          <button className={chip(texture)} onClick={() => onTexture(!texture)}>
            {texture ? 'On' : 'Off'}
          </button>
        </div>
      </div>
    </div>
  );
}
