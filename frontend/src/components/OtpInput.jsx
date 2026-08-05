import React, { useRef } from 'react';

export default function OtpInput({ value = '', onChange, length = 6 }) {
  const inputRefs = useRef([]);

  const otpArray = Array.from({ length }, (_, i) => value[i] || '');

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!val) {
      // Character deleted
      const newOtp = [...otpArray];
      newOtp[index] = '';
      onChange(newOtp.join(''));
      return;
    }

    // Take the last character typed
    const lastChar = val.slice(-1);
    const newOtp = [...otpArray];
    newOtp[index] = lastChar;
    const combined = newOtp.join('');
    onChange(combined);

    // Auto-advance focus
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otpArray[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, length);
    if (!pastedData) return;
    
    onChange(pastedData);
    
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex items-center justify-between gap-2 w-full my-2">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otpArray[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-11 h-12 text-center text-lg font-bold bg-theme-main border border-theme-border rounded-sm text-theme-text focus:outline-none focus:border-theme-border-inverted transition-colors shadow-inner"
        />
      ))}
    </div>
  );
}
