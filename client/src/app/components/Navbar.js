'use client';

import React from 'react';
import Link from 'next/link';
import { FaShoppingCart, FaUser, FaSearch } from 'react-icons/fa';


const Navbar = () => {
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
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 