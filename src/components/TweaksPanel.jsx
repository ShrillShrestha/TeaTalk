export default function TweaksPanel({ palette, corners, texture, onPalette, onCorners, onTexture, accent }) {
  return (
    <div className="tweaks-panel">
      <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#a8967c', marginBottom: '14px' }}>
        Feel
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <span style={{ fontSize: '13.5px', color: '#5c4f3d', fontWeight: 500 }}>Palette</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['Clay', 'Dusk', 'Sage'].map(p => (
              <button key={p} className="tweak-chip" onClick={() => onPalette(p)}
                style={{ background: palette === p ? accent : 'rgba(140,120,95,.15)', color: palette === p ? '#fff' : '#7a6c58' }}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <span style={{ fontSize: '13.5px', color: '#5c4f3d', fontWeight: 500 }}>Corners</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['Pillowy', 'Crisp'].map(c => (
              <button key={c} className="tweak-chip" onClick={() => onCorners(c)}
                style={{ background: corners === c ? accent : 'rgba(140,120,95,.15)', color: corners === c ? '#fff' : '#7a6c58' }}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <span style={{ fontSize: '13.5px', color: '#5c4f3d', fontWeight: 500 }}>Texture</span>
          <button className="tweak-chip" onClick={() => onTexture(!texture)}
            style={{ background: texture ? accent : 'rgba(140,120,95,.15)', color: texture ? '#fff' : '#7a6c58' }}>
            {texture ? 'On' : 'Off'}
          </button>
        </div>
      </div>
    </div>
  );
}
