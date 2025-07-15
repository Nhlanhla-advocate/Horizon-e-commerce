'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaShoppingCart, FaUser, FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { useCart } from './Cart';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const { cartCount } = useCart();

    // Close menu/search on navigation (optional improvement)
    const handleNavClick = () => {
        setMenuOpen(false);
        setSearchOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Mobile Layout */}
                <div className="navbar-mobile-row">
                    <Link href="/" className="navbar-logo" onClick={handleNavClick}>
                        <h1>Horizon</h1>
                    </Link>
                    <button
                        className="navbar-burger"
                        aria-label="Toggle menu"
                        onClick={() => setMenuOpen((v) => !v)}
                    >
                        {menuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                    <div className="navbar-mobile-icons">
                        <button
                            className="navbar-mobile-icon-btn"
                            aria-label="Search"
                            onClick={() => setSearchOpen((v) => !v)}
                        >
                            <FaSearch />
                        </button>
                        <Link href="/cart" className="navbar-icon-link" onClick={handleNavClick}>
                            <FaShoppingCart />
                        </Link>
                        <Link href="/account" className="navbar-icon-link" onClick={handleNavClick}>
                            <FaUser />
                        </Link>
                    </div>
                </div>

                {/* Mobile Search Input Overlay */}
                {searchOpen && (
                    <div className="navbar-mobile-search-overlay">
                        <div className="navbar-search-relative">
                            <div className="navbar-search-icon">
                                <FaSearch />
                            </div>
                            <input
                                className="navbar-search-input"
                                placeholder="Search products..."
                                type="search"
                                autoFocus
                            />
                        </div>
                    </div>
                )}

                {/* Mobile Dropdown Menu */}
                {menuOpen && (
                    <div className="navbar-mobile-menu">
                        <Link href="/" className="navbar-link" onClick={handleNavClick}>Home</Link>
                        <Link href="/products" className="navbar-link" onClick={handleNavClick}>Products</Link>
                        <Link href="/categories" className="navbar-link" onClick={handleNavClick}>Categories</Link>
                        <Link href="/deals" className="navbar-link" onClick={handleNavClick}>Deals</Link>
                    </div>
                )}

                {/* Desktop Layout */}
                <div className="navbar-flex">
                    <Link href="/" className="navbar-logo">
                        <h1>Horizon</h1>
                    </Link>
                    <div className="navbar-nav">
                        <Link href="/" className="navbar-link">Home</Link>
                        <Link href="/products" className="navbar-link">Products</Link>
                        <Link href="/categories" className="navbar-link">Categories</Link>
                        <Link href="/deals" className="navbar-link">Deals</Link>
                    </div>
                    <div className="navbar-search-container">
                        <div className="navbar-search-wrapper">
                            <div className="navbar-search-relative">
                                <div className="navbar-search-icon">
                                    <FaSearch />
                                </div>
                                <input
                                    className="navbar-search-input"
                                    placeholder="Search products..."
                                    type="search"
                                />
                            </div>
                        </div>
                        <div className="navbar-icons">
                            <Link href="/cart" className="navbar-icon-link">
                                <FaShoppingCart />
                            </Link>
                            <Link href="/account" className="navbar-icon-link">
                                <FaUser />
                            </Link>
                        </div>
                    </div>
                    <div className="navbar-cart">
                        <a href="/cart" className="cart-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24"><path d="M7 18c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm10 0c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm-12.293-2.707l1.414 1.414c.39.39 1.024.39 1.414 0l12.293-12.293c.39-.39.39-1.024 0-1.414l-1.414-1.414c-.39-.39-1.024-.39-1.414 0l-12.293 12.293c-.39.39-.39 1.024 0 1.414zm13.293-10.293l-1.293 1.293-10.293 10.293-1.293-1.293 10.293-10.293 1.293-1.293zm-13.293 13.293l1.293 1.293 10.293-10.293 1.293 1.293-10.293 10.293-1.293-1.293z"/></svg>
                            {cartCount > 0 && (
                                <span className="cart-badge">{cartCount}</span>
                            )}
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 