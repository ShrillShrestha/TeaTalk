import { useState, useEffect } from 'react';
import { ref, set, update, onValue, off } from 'firebase/database';
import { db } from '../firebase';
import { deckOrder } from '../data/decks';
import { FACTS, FACT_INTERVAL_MS } from '../data/survey';

// Screens the guest walks through locally between naming themselves and the
// first card. The room status stays 'waiting' throughout, so the host never
// follows along — these are receiver-only by construction.
const GUEST_ONLY_SCREENS = ['vibecheck', 'survey', 'brewing', 'clickstart'];

// Curtain timings, in ms. `dwell` is the beat the wash holds at full cover
// after the swap — long enough to register as a pause, short enough not to drag.
const CURTAIN_CLOSE = 420;
const CURTAIN_OPEN  = 520;
const CURTAIN_DWELL = 160;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function parseHash() {
  const hash = (window.location.hash || '').replace(/^#/, '');
  const hostMatch  = hash.match(/^host=([^&]+)/);
  const guestMatch = hash.match(/^room=([^&]+)/);
  if (hostMatch)  return { role: 'host',  roomId: hostMatch[1],  localScreen: null };
  if (guestMatch) return { role: 'guest', roomId: guestMatch[1], localScreen: 'joining' };
  return null;
}

function deriveScreen(localScreen, role, roomData) {
  if (localScreen === 'landing') return 'host';
  if (roomData === undefined)    return 'loading';
  if (roomData === null)         return 'not-found';
  if (localScreen === 'joining') return 'join';
  // Guest-only vibe check. Gated on role so a host link can never reach it.
  if (role === 'guest' && GUEST_ONLY_SCREENS.includes(localScreen)) return localScreen;
  if (roomData.status === 'waiting') return role === 'host' ? 'invite' : 'loading';
  // Anything else (including a 'deck' status left by an older room) has no
  // screen — show the recovery prompt rather than a blank page.
  return roomData.status === 'play' || roomData.status === 'done'
    ? roomData.status
    : 'not-found';
}

export function useRoom() {
  const [localScreen, setLocalScreen] = useState('landing');
  const [role,        setRole]        = useState(null);
  const [roomId,      setRoomId]      = useState(null);
  const [roomData,    setRoomData]    = useState(undefined); // undefined=loading, null=not found

  const [hostInput,  setHostInput]  = useState('');
  const [guestInput, setGuestInput] = useState('');
  const [link,       setLink]       = useState('');
  const [copied,     setCopied]     = useState(false);
  const [flying,     setFlying]     = useState(false);
  const [flyDir,     setFlyDir]     = useState('forward'); // which way the deck last moved

  // Vibe-check state — local to the guest's device
  const [surveyStep,     setSurveyStep]     = useState(0);
  const [selectedVibe,   setSelectedVibe]   = useState(null);
  const [selectedExcite, setSelectedExcite] = useState(null);
  const [hateLevel,      setHateLevel]      = useState(3);
  const [hateTouched,    setHateTouched]    = useState(false);
  const [factIndex,      setFactIndex]      = useState(0);
  const [curtain,        setCurtain]        = useState('idle'); // idle | closing | opening

  // Cover the screen, run the change behind the wash, then uncover.
  const withCurtain = async (change, dwell = CURTAIN_DWELL) => {
    setCurtain('closing');
    await wait(CURTAIN_CLOSE);
    await change();
    await wait(dwell);
    setCurtain('opening');
    await wait(CURTAIN_OPEN);
    setCurtain('idle');
  };

  // Parse URL hash on mount to resume a host or guest session
  useEffect(() => {
    const parsed = parseHash();
    if (parsed) {
      setRoomId(parsed.roomId);
      setRole(parsed.role);
      setLocalScreen(parsed.localScreen);
    }
  }, []);

  // Subscribe to Firebase room in real time
  useEffect(() => {
    if (!roomId) return;
    const roomRef = ref(db, `rooms/${roomId}`);
    const cb = (snap) => setRoomData(snap.val() ?? null);
    onValue(roomRef, cb);
    return () => off(roomRef, 'value', cb);
  }, [roomId]);

  const screen = deriveScreen(localScreen, role, roomData);

  // Rotate the fun facts, then hand off to the click-to-start splash. Every
  // fact gets the same dwell; the curtain supplies the beat before the swap.
  useEffect(() => {
    if (screen !== 'brewing') return;
    const isLast = factIndex >= FACTS.length - 1;
    const timer = setTimeout(
      () => (isLast
        ? withCurtain(() => setLocalScreen('clickstart'))
        : setFactIndex(i => i + 1)),
      FACT_INTERVAL_MS,
    );
    return () => clearTimeout(timer);
  }, [screen, factIndex]);

  // Normalize order — Firebase may return a dense array as a keyed object
  const rawOrder = roomData?.order ?? [];
  const order = Array.isArray(rawOrder) ? rawOrder : Object.values(rawOrder);


  // ── actions ──────────────────────────────────────────────────────────────

  const createRoom = async () => {
    if (!hostInput.trim()) return;
    const rid = Math.random().toString(36).slice(2, 8);
    await set(ref(db, `rooms/${rid}`), {
      hostName: hostInput.trim(),
      guestName: null,
      status: 'waiting',
      survey: null,
      pos: 0, flipped: false, picker: 0, order: [],
    });
    const base = window.location.href.split('#')[0];
    setLink(base + '#room=' + rid);
    setRoomId(rid);
    setRole('host');
    setLocalScreen(null);
    setCopied(false);
    history.pushState(null, '', '#host=' + rid);
  };

  const copyLink = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1700); };
    try {
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(link).then(done, done);
      else done();
    } catch (_) { done(); }
  };

  // The guest names themselves, then peels off into the vibe check alone. The
  // room status deliberately stays 'waiting' so the host keeps seeing the
  // invite screen — only continueToPlay moves both players on.
  const joinRoom = async () => {
    if (!guestInput.trim() || !roomId) return;
    await update(ref(db, `rooms/${roomId}`), { guestName: guestInput.trim() });
    setLocalScreen('vibecheck');
  };

  const saveSurvey = (patch) => {
    if (!roomId) return;
    update(ref(db, `rooms/${roomId}/survey`), patch).catch(() => {});
  };

  const continueToSurvey   = () => { setSurveyStep(0); setLocalScreen('survey'); };
  const continueToSurveyQ2 = () => setSurveyStep(1);
  const continueToSurveyQ3 = () => setSurveyStep(2);

  const pickVibe = (id) => {
    setSelectedVibe(id);
    saveSurvey({ vibe: id });
  };
  const unpickVibe = () => {
    setSelectedVibe(null);
    saveSurvey({ vibe: null });
  };

  const pickExcite = (id) => {
    setSelectedExcite(id);
    saveSurvey({ excite: id });
  };
  const unpickExcite = () => {
    setSelectedExcite(null);
    saveSurvey({ excite: null });
  };

  const changeHateLevel = (level) => {
    setHateLevel(level);
    setHateTouched(true);
    saveSurvey({ hate: level });
  };

  const continueToBrewing = () => withCurtain(() => {
    setFactIndex(0);
    setLocalScreen('brewing');
  });

  // There is one deck, always played in its authored order.
  const startGame = async () => {
    await update(ref(db, `rooms/${roomId}`), {
      order: deckOrder(),
      status: 'play',
      pos: 0, flipped: false, picker: 0,
    });
  };

  const continueToPlay = () => withCurtain(async () => {
    await startGame();
    setLocalScreen(null);
  }, 320);

  const flip = async () => {
    if (!roomData?.flipped) {
      await update(ref(db, `rooms/${roomId}`), { flipped: true });
    }
  };

  // Turning a card over is a one-time ceremony on the first card; every card
  // after it arrives face up, so a tap just moves the deck along.
  const advance = () => {
    if (flying || !roomData) return;
    const next = roomData.pos + 1;
    setFlyDir('forward');
    setFlying(true);
    setTimeout(async () => {
      if (next >= order.length) {
        await update(ref(db, `rooms/${roomId}`), { status: 'done' });
      } else {
        await update(ref(db, `rooms/${roomId}`), {
          pos: next, flipped: true, picker: roomData.picker ? 0 : 1,
        });
      }
      setFlying(false);
    }, 360);
  };

  // Step back one card, handing the pick back to whoever had it.
  const goBack = () => {
    if (flying || !roomData || roomData.pos === 0) return;
    setFlyDir('back');
    setFlying(true);
    setTimeout(async () => {
      await update(ref(db, `rooms/${roomId}`), {
        pos: roomData.pos - 1,
        flipped: true,
        picker: roomData.picker ? 0 : 1,
      });
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
    setFlyDir('forward');
    setSurveyStep(0);
    setSelectedVibe(null);
    setSelectedExcite(null);
    setHateLevel(3);
    setHateTouched(false);
    setFactIndex(0);
    setCurtain('idle');
  };

  // Ends the round early for both devices.
  const endSession = async () => {
    await update(ref(db, `rooms/${roomId}`), { status: 'done' });
  };

  return {
    screen, role,
    hostInput,  setHostInput,
    guestInput, setGuestInput,
    link, copied, flying, flyDir, order,
    surveyStep, selectedVibe, selectedExcite, hateLevel, hateTouched, factIndex,
    survey: roomData?.survey ?? null,
    curtain,
    guestJoined: !!roomData?.guestName,
    hostName:      roomData?.hostName      || 'Player 1',
    guestName:     roomData?.guestName     || 'Player 2',
    pos:           roomData?.pos           ?? 0,
    flipped:       roomData?.flipped       ?? false,
    picker:        roomData?.picker        ?? 0,
    canGoBack: (roomData?.pos ?? 0) > 0,
    actions: {
      createRoom, copyLink, joinRoom, flip, advance, goBack, goHome, endSession,
      continueToSurvey, continueToSurveyQ2, continueToSurveyQ3,
      pickVibe, unpickVibe, pickExcite, unpickExcite,
      changeHateLevel, continueToBrewing, continueToPlay,
    },
  };
}
