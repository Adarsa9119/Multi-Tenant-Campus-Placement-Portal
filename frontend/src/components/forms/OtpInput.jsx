import { useRef } from 'react';

// Six single-digit boxes; supports typing, backspace and paste.
export default function OtpInput({ value, onChange, length = 6 }) {
  const refs = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] || '');
  const set = (i, ch) => {
    const arr = [...digits]; arr[i] = ch; onChange(arr.join(''));
    if (ch && i < length - 1) refs.current[i + 1]?.focus();
  };
  return (
    <div className="otp-boxes">
      {digits.map((d, i) => (
        <input key={i} ref={(el) => { refs.current[i] = el; }} inputMode="numeric" maxLength={1} value={d} aria-label={`OTP digit ${i + 1}`}
          onChange={(e) => set(i, e.target.value.replace(/\D/g, '').slice(-1))}
          onKeyDown={(e) => { if (e.key === 'Backspace' && !d && i > 0) refs.current[i - 1]?.focus(); }}
          onPaste={(e) => { const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length); if (t) { e.preventDefault(); onChange(t); refs.current[Math.min(t.length, length - 1)]?.focus(); } }} />
      ))}
    </div>
  );
}
