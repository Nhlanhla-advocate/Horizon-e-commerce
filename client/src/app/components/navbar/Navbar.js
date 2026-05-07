'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FaShoppingCart, FaUser, FaSpinner, FaTimes, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';
import { useCart } from '@/app/components/cart/Cart';
import "../../assets/css/navbar.css";

const normalizeRole = (roleValue) =>
  String(roleValue || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

const ALLOWED_DASHBOARD_ROLES = new Set(['admin', 'super_admin']);

const Navbar = () => {
  const { cartCount, isLoading } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('Navbar cartCount changed:', cartCount);
  }, [cartCount]);

  useEffect(() => {
    const readAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const adminToken = localStorage.getItem('adminToken');
        const adminRole = normalizeRole(localStorage.getItem('adminRole'));
        setIsAuthed(Boolean(token));
        setHasAdminAccess(Boolean(adminToken) && ALLOWED_DASHBOARD_ROLES.has(adminRole));
      } catch {
        setIsAuthed(false);
        setHasAdminAccess(false);
      }
    };
    readAuth();
    window.addEventListener('storage', readAuth);
    return () => window.removeEventListener('storage', readAuth);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://localhost:5000/auth/signout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
      }
    } catch (e) {
      // Even if server signout fails, clear local auth state.
      console.error('Signout error:', e);
    } finally {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRole');
      } catch {}
      setIsAuthed(false);
      setHasAdminAccess(false);
      setIsSigningOut(false);
      router.push('/');
      router.refresh?.();
    }
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
            {hasAdminAccess && (
              <Link href="/admin" className="navbar-mobile-icon-btn" aria-label="Admin dashboard">
                <FaTachometerAlt />
              </Link>
            )}
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
            {isAuthed ? (
              <button
                type="button"
                className="navbar-mobile-icon-btn"
                onClick={handleLogout}
                aria-label="Log out"
                disabled={isSigningOut}
              >
                {isSigningOut ? <FaSpinner className="animate-spin" /> : <FaSignOutAlt />}
              </button>
            ) : (
              <Link href="/auth/signin" className="navbar-mobile-icon-btn" aria-label="Sign in">
                <FaUser />
              </Link>
            )}
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

          {/* Right side icons */}
          <div className="navbar-icons">
            {hasAdminAccess && (
              <Link href="/admin" className="navbar-icon-link" aria-label="Admin dashboard">
                <FaTachometerAlt />
              </Link>
            )}
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
            {isAuthed ? (
              <button
                type="button"
                className="navbar-icon-link navbar-logout-btn"
                onClick={handleLogout}
                aria-label="Log out"
                disabled={isSigningOut}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                {isSigningOut ? <FaSpinner className="animate-spin" /> : <FaSignOutAlt />}
              </button>
            ) : (
              <Link href="/auth/signin" className="navbar-icon-link" aria-label="Sign in">
                <FaUser />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="navbar-mobile-menu">
            <button 
              className="navbar-mobile-menu-close"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaTimes />
            </button>
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
      </div>
    </nav>
  );
};

export default Navbar;