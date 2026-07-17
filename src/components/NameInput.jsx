import styles from './NameInput.module.css';

export default function NameInput({ value, onChange, onEnter, placeholder }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>Your name</div>
      <input
        className={styles.input}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && value.trim() && onEnter()}
        maxLength={16}
        placeholder={placeholder}
        autoFocus
      />
    </div>
  );
}
