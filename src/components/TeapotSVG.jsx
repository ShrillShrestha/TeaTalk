export default function TeapotSVG({ w = 80, h = 48, themed = false, cups = true, className }) {
  const body = themed ? 'var(--accent)'      : '#c8694a';
  const trim = themed ? 'var(--accent-dark)' : '#b85b3e';

  return (
    <svg viewBox="0 0 80 48" width={w} height={h} className={className} style={{ display: 'block', overflow: 'visible' }}>
      <path d="M16 18 q-9 0 -9 9 q0 9 9 9" stroke="#b85b3e" strokeWidth="3.6" fill="none" strokeLinecap="round" />
      <ellipse cx="30" cy="28" rx="15" ry="12" fill={body} />
      <polygon points="43,20 58,11 47,28" fill={body} />
      <ellipse cx="30" cy="16" rx="9" ry="3" fill={trim} />
      <circle cx="30" cy="11.6" r="2.4" fill={trim} />
      {cups && (
        <>
          <polygon points="55,34 65,34 63,45 57,45" fill="#d98b6a" />
          <ellipse cx="60" cy="34" rx="5" ry="1.5" fill="#c8694a" />
          <polygon points="64,36 73,36 71.4,45 65.6,45" fill="#d98b6a" />
          <ellipse cx="68.5" cy="36" rx="4.4" ry="1.3" fill="#c8694a" />
        </>
      )}
    </svg>
  );
}
