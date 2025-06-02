import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { faShoppingCart, FaUser, FaSearch } from 'react-icons/fa';

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
          </div>
        </nav>
    )
}
