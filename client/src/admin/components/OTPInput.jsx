import React, { useEffect, useMemo, useRef } from "react";

export default function OTPInput({ value, onChange, length = 6, disabled }) {
  const refs = useRef([]);
  const digits = useMemo(() => {
    const arr = String(value || "").split("").slice(0, length);
    while (arr.length < length) arr.push("");
    return arr;
  }, [value, length]);

  useEffect(() => {
    if (!value) refs.current?.[0]?.focus?.();
  }, [value]);

  const setDigit = (idx, d) => {
    const next = digits.slice();
    next[idx] = d;
    onChange(next.join("").slice(0, length));
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    e.preventDefault();
    onChange(text);
    const nextIndex = Math.min(text.length, length - 1);
    refs.current?.[nextIndex]?.focus?.();
  };

  return (
    <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
      {digits.map((d, idx) => (
        <input
          key={idx}
          ref={(el) => (refs.current[idx] = el)}
          value={d}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            setDigit(idx, v.slice(-1));
            if (v && idx < length - 1) refs.current?.[idx + 1]?.focus?.();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[idx] && idx > 0) {
              refs.current?.[idx - 1]?.focus?.();
            }
          }}
          className="h-12 w-11 rounded-xl border border-zinc-800 bg-[#0a0a0a] text-center text-lg font-semibold text-white outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-60"
        />
      ))}
    </div>
  );
}

