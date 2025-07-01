'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaShoppingCart, FaUser, FaSearch, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

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
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 