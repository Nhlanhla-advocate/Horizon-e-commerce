'use client';

import { useEffect } from 'react';
import './accountSuccessModal.css';

export default function AccountSuccessModal({ message, onClose }) {
  useEffect(() => {
    if (!message) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="account-success-modal-overlay" onClick={onClose}>
      <div
        className="account-success-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="account-success-title"
        aria-describedby="account-success-message"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="account-success-modal-icon" aria-hidden="true">
          ✓
        </div>
        <h2 id="account-success-title" className="account-success-modal-title">
          Success
        </h2>
        <p id="account-success-message" className="account-success-modal-message">
          {message}
        </p>
        <button type="button" className="account-success-modal-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
