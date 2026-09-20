import styles from './PlayScreen.module.css';

export default function PlayScreen({ texture, deck, deckDot, pos, flipped, picker, order, hostName, guestName, flying, flyDir, canGoBack, onFlip, onAdvance, onBack }) {
  const pickerName = picker ? guestName : hostName;
  const otherName  = picker ? hostName  : guestName;
  const cardKey    = `${pos}-${flipped}`;
  const goingBack  = flyDir === 'back';
  const cardClass  = flying
    ? (goingBack ? styles.cardFlyingBack : styles.cardFlying)
    : (goingBack ? styles.cardBack       : styles.card);

  return (
    <div className={styles.screen} style={{ '--deck-dot': deckDot }}>

      <div className={styles.turnBar}>
        <div className={styles.turnLeft}>
          <div className={styles.turnDot} />
          <span className={styles.turnName}>
            <strong className={styles.turnNameBold}>{pickerName}</strong>
            {flipped ? "'s card · both answer" : "'s turn to pick"}
          </span>
        </div>
        <span className={styles.turnProgress}>{pos + 1} / {order.length}</span>
      </div>

      <div className={styles.cardStack}>
        <div className={styles.stackLayerA} />
        <div className={styles.stackLayerB} />
        <div key={cardKey} className={cardClass}>
          {!flipped && <CardFaceDown deck={deck} texture={texture} pickerName={pickerName} pos={pos} onFlip={onFlip} />}
          {flipped  && <CardFaceUp   deck={deck} pos={pos} order={order} otherName={otherName} onNext={onAdvance} />}
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={`ghost-btn ${styles.navBtn}`}
          onClick={onBack}
          disabled={!canGoBack}
        >
          ← Previous
        </button>

        {flipped ? (
          <button className={`ghost-btn ${styles.navBtn}`} onClick={onAdvance}>Skip</button>
        ) : (
          <button className={`dark-btn ${styles.flipBtn}`} onClick={onFlip}>Turn over the card</button>
        )}
      </div>
    </div>
  );
}

function CardFaceDown({ deck, texture, pickerName, pos, onFlip }) {
  return (
    <div className={styles.faceDown} onClick={onFlip}>
      {texture && <div className={styles.texture} />}
      <div className={styles.faceDownGlyph}>{deck.glyph}</div>
      <div className={styles.faceDownDeckName}>{deck.name}</div>
      <div className={styles.faceDownPrompt}>
        {pickerName}, tap to<br />turn over a card
      </div>
      <div className={styles.faceDownCardNum}>Card {pos + 1}</div>
    </div>
  );
}

function CardFaceUp({ deck, pos, order, otherName, onNext }) {
  return (
    <div className={styles.faceUp} onClick={onNext}>
      <div className={styles.faceUpHeader}>
        <span className={styles.faceUpDeckLabel}>{deck.name}</span>
        <span className={styles.faceUpCounter}>{pos + 1} of {order.length}</span>
      </div>
      <div className={styles.faceUpBody}>
        <p className={`play-question ${styles.faceUpQuestion}`}>
          {deck.questions[order[pos]]}
        </p>
      </div>
      <div className={styles.faceUpFooter}>
        Both of you answer out loud, then tap the card —<br />{otherName} picks the next one.
      </div>
    </div>
  );
}
