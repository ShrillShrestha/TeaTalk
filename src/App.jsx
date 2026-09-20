import { useState } from 'react';
import { THEMES } from './data/themes';
import { DECK } from './data/decks';
import { useRoom } from './hooks/useRoom';
import Header from './components/Header';
import TweaksPanel from './components/TweaksPanel';
import Curtain from './components/Curtain';
import HostScreen from './screens/HostScreen';
import InviteScreen from './screens/InviteScreen';
import JoinScreen from './screens/JoinScreen';
import VibeCheckScreen from './screens/VibeCheckScreen';
import SurveyScreen from './screens/SurveyScreen';
import BrewingScreen from './screens/BrewingScreen';
import ClickStartScreen from './screens/ClickStartScreen';
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

  return (
    <div
      className={styles.page}
      style={{
        '--page-bg':       theme.pageBg,
        '--accent':        theme.accent,
        '--accent-dark':   theme.accentDark,
        '--accent-ring':   theme.accentRing,
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
        <InviteScreen
          hostName={room.hostName} link={room.link} copied={room.copied} onCopy={actions.copyLink}
          guestName={room.guestName} guestJoined={room.guestJoined} survey={room.survey}
        />
      )}

      {screen === 'join' && (
        <JoinScreen hostName={room.hostName} guestInput={room.guestInput} setGuestInput={room.setGuestInput} onSubmit={actions.joinRoom} />
      )}

      {screen === 'vibecheck' && (
        <VibeCheckScreen hostName={room.hostName} guestName={room.guestName} onContinue={actions.continueToSurvey} />
      )}

      {screen === 'survey' && (
        <SurveyScreen
          step={room.surveyStep}
          selectedVibe={room.selectedVibe} selectedExcite={room.selectedExcite}
          hateLevel={room.hateLevel} hateTouched={room.hateTouched}
          onPickVibe={actions.pickVibe}     onUnpickVibe={actions.unpickVibe}
          onPickExcite={actions.pickExcite} onUnpickExcite={actions.unpickExcite}
          onHateLevel={actions.changeHateLevel}
          onNextQ2={actions.continueToSurveyQ2} onNextQ3={actions.continueToSurveyQ3}
          onContinue={actions.continueToBrewing}
        />
      )}

      {screen === 'brewing' && <BrewingScreen factIndex={room.factIndex} />}

      {screen === 'clickstart' && <ClickStartScreen onStart={actions.continueToPlay} />}

      {screen === 'play' && (
        <PlayScreen
          texture={texture}
          deck={DECK} deckDot={theme.deckDot}
          pos={room.pos} flipped={room.flipped} picker={room.picker}
          order={room.order} hostName={room.hostName} guestName={room.guestName}
          flying={room.flying} flyDir={room.flyDir} canGoBack={room.canGoBack}
          onFlip={actions.flip} onAdvance={actions.advance} onBack={actions.goBack}
        />
      )}

      {screen === 'done' && (
        <DoneScreen />
      )}

      <Curtain state={room.curtain} />
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
