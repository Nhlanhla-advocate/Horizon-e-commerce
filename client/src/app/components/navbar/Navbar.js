'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FaShoppingCart, FaUser, FaSearch, FaSpinner, FaTimes } from 'react-icons/fa';
import { useCart } from '../cart/Cart';
import "../../assets/css/navbar.css";

const Navbar = () => {
  const { cartCount, isLoading } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('Navbar cartCount changed:', cartCount);
  }, [cartCount]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query as URL parameter
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Clear search after submitting
      setIsMobileSearchOpen(false); // Close mobile search if open
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Mobile Top Row */}
        <div className="navbar-mobile-row">
          <button 
            className="navbar-burger"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            ☰
          </button>
          
          <Link href="/" className="navbar-logo">
            <h1>Horizon</h1>
          </Link>
          
          <div className="navbar-mobile-icons">
            <button 
              className="navbar-mobile-icon-btn"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            >
              <FaSearch />
            </button>
            <Link href="/cart" className="navbar-mobile-icon-btn">
              <div className="cart-icon-container">
                {isLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <>
                    <FaShoppingCart />
                    {cartCount > 0 && (
                      <span className="cart-badge">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </>
                )}
              </div>
            </Link>
          </div>
        </div>

        <div className="navbar-flex">
          {/* Logo on the left */}
          <div className="navbar-left">
            <Link href="/" className="navbar-logo">
              <h1>Horizon</h1>
            </Link>
          </div>

          {/* Nav links on the right */}
          <div className="navbar-nav navbar-nav-right">
            <Link href="/" className="navbar-link">
              Home
            </Link>
            <Link href="/products" className="navbar-link">
              Products
            </Link>
            <Link href="/categories" className="navbar-link">
              Categories
            </Link>
            <Link href="/deals" className="navbar-link">
              Deals
            </Link>
          </div>

          {/* Search bar - Hidden on mobile when overlay is active */}
          <div className={`navbar-search-container ${isMobileSearchOpen ? 'hidden-mobile' : ''}`}>
            <form onSubmit={handleSearch} className="navbar-search-wrapper">
              <div className="navbar-search-relative">
                <div className="navbar-search-icon">
                  <FaSearch />
                </div>
                <input
                  className="navbar-search-input"
                  placeholder="Search products..."
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="navbar-search-clear"
                    onClick={clearSearch}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#666',
                      cursor: 'pointer'
                    }}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right side icons */}
          <div className="navbar-icons">
            <Link href="/cart" className="navbar-icon-link cart-link">
              <div className="cart-icon-container">
                {isLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <>
                    <FaShoppingCart />
                    {cartCount > 0 && (
                      <span className="cart-badge">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </>
                )}
              </div>
            </Link>
            <Link href="/auth/signin" className="navbar-icon-link">
              <FaUser />
            </Link>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="navbar-mobile-menu">
            <Link href="/" className="navbar-link">
              Home
            </Link>
            <Link href="/products" className="navbar-link">
              Products
            </Link>
            <Link href="/categories" className="navbar-link">
              Categories
            </Link>
            <Link href="/deals" className="navbar-link">
              Deals
            </Link>
          </div>
        )}

        {/* Mobile Search Overlay */}
        {isMobileSearchOpen && (
          <div className="navbar-mobile-search-overlay">
            <form onSubmit={handleSearch} className="navbar-search-wrapper">
              <div className="navbar-search-relative">
                <div className="navbar-search-icon">
                  <FaSearch />
                </div>
                <input
                  className="navbar-search-input"
                  placeholder="Search products..."
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="navbar-search-clear"
                    onClick={clearSearch}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#666',
                      cursor: 'pointer'
                    }}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;