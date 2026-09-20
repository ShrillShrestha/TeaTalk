import { useState } from 'react';
import { VIBES, EXCITEMENT, findVibe, findExcite, findHate } from '../data/survey';
import styles from './SurveyScreen.module.css';

// Touch devices never fire hover, so the prompt shouldn't ask for it.
const CAN_HOVER = typeof window !== 'undefined'
  && window.matchMedia?.('(hover: hover)').matches;

const PICK_PROMPT = CAN_HOVER ? 'Hover an emoji, or just pick one.' : 'Tap an emoji to pick one.';

export default function SurveyScreen({
  step, selectedVibe, selectedExcite, hateLevel, hateTouched,
  onPickVibe, onUnpickVibe, onPickExcite, onUnpickExcite,
  onHateLevel, onNextQ2, onNextQ3, onContinue,
}) {
  if (step === 0) {
    return (
      <QuestionStep
        stepLabel="Vibe check · question 1 of 3"
        heading="How are you feeling today?"
      >
        <EmojiPicker
          options={VIBES}
          selected={selectedVibe}
          size="small"
          onPick={onPickVibe}
          onUnpick={onUnpickVibe}
          resolve={findVibe}
        />
        <Continue show={!!selectedVibe} onClick={onNextQ2}>Next question →</Continue>
      </QuestionStep>
    );
  }

  if (step === 1) {
    return (
      <QuestionStep
        stepLabel="Vibe check · question 2 of 3"
        heading="How excited are you to play this game?"
      >
        <EmojiPicker
          options={EXCITEMENT}
          selected={selectedExcite}
          size="large"
          onPick={onPickExcite}
          onUnpick={onUnpickExcite}
          resolve={findExcite}
        />
        <Continue show={!!selectedExcite} onClick={onNextQ3}>Next question →</Continue>
      </QuestionStep>
    );
  }

  return <HateMeter hateLevel={hateLevel} hateTouched={hateTouched} onHateLevel={onHateLevel} onContinue={onContinue} />;
}

function QuestionStep({ stepLabel, heading, children }) {
  return (
    <div className={styles.screen}>
      <div className={styles.stepLabel}>{stepLabel}</div>
      <h1 className={styles.heading}>{heading}</h1>
      {children}
    </div>
  );
}

function EmojiPicker({ options, selected, size, onPick, onUnpick, resolve }) {
  const [hovered, setHovered] = useState(null);

  const message = selected ? resolve(selected)?.picked
                : hovered  ? resolve(hovered)?.hover
                : PICK_PROMPT;

  return (
    <>
      <div className={size === 'small' ? styles.tileRowSmall : styles.tileRowLarge}>
        {options.map(opt => (
          <button
            key={opt.id}
            className={`${size === 'small' ? styles.tileSmall : styles.tileLarge} ${selected === opt.id ? styles.tileSelected : ''}`}
            onClick={() => onPick(opt.id)}
            onDoubleClick={onUnpick}
            onMouseEnter={() => setHovered(opt.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className={styles.tileEmoji}>{opt.emoji}</span>
            <span className={styles.tileLabel}>{opt.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.messageSlot}>
        <p className={styles.message}>{message}</p>
      </div>
    </>
  );
}

function HateMeter({ hateLevel, hateTouched, onHateLevel, onContinue }) {
  const info = findHate(hateLevel);

  return (
    <div className={styles.screen}>
      <div className={`${styles.stepLabel} ${styles.stepLabelAlert}`}>
        ⚠ Vibe check · question 3 of 3 · the real one
      </div>
      <h1 className={`${styles.heading} ${styles.headingTight}`}>
        How much do you hate the person in front of you right now?
      </h1>
      <p className={styles.subhead}>Be honest. The cards will find out anyway.</p>

      <div className={styles.hateEmoji}>{info.emoji}</div>
      <div className={styles.hateLabel}>{info.label}</div>

      <div className={styles.sliderWrap}>
        <input
          className={styles.slider}
          type="range" min="1" max="5" step="1"
          value={hateLevel}
          onChange={e => onHateLevel(Number(e.target.value))}
        />
        <div className={styles.sliderEnds}>
          <span>No hate</span>
          <span>Max hate</span>
        </div>
      </div>

      <div className={`${styles.messageSlot} ${styles.messageSlotHate}`}>
        <p className={styles.message}>{info.message}</p>
      </div>

      <Continue show={hateTouched} onClick={onContinue}>Continue to the cards →</Continue>
    </div>
  );
}

function Continue({ show, onClick, children }) {
  if (!show) return null;
  return <button className="cta-btn" onClick={onClick}>{children}</button>;
}
