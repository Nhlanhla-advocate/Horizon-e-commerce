'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaShoppingCart, FaUser, FaSearch } from 'react-icons/fa';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-flex">
                    {/* Logo and navigation */}
                    <Link href="/" className="navbar-logo">
                        <h1>Horizon</h1>
                    </Link>
                    <div className="navbar-nav">
                        <Link href="/" className="navbar-link">Home</Link>
                        <Link href="/products" className="navbar-link">Products</Link>
                        <Link href="/categories" className="navbar-link">Categories</Link>
                        <Link href="/deals" className="navbar-link">Deals</Link>  
                    </div>
                </div>

                {/* Search bar */}
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

                    {/* Right side icons */}
                    <div className="navbar-icons">
                        <Link href="/cart" className="navbar-icon-link">
                            <FaShoppingCart />
                        </Link>
                        <Link href="/account" className="navbar-icon-link">
                            <FaUser />
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="navbar-mobile-button-container">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="navbar-mobile-button"
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg
                                className={isMenuOpen ? 'hidden' : 'block'}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <svg
                                className={isMenuOpen ? 'block' : 'hidden'}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 