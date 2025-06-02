import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { faShoppingCart, FaUser, FaSearch } from 'react-icons/fa';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-flex">
                    <div className="navbar-left">
                        <Link to="/" className="navbar-logo">
                            <h1>Horizon</h1>
                        </Link>
                            <div className="navbar-nav">
                             <Link to="/" className="navbar-link">Home</Link>
                                <Link to="/products" className="navbar-link">Products</Link>
                                <Link to="/categories" className="navbar-link">Categories</Link>
                                <Link to="/deals" className="navbar-link"> Deals </Link>
                            </div>
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
                                        </div>
                                    </div>
                                </nav>
                            );
                        };
            
