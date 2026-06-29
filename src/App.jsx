import { useState, useEffect } from 'react';
import { ref, set, update, onValue, off } from 'firebase/database';
import { db } from './firebase';
import { THEMES } from './data/themes';
import { DECKS, shuffle } from './data/decks';
import TeapotSVG from './components/TeapotSVG';
import TweaksPanel from './components/TweaksPanel';

/*
  Screen derivation
  -----------------
  localScreen  'landing'  → host entry page (no room yet)
               'joining'  → guest is entering their name
               null       → room exists, screen driven by roomData.status

  roomData     undefined  → Firebase hasn't responded yet
               null       → room not found
               object     → { status: 'waiting'|'deck'|'play'|'done', ... }

  URL scheme
  ----------
  Host URL (after creating room):  #host=<roomId>   (never shared)
  Guest invite link:                #room=<roomId>   (what gets copied)
*/
export default function App() {
  // ── local / device state ─────────────────────────────────────────────────
  const [localScreen, setLocalScreen] = useState('landing'); // 'landing' | 'joining' | null
  const [role,        setRole]        = useState(null);       // 'host' | 'guest'
  const [roomId,      setRoomId]      = useState(null);
  const [roomData,    setRoomData]    = useState(undefined);  // undefined=loading, null=not found

  const [hostInput,  setHostInput]   = useState('');
  const [guestInput, setGuestInput]  = useState('');
  const [link,       setLink]        = useState('');
  const [copied,     setCopied]      = useState(false);
  const [flying,     setFlying]      = useState(false);

  // ── tweaks ────────────────────────────────────────────────────────────────
  const [palette,    setPalette]     = useState('Clay');
  const [corners,    setCorners]     = useState('Pillowy');
  const [texture,    setTexture]     = useState(true);
  const [showTweaks, setShowTweaks]  = useState(false);

  // ── parse URL hash on mount ───────────────────────────────────────────────
  useEffect(() => {
    const hash = (window.location.hash || '').replace(/^#/, '');
    const hostM  = hash.match(/^host=([^&]+)/);
    const guestM = hash.match(/^room=([^&]+)/);
    if (hostM) {
      setRoomId(hostM[1]);
      setRole('host');
      setLocalScreen(null);
    } else if (guestM) {
      setRoomId(guestM[1]);
      setRole('guest');
      setLocalScreen('joining');
    }
  }, []);

  // ── Firebase real-time listener ───────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;
    const roomRef = ref(db, `rooms/${roomId}`);
    const cb = (snap) => setRoomData(snap.val() ?? null);
    onValue(roomRef, cb);
    return () => off(roomRef, 'value', cb);
  }, [roomId]);

  // ── derive the current screen ─────────────────────────────────────────────
  const screen = (() => {
    if (localScreen === 'landing') return 'host';
    if (roomData === undefined)    return 'loading';
    if (roomData === null)         return 'not-found';
    if (localScreen === 'joining') return 'join';
    // localScreen is null — Firebase status drives everything
    if (roomData.status === 'waiting') return role === 'host' ? 'invite' : 'loading';
    return roomData.status; // 'deck' | 'play' | 'done'
  })();

  // ── shortcuts into Firebase data ──────────────────────────────────────────
  const hName   = roomData?.hostName  || 'Player 1';
  const gName   = roomData?.guestName || 'Player 2';
  const pos     = roomData?.pos       ?? 0;
  const flipped = roomData?.flipped   ?? false;
  const picker  = roomData?.picker    ?? 0;
  const answeredTotal = roomData?.answeredTotal ?? 0;
  // Firebase may return dense arrays as objects; convert back safely
  const rawOrder = roomData?.order ?? [];
  const order    = Array.isArray(rawOrder) ? rawOrder : Object.values(rawOrder);
  const deckId   = roomData?.deckId   ?? null;

  const pickerName = picker ? gName : hName;
  const otherName  = picker ? hName : gName;

  // ── theme / style ─────────────────────────────────────────────────────────
  const theme      = THEMES[palette] || THEMES.Clay;
  const cardRadius = corners === 'Crisp' ? '6px' : '24px';
  const curDeck    = DECKS.find(d => d.id === deckId);
  const dcol       = curDeck ? theme.decks[curDeck.id] : null;

  // ── actions ───────────────────────────────────────────────────────────────
  const createRoom = async () => {
    if (!hostInput.trim()) return;
    const rid  = Math.random().toString(36).slice(2, 8);
    await set(ref(db, `rooms/${rid}`), {
      hostName: hostInput.trim(),
      guestName: null,
      status: 'waiting',
      deckId: null,
      pos: 0,
      flipped: false,
      picker: 0,
      answeredTotal: 0,
      order: [],
    });
    const base = window.location.href.split('#')[0];
    setLink(base + '#room=' + rid);
    setRoomId(rid);
    setRole('host');
    setLocalScreen(null);
    setCopied(false);
    // Host URL keeps room alive across refreshes without sharing host view
    history.pushState(null, '', '#host=' + rid);
  };

  const copyLink = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1700); };
    try {
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(link).then(done, done);
      else done();
    } catch (_) { done(); }
  };

  const joinRoom = async () => {
    if (!guestInput.trim() || !roomId) return;
    await update(ref(db, `rooms/${roomId}`), {
      guestName: guestInput.trim(),
      status: 'deck',
    });
    setLocalScreen(null); // hand off to Firebase status
  };

  const startDeck = async (id) => {
    const deck = DECKS.find(d => d.id === id);
    await update(ref(db, `rooms/${roomId}`), {
      deckId: id,
      order: shuffle(deck.questions.length),
      status: 'play',
      pos: 0,
      flipped: false,
      picker: 0,
      answeredTotal: 0,
    });
  };

  const flip = async () => {
    if (!flipped) {
      await update(ref(db, `rooms/${roomId}`), { flipped: true });
    }
  };

  const advance = (counts) => {
    if (flying) return;
    const next        = pos + 1;
    const newAnswered = counts ? answeredTotal + 1 : answeredTotal;
    setFlying(true);
    setTimeout(async () => {
      if (next >= order.length) {
        await update(ref(db, `rooms/${roomId}`), { status: 'done', answeredTotal: newAnswered });
      } else {
        await update(ref(db, `rooms/${roomId}`), {
          pos: next,
          flipped: false,
          picker: picker ? 0 : 1,
          answeredTotal: newAnswered,
        });
      }
      setFlying(false);
    }, 360);
  };

  const goHome = () => {
    history.pushState(null, '', window.location.pathname + window.location.search);
    setLocalScreen('landing');
    setRoomId(null);
    setRole(null);
    setRoomData(undefined);
    setHostInput('');
    setGuestInput('');
    setLink('');
    setCopied(false);
    setFlying(false);
    setShowTweaks(false);
  };

  const backToDeck = async () => {
    await update(ref(db, `rooms/${roomId}`), { status: 'deck' });
  };

  const replay = () => startDeck(deckId);

  // ── header action button ──────────────────────────────────────────────────
  const headerCfg = {
    invite: { label: 'Start over',  fn: goHome     },
    play:   { label: 'End session', fn: backToDeck },
    done:   { label: 'End session', fn: backToDeck },
  };
  const hc = headerCfg[screen];

  // ── shared styles ─────────────────────────────────────────────────────────
  const ctaStyle = (disabled) => ({
    border: 'none',
    background: disabled ? '#cbb89c' : theme.accent,
    color: '#fff',
    fontFamily: 'inherit',
    fontWeight: 700,
    fontSize: '16px',
    padding: '15px 28px',
    borderRadius: '16px',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? .6 : 1,
    boxShadow: disabled ? 'none' : `0 10px 24px -12px ${theme.accentShadow}`,
    transition: 'background .15s ease',
  });

  const cardKey  = `${pos}-${flipped}`;
  const cardAnim = flying
    ? { '--fx': '-130%', '--fy': '-8%', '--fr': '-16deg', animation: 'flyoff .36s cubic-bezier(.4,0,.7,.3) forwards' }
    : { animation: 'rise .35s ease both' };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
      color: '#3a3026',
      background: theme.pageBg,
      padding: '24px 18px 36px',
      transition: 'background .4s ease',
    }}>

      {/* HEADER */}
      <div style={{ width: '100%', maxWidth: '460px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '18px' }}>
        <div onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer' }}>
          <TeapotSVG w={34} h={20} />
          <span style={{ fontFamily: "'Newsreader', serif", fontWeight: 500, fontSize: '19px', letterSpacing: '-.01em', color: '#3a3026' }}>TeaTalk</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          {hc && (
            <button className="header-btn" onClick={hc.fn} style={{
              border: 'none', background: 'rgba(255,255,255,.55)', color: '#8a7b66',
              fontFamily: 'inherit', fontWeight: 600, fontSize: '12.5px',
              padding: '7px 13px', borderRadius: '999px', cursor: 'pointer', backdropFilter: 'blur(4px)',
            }}>
              {hc.label}
            </button>
          )}
          <button
            className="header-btn"
            onClick={() => setShowTweaks(v => !v)}
            title="Feel"
            style={{
              border: 'none', background: showTweaks ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.55)',
              color: showTweaks ? '#5c4f3d' : '#8a7b66',
              fontFamily: 'inherit', fontWeight: 600, fontSize: '13px',
              padding: '6px 10px', borderRadius: '999px', cursor: 'pointer', backdropFilter: 'blur(4px)',
              lineHeight: 1,
            }}
          >
            ✦
          </button>
        </div>
      </div>

      {/* TWEAKS PANEL */}
      {showTweaks && (
        <TweaksPanel
          palette={palette} corners={corners} texture={texture} accent={theme.accent}
          onPalette={setPalette} onCorners={setCorners} onTexture={setTexture}
        />
      )}

      {/* ── LOADING ── */}
      {(screen === 'loading' || screen === 'not-found') && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '60px' }}>
          {screen === 'loading' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', color: '#a8967c', fontSize: '13.5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.accent, animation: 'pulse 1.4s ease-in-out infinite', display: 'inline-block' }} />
              Connecting…
            </div>
          ) : (
            <>
              <p style={{ fontSize: '15px', color: '#7a6c58' }}>Room not found or has already ended.</p>
              <button onClick={goHome} style={ctaStyle(false)}>Start fresh →</button>
            </>
          )}
        </div>
      )}

      {/* ── HOST SCREEN ── */}
      {screen === 'host' && (
        <div style={{ width: '100%', maxWidth: '460px', animation: 'rise .5s ease both', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: '18px' }}>
          <div style={{ position: 'relative', marginBottom: '6px' }}>
            <div style={{ position: 'absolute', left: '50%', top: '-10px', transform: 'translateX(-50%)', display: 'flex', gap: '5px' }}>
              <span style={{ width: '3px', height: '12px', borderRadius: '2px', background: '#cbb89c', animation: 'steam 2.4s ease-in-out infinite' }} />
              <span style={{ width: '3px', height: '12px', borderRadius: '2px', background: '#cbb89c', animation: 'steam 2.4s ease-in-out .6s infinite' }} />
            </div>
            <TeapotSVG w={120} h={72} />
          </div>

          <h1 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: '36px', lineHeight: 1.12, letterSpacing: '-.01em', color: '#2e261d', marginBottom: '10px' }}>
            A few questions.<br />
            <em style={{ color: theme.accent }}>A better conversation.</em>
          </h1>
          <p style={{ fontSize: '15px', lineHeight: 1.55, color: '#7a6c58', maxWidth: '34ch', marginBottom: '28px' }}>
            Take turns drawing a card and answering out loud — together, on your own two phones. No typing, no scores. Just the questions that get you talking.
          </p>

          <div style={{ width: '100%', maxWidth: '340px', background: 'rgba(255,255,255,.6)', border: '1px solid rgba(140,120,95,.2)', borderRadius: '18px', padding: '13px 16px', textAlign: 'left', marginBottom: '16px' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#a8967c', marginBottom: '3px' }}>Your name</div>
            <input
              value={hostInput}
              onChange={e => setHostInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && hostInput.trim() && createRoom()}
              maxLength={16}
              placeholder="e.g. Maya"
              autoFocus
              style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontWeight: 600, fontSize: '19px', color: '#3a3026' }}
            />
          </div>

          <button onClick={createRoom} disabled={!hostInput.trim()} style={ctaStyle(!hostInput.trim())}>
            Brew an invite →
          </button>
          <p style={{ fontSize: '12.5px', color: '#a8967c', marginTop: '14px', maxWidth: '30ch', lineHeight: 1.5 }}>
            You'll get a link to send to whoever you're sharing a pot of tea with.
          </p>
        </div>
      )}

      {/* ── INVITE SCREEN (host waiting) ── */}
      {screen === 'invite' && (
        <div style={{ width: '100%', maxWidth: '460px', animation: 'rise .5s ease both', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#a8967c', marginBottom: '8px' }}>The kettle's on</div>
          <h1 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: '30px', lineHeight: 1.15, color: '#2e261d', marginBottom: '8px' }}>
            Your table is set, {hName}.
          </h1>
          <p style={{ fontSize: '15px', lineHeight: 1.55, color: '#7a6c58', maxWidth: '32ch', marginBottom: '24px' }}>
            Send this link to your guest. Once they join, you'll both move to deck selection automatically.
          </p>

          <div style={{ width: '100%', background: 'rgba(255,255,255,.7)', border: '1px solid rgba(140,120,95,.22)', borderRadius: '16px', padding: '6px 6px 6px 16px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span style={{ flex: 1, textAlign: 'left', fontSize: '13.5px', color: '#7a6c58', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {link}
            </span>
            <button className="copy-btn" onClick={copyLink} style={{
              flexShrink: 0, border: 'none', background: theme.accent, color: '#fff',
              fontFamily: 'inherit', fontWeight: 700, fontSize: '13.5px',
              padding: '11px 16px', borderRadius: '11px', cursor: 'pointer',
            }}>
              {copied ? 'Copied ✓' : 'Copy link'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', color: '#a8967c', fontSize: '13.5px', marginTop: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.accent, animation: 'pulse 1.4s ease-in-out infinite', display: 'inline-block' }} />
            Waiting for your guest to join…
          </div>
        </div>
      )}

      {/* ── JOIN SCREEN (guest) ── */}
      {screen === 'join' && (
        <div style={{ width: '100%', maxWidth: '460px', animation: 'rise .5s ease both', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: '20px' }}>
          <TeapotSVG w={104} h={62} />
          <div style={{ height: '14px' }} />
          <h1 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: '30px', lineHeight: 1.18, color: '#2e261d', marginBottom: '10px' }}>
            <strong style={{ fontWeight: 500, color: theme.accent }}>{hName}</strong> poured you a cup.
          </h1>
          <p style={{ fontSize: '15px', lineHeight: 1.55, color: '#7a6c58', maxWidth: '30ch', marginBottom: '26px' }}>
            Add your name and join the table for a round of TeaTalk.
          </p>

          <div style={{ width: '100%', maxWidth: '340px', background: 'rgba(255,255,255,.6)', border: '1px solid rgba(140,120,95,.2)', borderRadius: '18px', padding: '13px 16px', textAlign: 'left', marginBottom: '16px' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#a8967c', marginBottom: '3px' }}>Your name</div>
            <input
              value={guestInput}
              onChange={e => setGuestInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && guestInput.trim() && joinRoom()}
              maxLength={16}
              placeholder="e.g. Sam"
              autoFocus
              style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontWeight: 600, fontSize: '19px', color: '#3a3026' }}
            />
          </div>

          <button onClick={joinRoom} disabled={!guestInput.trim()} style={ctaStyle(!guestInput.trim())}>
            Join the table →
          </button>
        </div>
      )}

      {/* ── DECK SELECTION ── */}
      {screen === 'deck' && (
        <div style={{ width: '100%', maxWidth: '460px', animation: 'rise .5s ease both' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontFamily: "'Newsreader', serif", fontSize: '22px', color: '#2e261d' }}>
              <span>{hName}</span>
              <span style={{ color: theme.accent, fontSize: '16px' }}>&amp;</span>
              <span>{gName}</span>
            </div>
            <p style={{ fontSize: '14px', color: '#7a6c58', marginTop: '6px' }}>
              Choose a deck together — talk it over and tap when you agree.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
            {DECKS.map(deck => (
              <button
                key={deck.id}
                className="card-btn"
                onClick={() => startDeck(deck.id)}
                style={{
                  textAlign: 'left',
                  border: '1px solid rgba(140,120,95,.22)',
                  background: theme.decks[deck.id].bg,
                  borderRadius: cardRadius,
                  padding: '18px 19px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div style={{
                  width: '46px', height: '46px', borderRadius: '14px',
                  background: theme.decks[deck.id].dot,
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Newsreader', serif", fontSize: '22px', color: '#fff',
                }}>
                  {deck.glyph}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '17px', color: '#2e261d', marginBottom: '2px' }}>{deck.name}</div>
                  <div style={{ fontSize: '13px', color: '#7a6c58', lineHeight: 1.4 }}>{deck.blurb}</div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#a8967c', whiteSpace: 'nowrap' }}>
                  {deck.questions.length} cards
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── PLAY ── */}
      {screen === 'play' && curDeck && dcol && (
        <div style={{ width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>

          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: dcol.dot, flexShrink: 0 }} />
              <span style={{ fontSize: '15px', color: '#5c4f3d' }}>
                <strong style={{ color: '#2e261d' }}>{pickerName}</strong>
                {flipped ? "'s card · both answer" : "'s turn to pick"}
              </span>
            </div>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#a8967c' }}>
              {pos + 1} / {order.length}
            </span>
          </div>

          <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', maxHeight: '520px', marginBottom: '24px' }}>
            <div style={{ position: 'absolute', inset: 0, background: '#fbf6ec', borderRadius: cardRadius, transform: 'rotate(3.5deg) translateY(8px)', boxShadow: '0 10px 30px -16px rgba(80,55,30,.35)', border: '1px solid rgba(140,120,95,.14)' }} />
            <div style={{ position: 'absolute', inset: 0, background: '#fdf9f1', borderRadius: cardRadius, transform: 'rotate(-2.2deg) translateY(4px)', boxShadow: '0 10px 30px -16px rgba(80,55,30,.3)', border: '1px solid rgba(140,120,95,.14)' }} />

            <div key={cardKey} style={{ position: 'absolute', inset: 0, ...cardAnim }}>
              {!flipped && (
                <div
                  onClick={flip}
                  style={{
                    position: 'absolute', inset: 0, borderRadius: cardRadius,
                    background: dcol.dot,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', padding: '30px', textAlign: 'center', overflow: 'hidden',
                  }}
                >
                  {texture && (
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,.06) 0 14px, transparent 14px 28px)' }} />
                  )}
                  <div style={{ fontFamily: "'Newsreader', serif", fontSize: '46px', color: 'rgba(255,255,255,.92)', marginBottom: '18px', position: 'relative' }}>
                    {curDeck.glyph}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.7)', position: 'relative', marginBottom: '8px' }}>
                    {curDeck.name}
                  </div>
                  <div style={{ fontFamily: "'Newsreader', serif", fontSize: '23px', color: '#fff', lineHeight: 1.25, position: 'relative' }}>
                    {pickerName}, tap to<br />turn over a card
                  </div>
                  <div style={{ marginTop: '20px', fontSize: '12.5px', color: 'rgba(255,255,255,.65)', position: 'relative' }}>
                    Card {pos + 1}
                  </div>
                </div>
              )}

              {flipped && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: cardRadius,
                  background: '#fffdf8',
                  border: '1px solid rgba(140,120,95,.16)',
                  display: 'flex', flexDirection: 'column',
                  padding: '30px 28px',
                  boxShadow: '0 22px 50px -26px rgba(80,55,30,.5)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: dcol.dot }}>
                      {curDeck.name}
                    </span>
                    <span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '17px', color: '#cbb89c' }}>
                      {pos + 1} of {order.length}
                    </span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p className="play-question" style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: '28px', lineHeight: 1.32, textAlign: 'center', color: '#2e261d' }}>
                      {curDeck.questions[order[pos]]}
                    </p>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '13px', color: '#a8967c', lineHeight: 1.5 }}>
                    Both of you answer out loud,<br />then {otherName} picks the next card.
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ width: '100%', display: 'flex', gap: '12px' }}>
            {flipped ? (
              <>
                <button className="ghost-btn" onClick={() => advance(false)} style={{
                  flexShrink: 0, border: '1px solid rgba(140,120,95,.3)',
                  background: 'transparent', color: '#7a6c58',
                  fontFamily: 'inherit', fontWeight: 600, fontSize: '15px',
                  padding: '15px 20px', borderRadius: '16px', cursor: 'pointer',
                }}>
                  Skip
                </button>
                <button onClick={() => advance(true)} style={{
                  flex: 1, border: 'none', background: theme.accent, color: '#fff',
                  fontFamily: 'inherit', fontWeight: 700, fontSize: '16px',
                  padding: '15px', borderRadius: '16px', cursor: 'pointer',
                  boxShadow: `0 10px 24px -12px ${theme.accentShadow}`,
                }}>
                  We both answered →
                </button>
              </>
            ) : (
              <button className="dark-btn" onClick={flip} style={{
                flex: 1, border: 'none', background: '#3a3026', color: '#f3ecdf',
                fontFamily: 'inherit', fontWeight: 700, fontSize: '16px',
                padding: '15px', borderRadius: '16px', cursor: 'pointer',
              }}>
                Turn over the card
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── DONE ── */}
      {screen === 'done' && (
        <div style={{ width: '100%', maxWidth: '460px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', animation: 'rise .5s ease both' }}>
          <div style={{
            width: '58px', height: '58px', borderRadius: '18px',
            background: theme.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Newsreader', serif", fontSize: '28px', color: '#fff',
            marginBottom: '22px',
          }}>
            ♥
          </div>
          <h1 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: '34px', lineHeight: 1.15, color: '#2e261d', marginBottom: '12px' }}>
            That's the whole pot.
          </h1>
          <p style={{ fontSize: '15px', lineHeight: 1.55, color: '#7a6c58', maxWidth: '34ch', marginBottom: '30px' }}>
            {hName} &amp; {gName}, you answered {answeredTotal} question{answeredTotal !== 1 ? 's' : ''} together. Hope the tea's still warm.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={replay} style={{
              border: 'none', background: theme.accent, color: '#fff',
              fontFamily: 'inherit', fontWeight: 700, fontSize: '15px',
              padding: '14px 24px', borderRadius: '16px', cursor: 'pointer',
            }}>
              Shuffle this deck again
            </button>
            <button className="ghost-btn" onClick={backToDeck} style={{
              border: '1px solid rgba(140,120,95,.3)', background: 'transparent', color: '#7a6c58',
              fontFamily: 'inherit', fontWeight: 600, fontSize: '15px',
              padding: '14px 24px', borderRadius: '16px', cursor: 'pointer',
            }}>
              Choose another deck
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
