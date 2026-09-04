'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** Shared attributes so browsers/password managers do not prefill login fields. */
export const blankAuthFieldProps = {
  autoCorrect: 'off',
  autoCapitalize: 'none',
  spellCheck: false,
  'data-lpignore': 'true',
  'data-1p-ignore': 'true',
  'data-form-type': 'other',
};

export function useBlankAuthForm() {
  const formRef = useRef(null);
  const [locked, setLocked] = useState(true);

  const clearNativeValues = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    form.querySelectorAll('input').forEach((input) => {
      if (input.type === 'hidden' || input.type === 'submit' || input.type === 'button') return;
      input.value = '';
    });
  }, []);

  useEffect(() => {
    clearNativeValues();
    const timers = [80, 250, 600].map((ms) => window.setTimeout(clearNativeValues, ms));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [clearNativeValues]);

  return {
    formRef,
    locked,
    unlock: () => setLocked(false),
    formProps: {
      autoComplete: 'off',
      ref: formRef,
    },
  };
}
