import { useState } from 'react';
import { THEMES } from './data/themes';
import { DECKS } from './data/decks';
import { useRoom } from './hooks/useRoom';
import Header from './components/Header';
import TweaksPanel from './components/TweaksPanel';
import HostScreen from './screens/HostScreen';
import InviteScreen from './screens/InviteScreen';
import JoinScreen from './screens/JoinScreen';
import DeckScreen from './screens/DeckScreen';
import PlayScreen from './screens/PlayScreen';
import DoneScreen from './screens/DoneScreen';
import styles from './App.module.css';

export default function App() {
  const room = useRoom();

  const [palette,    setPalette]    = useState('Clay');
  const [corners,    setCorners]    = useState('Pillowy');
  const [texture,    setTexture]    = useState(true);
  const [showTweaks, setShowTweaks] = useState(false);

  const theme      = THEMES[palette] || THEMES.Clay;
  const cardRadius = corners === 'Crisp' ? '6px' : '24px';

  const { screen, actions } = room;
  const curDeck    = DECKS.find(d => d.id === room.deckId) ?? null;
  const deckColors = curDeck ? theme.decks[curDeck.id] : null;

  return (
    <div
      className={styles.page}
      style={{
        '--page-bg':       theme.pageBg,
        '--accent':        theme.accent,
        '--accent-dark':   theme.accentDark,
        '--accent-shadow': theme.accentShadow,
        '--card-radius':   cardRadius,
      }}
    >
      <Header
        screen={screen}
        showTweaks={showTweaks}
        onToggleTweaks={() => setShowTweaks(v => !v)}
        actions={actions}
      />

      {showTweaks && (
        <TweaksPanel
          palette={palette} corners={corners} texture={texture}
          onPalette={setPalette} onCorners={setCorners} onTexture={setTexture}
        />
      )}

      {screen === 'loading' && <StatusDot label="Connecting…" />}

      {screen === 'not-found' && (
        <div className={styles.notFound}>
          <p className={styles.notFoundText}>Room not found or has already ended.</p>
          <button className="cta-btn" onClick={actions.goHome}>Start fresh →</button>
        </div>
      )}

      {screen === 'host' && (
        <HostScreen hostInput={room.hostInput} setHostInput={room.setHostInput} onSubmit={actions.createRoom} />
      )}

      {screen === 'invite' && (
        <InviteScreen hostName={room.hostName} link={room.link} copied={room.copied} onCopy={actions.copyLink} />
      )}

      {screen === 'join' && (
        <JoinScreen hostName={room.hostName} guestInput={room.guestInput} setGuestInput={room.setGuestInput} onSubmit={actions.joinRoom} />
      )}

      {screen === 'deck' && (
        <DeckScreen theme={theme} hostName={room.hostName} guestName={room.guestName} onSelect={actions.startDeck} />
      )}

      {screen === 'play' && curDeck && deckColors && (
        <PlayScreen
          texture={texture}
          deck={curDeck} deckColors={deckColors}
          pos={room.pos} flipped={room.flipped} picker={room.picker}
          order={room.order} hostName={room.hostName} guestName={room.guestName}
          flying={room.flying} onFlip={actions.flip} onAdvance={actions.advance}
        />
      )}

      {screen === 'done' && (
        <DoneScreen hostName={room.hostName} guestName={room.guestName} answeredTotal={room.answeredTotal} onReplay={actions.replay} onBackToDeck={actions.backToDeck} />
      )}
    </div>
  );
}

function StatusDot({ label }) {
  return (
    <div className={styles.statusRow}>
      <span className={styles.statusDot} />
      {label}
    </div>
  );
}
