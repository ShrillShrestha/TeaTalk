import { useState, useEffect } from 'react';
import { ref, set, update, onValue, off } from 'firebase/database';
import { db } from '../firebase';
import { DECKS, shuffle } from '../data/decks';

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
  if (roomData.status === 'waiting') return role === 'host' ? 'invite' : 'loading';
  return roomData.status; // 'deck' | 'play' | 'done'
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
      deckId: null,
      pos: 0, flipped: false, picker: 0, answeredTotal: 0, order: [],
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

  const joinRoom = async () => {
    if (!guestInput.trim() || !roomId) return;
    await update(ref(db, `rooms/${roomId}`), { guestName: guestInput.trim(), status: 'deck' });
    setLocalScreen(null);
  };

  const startDeck = async (id) => {
    const deck = DECKS.find(d => d.id === id);
    await update(ref(db, `rooms/${roomId}`), {
      deckId: id,
      order: shuffle(deck.questions.length),
      status: 'play',
      pos: 0, flipped: false, picker: 0, answeredTotal: 0,
    });
  };

  const flip = async () => {
    if (!roomData?.flipped) {
      await update(ref(db, `rooms/${roomId}`), { flipped: true });
    }
  };

  const advance = (counts) => {
    if (flying || !roomData) return;
    const next        = roomData.pos + 1;
    const newAnswered = counts ? roomData.answeredTotal + 1 : roomData.answeredTotal;
    setFlying(true);
    setTimeout(async () => {
      if (next >= order.length) {
        await update(ref(db, `rooms/${roomId}`), { status: 'done', answeredTotal: newAnswered });
      } else {
        await update(ref(db, `rooms/${roomId}`), {
          pos: next, flipped: false, picker: roomData.picker ? 0 : 1, answeredTotal: newAnswered,
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
  };

  const backToDeck = async () => {
    await update(ref(db, `rooms/${roomId}`), { status: 'deck' });
  };

  const replay = () => startDeck(roomData?.deckId);

  return {
    screen,
    hostInput,  setHostInput,
    guestInput, setGuestInput,
    link, copied, flying, order,
    hostName:      roomData?.hostName      || 'Player 1',
    guestName:     roomData?.guestName     || 'Player 2',
    pos:           roomData?.pos           ?? 0,
    flipped:       roomData?.flipped       ?? false,
    picker:        roomData?.picker        ?? 0,
    answeredTotal: roomData?.answeredTotal ?? 0,
    deckId:        roomData?.deckId        ?? null,
    actions: { createRoom, copyLink, joinRoom, startDeck, flip, advance, goHome, backToDeck, replay },
  };
}
