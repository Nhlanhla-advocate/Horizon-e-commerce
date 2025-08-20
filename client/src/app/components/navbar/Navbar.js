'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaShoppingCart, FaUser, FaSearch, FaSpinner } from 'react-icons/fa';
import { useCart } from '../cart/Cart';
import "../../assets/css/navbar.css";

const Navbar = () => {
  const { cartCount, isLoading } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    console.log('Navbar cartCount changed:', cartCount);
  }, [cartCount]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
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

          {/* Search bar */}
          <div className="navbar-search-container">
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
            <Link href="/account" className="navbar-icon-link">
              <FaUser />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;