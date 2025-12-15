'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Navbar from '../../components/navbar/Navbar';
import '../../assets/css/product.css';
import ImageModal from '../../components/imagemodal/ImageModal';
import { useCart } from '../../cart/Cart';


const images = [
  '/Pictures/Playstation 5 Digital.jpg',
  '/Pictures/Playstation 5 disk.jpg',
  '/Pictures/Playstation 5 pro.jpg',
];


export default function ProductDetail() {
  const [fullscreen, setFullscreen] = useState(false);
  const [selected, setSelected] = useState(0);
  const { addToCart } = useCart();


  // Navigation handlers for modal
  const handlePrev = (e) => {
    e.stopPropagation();
    setSelected((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  const handleNext = (e) => {
    e.stopPropagation();
    setSelected((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  const handleClose = () => setFullscreen(false);


  return (
    <>
      <Navbar />
      {/* Fullscreen Modal Overlay */}
      {fullscreen && (
        <ImageModal
          images={images}
          currentIndex={selected}
          onClose={handleClose}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
      <div className="container">
        <div className="mainContent">
          {/* Left: Images */}
          <div className="leftImages">
            <div className="imageFlexRow">
              <div className="thumbnails">
                {/* Thumbnails */}
                {images.map((img, idx) => (
                  <div key={img} style={{ border: idx === selected ? '2px solid #2563eb' : '1px solid #eee', borderRadius: 6, cursor: 'pointer', padding: 2, background: idx === selected ? '#e0e7ff' : '#fff' }} onClick={() => setSelected(idx)}>
                    <Image src={img} alt={`PS5 Digital thumb ${idx + 1}`} width={60} height={60} style={{ borderRadius: 6, objectFit: 'cover', width: '100%', height: 'auto' }} />
                  </div>
                ))}
              </div>
              <div className="mainImageContainer">
                <Image src={images[selected]} alt={`Playstation 5 Digital ${selected + 1}`} width={340} height={340} style={{ borderRadius: 10, objectFit: 'cover', border: '1px solid #eee', cursor: 'pointer', width: '100%', height: 'auto' }} onClick={() => setFullscreen(true)} />
                <button onClick={() => setFullscreen(true)} title="View Fullscreen" style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
                  <svg width="22" height="22" fill="#fff" viewBox="0 0 24 24"><path d="M9 3H5a2 2 0 0 0-2 2v4a1 1 0 1 0 2 0V5h4a1 1 0 1 0 0-2zm6 0a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0V5a2 2 0 0 0-2-2h-4zm5 14a1 1 0 0 0-1 1v4h-4a1 1 0 1 0 0 2h4a2 2 0 0 0 2-2v-4a1 1 0 0 0-1-1zm-16 1a1 1 0 0 0-1 1v4a2 2 0 0 0 2 2h4a1 1 0 1 0 0-2H5v-4a1 1 0 0 0-1-1z"/></svg>
                </button>
              </div>
            </div>
          </div>
          {/* Right: Details */}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '2.1rem', marginBottom: 8, fontWeight: 700 }}>Playstation 5 Digital Edition 825GB Console</h1>
            <div style={{ color: '#2563eb', fontWeight: 600, marginBottom: 6 }}>Sony</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ color: '#fbbf24', fontSize: 18 }}>★ ★ ★ ★ ★</span>
              <span style={{ color: '#666', fontSize: 15 }}>(12 Reviews)</span>
            </div>
            <div style={{ fontSize: 28, color: '#2563eb', fontWeight: 700, margin: '18px 0 10px 0' }}>R 12,999</div>
            <div style={{ color: '#16a34a', fontWeight: 500, marginBottom: 8 }}>In Stock</div>
            <div style={{ background: '#f3f4f6', borderRadius: 6, padding: '0.75rem 1rem', marginBottom: 16, fontSize: 15 }}>
              <div>Free Delivery Available.</div>
              <div>Ships in 3 - 5 work days.</div>
              <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>Hassle-Free Exchanges & Returns for 30 Days</div>
            </div>
            <button
              style={{ background: '#2563eb', color: '#fff', padding: '0.9rem 2.5rem', border: 'none', borderRadius: 5, fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}
              onClick={() => addToCart('687758601f8fda62d2898c43', 1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 20 20" style={{ marginRight: 6 }}>
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              Add to Cart
            </button>
            <div style={{ fontSize: 15, color: '#666', marginBottom: 18 }}>
              <b>Seller:</b> Horizon Store <span style={{ color: '#16a34a', fontWeight: 500, marginLeft: 8 }}>4.8 ★</span>
            </div>
            <div style={{ fontSize: 15, color: '#444', marginBottom: 18 }}>
              <b>Description:</b> The PlayStation 5 Digital Edition unleashes new gaming possibilities that you never anticipated. Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio, and an all-new generation of incredible PlayStation games.
            </div>
            <ul style={{ margin: '1rem 0', paddingLeft: 20, color: '#444', fontSize: 15 }}>
              <li>Ultra-High Speed SSD</li>
              <li>Ray Tracing</li>
              <li>4K-TV Gaming</li>
              <li>Up to 120fps with 120Hz output</li>
              <li>HDR Technology</li>
              <li>8K Output Support</li>
            </ul>
          </div>
        </div>
        <hr style={{ margin: '3rem 0 0 0', border: 'none', borderTop: '1.5px solid #e5e7eb' }} />
        <div style={{ position: 'relative', left: '50%', right: '50%', width: '100vw', transform: 'translateX(-50%)', height: '40px', background: '#f3f4f6', margin: '0 0 2rem 0', borderRadius: 0 }} />
        <div style={{ marginTop: 0, textAlign: 'center', padding: '2rem 0', background: '#f8fafc', borderRadius: 10 }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 18, textAlign: 'center' }}>You Might Also Like</h2>
          <div className="you-might-like-slider">
            {/* PlayStation 4 */}
            <div style={{ minWidth: 180, maxWidth: 220, height: 260, background: '#f9fafb', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 12, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', scrollSnapAlign: 'start' }}>
              <div style={{ width: 120, height: 120, margin: '0 auto 8px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 6 }}>
                <Image src="/Pictures/Playstation 4.jpg" alt="PS4" width={120} height={120} style={{ objectFit: 'contain', width: '100%', height: '100%', borderRadius: 6 }} />
              </div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>PlayStation 4</div>
              <div style={{ color: '#2563eb', fontWeight: 600, marginBottom: 4 }}>R 3,000</div>
              <button style={{ background: '#2563eb', color: '#fff', padding: '0.5rem 1.2rem', border: 'none', borderRadius: 4, fontSize: '0.95rem', cursor: 'pointer' }}>
                View
              </button>
            </div>
            {/* PlayStation 5 Disk */}
            <div style={{ minWidth: 180, maxWidth: 220, height: 260, background: '#f9fafb', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 12, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', scrollSnapAlign: 'start' }}>
              <div style={{ width: 120, height: 120, margin: '0 auto 8px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 6 }}>
                <Image src="/Pictures/Playstation 5 disk.jpg" alt="PS5 Disk" width={120} height={120} style={{ objectFit: 'contain', width: '100%', height: '100%', borderRadius: 6 }} />
              </div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>PlayStation 5 Disk</div>
              <div style={{ color: '#2563eb', fontWeight: 600, marginBottom: 4 }}>R 16,500</div>
              <button style={{ background: '#2563eb', color: '#fff', padding: '0.5rem 1.2rem', border: 'none', borderRadius: 4, fontSize: '0.95rem', cursor: 'pointer' }}>
                View
              </button>
            </div>
            {/* PlayStation 5 Pro */}
            <div style={{ minWidth: 180, maxWidth: 220, height: 260, background: '#f9fafb', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 12, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', scrollSnapAlign: 'start' }}>
              <div style={{ width: 120, height: 120, margin: '0 auto 8px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 6 }}>
                <Image src="/Pictures/Playstation 5 pro.jpg" alt="PS5 Pro" width={120} height={120} style={{ objectFit: 'contain', width: '100%', height: '100%', borderRadius: 6 }} />
              </div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>PlayStation 5 Pro</div>
              <div style={{ color: '#2563eb', fontWeight: 600, marginBottom: 4 }}>R 19,500</div>
              <button style={{ background: '#2563eb', color: '#fff', padding: '0.5rem 1.2rem', border: 'none', borderRadius: 4, fontSize: '0.95rem', cursor: 'pointer' }}>
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
