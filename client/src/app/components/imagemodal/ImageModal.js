import React from 'react';

export default function ImageModal({ images, currentIndex, onClose, onPrev, onNext }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="image-modal" onClick={onClose}>
      <div
        className="image-modal-content"
        onClick={e => e.stopPropagation()} // Prevent modal close when clicking image
        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {/* Left Arrow */}
        {images.length > 1 && (
          <button
            className="image-modal-arrow image-modal-arrow-left"
            onClick={onPrev}
            aria-label="Previous image"
            style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '2rem', color: '#fff', cursor: 'pointer', zIndex: 2 }}
          >
            &#8592;
          </button>
        )}
        {/* Image */}
        <img
          src={images[currentIndex]}
          alt={`Product image ${currentIndex + 1}`}
          style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: '8px', background: '#fff' }}
        />
        {/* Right Arrow */}
        {images.length > 1 && (
          <button
            className="image-modal-arrow image-modal-arrow-right"
            onClick={onNext}
            aria-label="Next image"
            style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '2rem', color: '#fff', cursor: 'pointer', zIndex: 2 }}
          >
            &#8594;
          </button>
        )}
        {/* Close Button */}
        <button
          className="image-modal-close"
          onClick={onClose}
          aria-label="Close modal"
          style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', color: '#fff', fontSize: '1.5rem', width: 36, height: 36, cursor: 'pointer', zIndex: 3 }}
        >
          &times;
        </button>
      </div>
    </div>
  );
} 