import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSearch } from 'react-icons/fa';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="navbar">
          <div className="navbar-container">
            <div className="navbar-flex">

              {/* Logo and navigation */}
                <Link to="/" className="navbar-logo">
                    <h1>Horizon</h1>
                </Link>
                <div className="navbar-nav">
                  <link to="/" className=" navbar-link">Home</link>
                  <link to="/products" className="navbar-link">Products</link>
                  <link to="/categories" className="navbar-link">Categories</link>
                  <link to="/deals" className="navbar-link">Deals</link>  
                </div>
            </div>

            {/* Search bar */}
            <div className="navbar-search-container">
              <div className="navbar-search-wrapper">
                <div className="navbar-search-relative">
                  <div className="navbar-search-icon">
                    <FaSearch />
                  </div>
                  <input className="navbar-search-input"
                  placeholder="Search products..."
                  type="search"
                  />
                </div>
              </div>

              {/* Right side icons */}
              <div className="navbar-icons">
                <link to ="/cart" className="navbar-icon-link">
                  <FaShoppingCart />
                </link>
                <link to="/account" className="navbar-icon-link">
                  <FaUser />
                </link>
              </div>
            </div>
          </div>
        </nav>
    )
}
