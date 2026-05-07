'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import '../../assets/css/product.css';
import ImageModal from '../../components/imagemodal/ImageModal';
import { useCart } from '@/app/components/cart/Cart';

const normalizeProductImagePath = (value) => {
  if (typeof value !== 'string') return '';

  const cleaned = value
    .trim()
    .replace(/^['"]+|['"]+$/g, '')
    .replace(/[,\s]+$/g, '');

  if (!cleaned) return '';
  if (cleaned.startsWith('http')) return cleaned;

  const normalized = cleaned
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^client\/public\//i, '')
    .replace(/^public\//i, '')
    .replace(/^\//, '');

  const hasFileExtension = /\.[a-z0-9]{2,5}$/i.test(
    normalized.split('?')[0].split('#')[0].split('/').pop() || ''
  );
  const normalizedWithExtension = hasFileExtension ? normalized : `${normalized}.jpg`;

  if (/^pictures\//i.test(normalizedWithExtension)) return `/${normalizedWithExtension}`;
  if (!normalizedWithExtension.includes('/')) return `/Pictures/${normalizedWithExtension}`;
  return `/${normalizedWithExtension}`;
};

const getProductImageCandidates = (product) => {
  const fromApi = Array.isArray(product?.images) && product.images.length > 0
    ? product.images
    : (typeof product?.image === 'string' && product.image.length > 0 ? [product.image] : []);

  const nameCandidates = [];
  if (product?.name) {
    nameCandidates.push(product.name);
    nameCandidates.push(String(product.name).replace(/\bnecklace\b/gi, 'necklaces'));
  }

  const normalized = [...fromApi, ...nameCandidates]
    .map(normalizeProductImagePath)
    .filter(Boolean);

  return [...new Set(normalized)];
};

const playstationFallbackImages = {
  ps5: [
    '/Pictures/Playstation 5.jpg',
    '/Pictures/Playstation 5 disk.jpg',
    '/Pictures/Playstation 5 pro.jpg',
    '/Pictures/Playstation 5 Digital.jpg'
  ],
  ps4: [
    '/Pictures/Playstation 4.jpg',
    '/Pictures/Playstation4.jpg',
    '/Pictures/Playstation 4 Pro.jpg',
    '/Pictures/Playstation 4 Slim.jpg',
    '/Pictures/Playstation 4 pro.jpg'
  ]
};

const pinnedThumbnailImages = [
  '/Pictures/Playstation 4 pro.jpg',
  '/Pictures/Playstation 5 Digital.jpg',
  '/Pictures/Playstation 5 disk.jpg'
];

export default function ProductDetail() {
  const params = useParams();
  const slugValue = typeof params?.slug === 'string' ? params.slug : '';
  const matchedProductId = slugValue.match(/[a-fA-F0-9]{24}$/)?.[0] || null;

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: []
  });
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submitReviewError, setSubmitReviewError] = useState('');
  const [submitReviewSuccess, setSubmitReviewSuccess] = useState('');
  const { addToCart } = useCart();

  const buildProductDetailHref = (item) => {
    if (!item?._id) return '#';
    const baseSlug = typeof item.slug === 'string' && item.slug.trim().length > 0
      ? item.slug.trim()
      : String(item.name || 'product').toLowerCase().replace(/\s+/g, '-');

    const slugWithId = baseSlug.endsWith(item._id) ? baseSlug : `${baseSlug}-${item._id}`;
    return `/products/${slugWithId}`;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!matchedProductId) {
        setFetchError('Invalid product link. Missing product id.');
        setProduct(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setFetchError('');
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${baseUrl}/products/${matchedProductId}`);

        if (!response.ok) {
          throw new Error('Unable to load product details.');
        }

        const result = await response.json();
        const fetchedProduct = result?.data;

        if (!fetchedProduct) {
          throw new Error('Product data missing from API response.');
        }

        setProduct(fetchedProduct);
      } catch (error) {
        setFetchError(error?.message || 'Failed to fetch product.');
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [matchedProductId]);

  const fetchProductReviews = useCallback(async () => {
    if (!matchedProductId) return;
    try {
      setReviewsLoading(true);
      setReviewsError('');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/reviews/product/${matchedProductId}?page=1&limit=20`);

      if (!response.ok) {
        throw new Error('Unable to load reviews.');
      }

      const result = await response.json();
      const reviewPayload = result?.data;
      const allReviews = Array.isArray(reviewPayload?.reviews) ? reviewPayload.reviews : [];
      const stats = reviewPayload?.ratingStats || {};
      const averageRating = Number(stats?.averageRating || 0);
      const totalReviews = Number(stats?.totalReviews || 0);
      const distribution = Array.isArray(stats?.ratingDistribution) ? stats.ratingDistribution : [];

      setReviews(allReviews);
      setReviewStats({
        averageRating,
        totalReviews,
        ratingDistribution: distribution
      });
      setProduct((prev) => (prev ? { ...prev, rating: averageRating, numReviews: totalReviews } : prev));
    } catch (error) {
      setReviews([]);
      setReviewStats({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: []
      });
      setReviewsError(error?.message || 'Failed to fetch reviews.');
    } finally {
      setReviewsLoading(false);
    }
  }, [matchedProductId]);

  useEffect(() => {
    fetchProductReviews();
  }, [fetchProductReviews]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      const category = String(product?.category || '').trim();
      if (!category) {
        setRelatedProducts([]);
        return;
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${baseUrl}/products/category/${encodeURIComponent(category)}`);
        if (!response.ok) {
          throw new Error('Unable to load related products.');
        }

        const result = await response.json();
        const categoryProducts = Array.isArray(result?.data) ? result.data : [];
        setRelatedProducts(categoryProducts);
      } catch (error) {
        console.error(error?.message || 'Failed to fetch related products.');
        setRelatedProducts([]);
      }
    };

    fetchRelatedProducts();
  }, [product?.category]);

  const productImages = useMemo(() => {
    if (!product) return ['/Pictures/placeholder.jpg'];

    const normalizedImages = getProductImageCandidates(product);

    const productName = String(product.name || '').toLowerCase();
    const isPS5 = productName.includes('playstation 5') || productName.includes('ps5');
    const isPS4 = productName.includes('playstation 4') || productName.includes('ps4');
    const fallbackSet = isPS5 ? playstationFallbackImages.ps5 : (isPS4 ? playstationFallbackImages.ps4 : []);

    const merged = [...normalizedImages];
    [...fallbackSet, ...pinnedThumbnailImages].forEach((img) => {
      const normalizedFallback = normalizeProductImagePath(img);
      if (normalizedFallback && !merged.includes(normalizedFallback)) {
        merged.push(normalizedFallback);
      }
    });

    return merged.length > 0 ? merged : ['/Pictures/placeholder.jpg'];
  }, [product]);

  const galleryThumbnails = useMemo(() => productImages.slice(0, 6), [productImages]);

  useEffect(() => {
    setSelected(0);
  }, [matchedProductId]);

  useEffect(() => {
    if (selected > productImages.length - 1) {
      setSelected(0);
    }
  }, [productImages, selected]);

  const displayPrice = useMemo(() => {
    const price = Number(product?.price ?? 0);
    return `R ${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }, [product?.price]);

  const stockQuantity = useMemo(() => {
    if (!product) return 0;
    if (typeof product.stockQuantity === 'number') return product.stockQuantity;
    if (typeof product.stock === 'number') return product.stock;
    return 0;
  }, [product]);

  const relatedCategoryProducts = useMemo(() => {
    const currentProductId = product?._id;
    return relatedProducts
      .filter((item) => item?._id && item._id !== currentProductId)
      .slice(0, 6);
  }, [product?._id, relatedProducts]);

  const formatPrice = (price) => {
    const amount = Number(price ?? 0);
    return `R ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const reviewCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviewStats.ratingDistribution.forEach((ratingValue) => {
      const rounded = Math.round(Number(ratingValue));
      if (counts[rounded] !== undefined) {
        counts[rounded] += 1;
      }
    });
    return counts;
  }, [reviewStats.ratingDistribution]);

  const averageRating = useMemo(() => Number(product?.rating || reviewStats.averageRating || 0), [product?.rating, reviewStats.averageRating]);
  const totalReviewCount = useMemo(() => Number(product?.numReviews || reviewStats.totalReviews || 0), [product?.numReviews, reviewStats.totalReviews]);

  const renderStars = (rating, size = '18px') => {
    const safeRating = Math.max(0, Math.min(5, Number(rating || 0)));
    const filledStars = Math.round(safeRating);
    return (
      <span className="review-stars" style={{ fontSize: size }} aria-label={`${safeRating.toFixed(1)} out of 5`}>
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className={index < filledStars ? 'star-filled' : 'star-empty'}>
            ★
          </span>
        ))}
      </span>
    );
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setSubmitReviewError('Please sign in to write a review.');
      setSubmitReviewSuccess('');
      return;
    }

    if (!reviewComment.trim()) {
      setSubmitReviewError('Please write your review before submitting.');
      setSubmitReviewSuccess('');
      return;
    }

    try {
      setIsSubmittingReview(true);
      setSubmitReviewError('');
      setSubmitReviewSuccess('');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/reviews/${matchedProductId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating: selectedRating,
          comment: reviewComment.trim()
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || 'Unable to submit review.');
      }

      setReviewComment('');
      setSelectedRating(5);
      setSubmitReviewSuccess('Review submitted successfully.');
      await fetchProductReviews();
    } catch (error) {
      setSubmitReviewError(error?.message || 'Failed to submit review.');
      setSubmitReviewSuccess('');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Navigation handlers for modal
  const handlePrev = (e) => {
    e.stopPropagation();
    setSelected((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };
  const handleNext = (e) => {
    e.stopPropagation();
    setSelected((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };
  const handleClose = () => setFullscreen(false);

  return (
    <>
      <div className="container">
        {isLoading && (
          <div className="empty-state">
            <h3>Loading product...</h3>
          </div>
        )}
        {!isLoading && fetchError && (
          <div className="empty-state">
            <h3>Could not load product</h3>
            <p>{fetchError}</p>
          </div>
        )}
      </div>
      {!isLoading && !fetchError && product && (
      <>
      {/* Fullscreen Modal Overlay */}
      {fullscreen && (
        <ImageModal
          images={productImages}
          currentIndex={selected}
          onClose={handleClose}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
      <div className="container product-detail-section">
        <div className="mainContent">
          {/* Left: Images */}
          <div className="leftImages" style={{ maxWidth: 560, width: '100%' }}>
            <div className="imageFlexRow" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div className="mainImageContainer" style={{ position: 'relative', width: 420, maxWidth: 'calc(100vw - 160px)' }}>
                <Image src={productImages[selected]} alt={`${product.name} ${selected + 1}`} width={420} height={420} unoptimized style={{ borderRadius: 10, objectFit: 'contain', border: '1px solid #eee', cursor: 'pointer', width: '100%', maxWidth: 420, height: 420, background: '#fff' }} onClick={() => setFullscreen(true)} />
                <button onClick={() => setFullscreen(true)} title="View Fullscreen" style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
                  <svg width="22" height="22" fill="#fff" viewBox="0 0 24 24"><path d="M9 3H5a2 2 0 0 0-2 2v4a1 1 0 1 0 2 0V5h4a1 1 0 1 0 0-2zm6 0a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0V5a2 2 0 0 0-2-2h-4zm5 14a1 1 0 0 0-1 1v4h-4a1 1 0 1 0 0 2h4a2 2 0 0 0 2-2v-4a1 1 0 0 0-1-1zm-16 1a1 1 0 0 0-1 1v4a2 2 0 0 0 2 2h4a1 1 0 1 0 0-2H5v-4a1 1 0 0 0-1-1z"/></svg>
                </button>
              </div>
              <div className="thumbnails" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Thumbnails */}
                {galleryThumbnails.map((img, idx) => (
                  <div key={img} style={{ border: idx === selected ? '2px solid #2563eb' : '1px solid #eee', borderRadius: 6, cursor: 'pointer', padding: 2, background: idx === selected ? '#e0e7ff' : '#fff' }} onClick={() => setSelected(idx)}>
                    <Image src={img} alt={`${product.name} thumb ${idx + 1}`} width={72} height={72} unoptimized style={{ borderRadius: 6, objectFit: 'cover', width: 72, height: 72 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Right: Details */}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '2.1rem', marginBottom: 8, fontWeight: 700 }}>{product.name}</h1>
            <div style={{ color: '#2563eb', fontWeight: 600, marginBottom: 6 }}>{product.specifications?.brand || product.category}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              {renderStars(averageRating)}
              <span style={{ color: '#666', fontSize: 15 }}>({totalReviewCount} Reviews)</span>
            </div>
            <div style={{ fontSize: 28, color: '#2563eb', fontWeight: 700, margin: '18px 0 10px 0' }}>{displayPrice}</div>
            <div style={{ color: stockQuantity > 0 ? '#16a34a' : '#dc2626', fontWeight: 500, marginBottom: 8 }}>
              {stockQuantity > 0 ? `${stockQuantity} in stock` : 'Out of stock'}
            </div>
            <div style={{ background: '#f3f4f6', borderRadius: 6, padding: '0.75rem 1rem', marginBottom: 16, fontSize: 15 }}>
              <div>Free Delivery Available.</div>
              <div>Ships in 3 - 5 work days.</div>
              <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>Hassle-Free Exchanges & Returns for 30 Days</div>
            </div>
            <button
              style={{ background: '#2563eb', color: '#fff', padding: '0.9rem 2.5rem', border: 'none', borderRadius: 5, fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}
              onClick={() => {
                if (!product?._id) {
                  console.error('Cannot add product to cart: missing product id', { slug: slugValue });
                  return;
                }
                addToCart(product._id, 1, {
                  name: product.name,
                  price: product.price,
                  image: productImages[0]
                });
              }}
              disabled={stockQuantity === 0}
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
              <b>Description:</b> {product.description}
            </div>
            <ul style={{ margin: '1rem 0', paddingLeft: 20, color: '#444', fontSize: 15 }}>
              {Object.entries(product.specifications || {}).length > 0 ? (
                Object.entries(product.specifications || {}).map(([key, value]) => (
                  <li key={key}>
                    <b>{key.charAt(0).toUpperCase() + key.slice(1)}:</b>{' '}
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </li>
                ))
              ) : (
                <li>No additional specifications available.</li>
              )}
            </ul>
          </div>
        </div>
        <div className="reviews-section-wrapper">
          <div className="reviews-summary-panel">
            <h2 className="reviews-title">Reviews</h2>
            <div className="reviews-average-value">{averageRating.toFixed(1)}</div>
            <div className="reviews-average-stars">{renderStars(averageRating, '22px')}</div>
            <div className="reviews-count-label">{totalReviewCount} Reviews</div>
            <div className="reviews-distribution">
              {[5, 4, 3, 2, 1].map((ratingLevel) => {
                const count = reviewCounts[ratingLevel] || 0;
                const widthPercent = totalReviewCount > 0 ? (count / totalReviewCount) * 100 : 0;
                return (
                  <div key={ratingLevel} className="distribution-row">
                    <span className="distribution-label">{ratingLevel} ★</span>
                    <div className="distribution-track">
                      <div className="distribution-fill" style={{ width: `${widthPercent}%` }} />
                    </div>
                    <span className="distribution-count">{count}</span>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              className="write-review-button"
              onClick={() => document.getElementById('write-review-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              Write Review
            </button>
          </div>

          <div className="reviews-list-panel">
            <div className="reviews-list-header">
              <strong>
                1 to {Math.min(reviews.length, 20)} of {totalReviewCount} Reviews
              </strong>
            </div>
            {reviewsLoading && <p className="reviews-muted">Loading reviews...</p>}
            {!reviewsLoading && reviewsError && <p className="reviews-error">{reviewsError}</p>}
            {!reviewsLoading && !reviewsError && reviews.length === 0 && (
              <p className="reviews-muted">No reviews yet. Be the first to write one.</p>
            )}
            {!reviewsLoading &&
              !reviewsError &&
              reviews.map((review) => (
                <article key={review._id} className="review-item">
                  <div>{renderStars(review.rating, '20px')}</div>
                  <h4 className="review-author-line">
                    {review?.user?.username || 'Anonymous'} - {new Date(review.createdAt).toLocaleDateString()}
                  </h4>
                  <p className="review-comment">{review.comment}</p>
                </article>
              ))}
          </div>
        </div>

        <div id="write-review-form" className="review-form-panel">
          <h3>Write a Review</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="review-rating-picker">
              {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    className={`rating-star-btn ${value <= selectedRating ? 'active' : ''}`}
                    onClick={() => setSelectedRating(value)}
                    aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                );
              })}
            </div>
            <textarea
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              placeholder="Share your experience with this product"
              rows={4}
              className="review-comment-input"
            />
            {submitReviewError && <p className="reviews-error">{submitReviewError}</p>}
            {submitReviewSuccess && <p className="reviews-success">{submitReviewSuccess}</p>}
            <button type="submit" className="submit-review-button" disabled={isSubmittingReview}>
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
        <hr style={{ margin: '3rem 0 0 0', border: 'none', borderTop: '1.5px solid #e5e7eb' }} />
        <div style={{ position: 'relative', left: '50%', right: '50%', width: '100vw', transform: 'translateX(-50%)', height: '40px', background: '#f3f4f6', margin: '0 0 2rem 0', borderRadius: 0 }} />
        <div style={{ marginTop: 0, textAlign: 'center', padding: '2rem 0', background: '#f8fafc', borderRadius: 10 }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 18, textAlign: 'center' }}>You Might Also Like</h2>
          <div className="you-might-like-slider">
            {relatedCategoryProducts.length > 0 ? relatedCategoryProducts.map((item) => {
              const imageCandidate = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : item.image;
              const itemImage = normalizeProductImagePath(imageCandidate) || '/Pictures/placeholder.jpg';

              return (
                <div key={item._id} style={{ minWidth: 180, maxWidth: 220, height: 260, background: '#f9fafb', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 12, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', scrollSnapAlign: 'start' }}>
                  <div style={{ width: 120, height: 120, margin: '0 auto 8px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 6 }}>
                    <Image src={itemImage} alt={item.name || 'Related product'} width={120} height={120} unoptimized style={{ objectFit: 'contain', width: '100%', height: '100%', borderRadius: 6 }} />
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.name || 'Product'}</div>
                  <div style={{ color: '#2563eb', fontWeight: 600, marginBottom: 4 }}>{formatPrice(item.price)}</div>
                  <Link
                    href={buildProductDetailHref(item)}
                    style={{ background: '#2563eb', color: '#fff', padding: '0.5rem 1.2rem', border: 'none', borderRadius: 4, fontSize: '0.95rem', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}
                  >
                    View
                  </Link>
                </div>
              );
            }) : (
              <div style={{ width: '100%', color: '#6b7280', textAlign: 'center', padding: '1rem' }}>
                No related products found in this category yet.
              </div>
            )}
          </div>
        </div>
      </div>
      </>
      )}
    </>
  );
}
