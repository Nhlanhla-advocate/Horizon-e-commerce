'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FaShoppingCart, FaUser, FaUserCircle, FaTimes, FaSignOutAlt, FaTachometerAlt, FaSpinner } from 'react-icons/fa';
import { useCart } from '@/app/components/cart/Cart';
import "../../assets/css/navbar.css";

const normalizeRole = (roleValue) =>
  String(roleValue || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

const ALLOWED_DASHBOARD_ROLES = new Set(['admin', 'super_admin']);

const readAuthFromStorage = () => {
  try {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    const adminRole = normalizeRole(localStorage.getItem('adminRole'));
    return {
      isAuthed: Boolean(token),
      hasAdminAccess: Boolean(adminToken) && ALLOWED_DASHBOARD_ROLES.has(adminRole),
    };
  } catch {
    return { isAuthed: false, hasAdminAccess: false };
  }
};

const Navbar = () => {
  const { cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const syncAuthState = useCallback(() => {
    const { isAuthed: authed, hasAdminAccess: adminAccess } = readAuthFromStorage();
    setIsAuthed(authed);
    setHasAdminAccess(adminAccess);
    setAuthReady(true);
  }, []);

  useEffect(() => {
    syncAuthState();
    window.addEventListener('storage', syncAuthState);
    window.addEventListener('horizon-auth-change', syncAuthState);
    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('horizon-auth-change', syncAuthState);
    };
  }, [syncAuthState]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const clearLocalAuth = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRole');
      // Drop cached cart so guest browsing does not keep the previous account's items
      localStorage.removeItem('localCart');
      localStorage.removeItem('lastCheckedUserId');
      localStorage.removeItem('guestId');
    } catch {}

    setIsAuthed(false);
    setHasAdminAccess(false);
    window.dispatchEvent(new Event('horizon-auth-change'));
  };

  const handleLogout = useCallback(async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);

    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const postSignOut = (url, authToken) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      return fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal: controller.signal,
      })
        .catch(() => {})
        .finally(() => clearTimeout(timeoutId));
    };

    try {
      if (token) {
        await postSignOut(`${apiBase}/auth/signout`, token);
      }
      if (adminToken) {
        await postSignOut(`${apiBase}/admin/signout`, adminToken);
      }
    } catch (e) {
      console.error('Signout error:', e);
    } finally {
      clearLocalAuth();
      setIsSigningOut(false);
      router.push('/');
      router.refresh?.();
    }
  }, [isSigningOut, router]);

  const isLoggedIn = isAuthed || hasAdminAccess;
  const accountHref = hasAdminAccess ? '/admin' : '/account';

  const renderSignInLink = (variant) => {
    const className = variant === 'mobile'
      ? 'navbar-mobile-icon-btn navbar-signin-link'
      : 'navbar-icon-link navbar-signin-link';

    return (
      <Link href="/auth/signin" className={className} aria-label="Sign in">
        <FaUser />
        {variant === 'desktop' && <span className="navbar-auth-label">Sign in</span>}
      </Link>
    );
  };

  const renderAccountLink = (variant) => {
    const className = variant === 'mobile'
      ? 'navbar-mobile-icon-btn navbar-account-link'
      : 'navbar-icon-link navbar-account-link';

    return (
      <Link
        href={accountHref}
        className={className}
        aria-label={hasAdminAccess ? 'Admin dashboard' : 'My account'}
      >
        <FaUserCircle />
        {variant === 'desktop' && <span className="navbar-auth-label">Account</span>}
      </Link>
    );
  };

  const renderLogoutButton = (variant, classNameExtra = '') => {
    const className = [
      variant === 'mobile' ? 'navbar-mobile-icon-btn navbar-logout-btn' : 'navbar-icon-link navbar-logout-btn',
      classNameExtra,
    ].filter(Boolean).join(' ');

    return (
      <button
        type="button"
        className={className}
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          handleLogout();
        }}
        aria-label="Log out"
        aria-busy={isSigningOut}
      >
        {isSigningOut ? <FaSpinner className="animate-spin" /> : <FaSignOutAlt />}
        {variant === 'desktop' && (
          <span className="navbar-auth-label">{isSigningOut ? 'Logging out...' : 'Log out'}</span>
        )}
      </button>
    );
  };

  const renderAuthControls = (variant) => {
    if (!authReady) {
      return null;
    }

    if (isLoggedIn) {
      return (
        <>
          {renderLogoutButton(variant)}
          {renderAccountLink(variant)}
        </>
      );
    }

    if (isSigningOut) {
      return renderLogoutButton(variant, 'navbar-logout-btn--pending');
    }

    return renderSignInLink(variant);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-mobile-row">
          <button
            className="navbar-burger"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Open menu"
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
            <Link href="/cart" className="navbar-mobile-icon-btn" aria-label="Cart">
              <div className="cart-icon-container">
                <FaShoppingCart />
                {cartCount > 0 && (
                  <span className="cart-badge">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
            </Link>
            {renderAuthControls('mobile')}
          </div>
        </div>

        <div className="navbar-flex">
          <div className="navbar-left">
            <Link href="/" className="navbar-logo">
              <h1>Horizon</h1>
            </Link>
          </div>

          <div className="navbar-nav navbar-nav-right">
            <Link href="/" className="navbar-link">Home</Link>
            <Link href="/products" className="navbar-link">Products</Link>
            <Link href="/categories" className="navbar-link">Categories</Link>
            <Link href="/deals" className="navbar-link">Deals</Link>
          </div>

          <div className="navbar-icons">
            {hasAdminAccess && (
              <Link href="/admin" className="navbar-icon-link" aria-label="Admin dashboard">
                <FaTachometerAlt />
              </Link>
            )}
            <Link href="/cart" className="navbar-icon-link cart-link" aria-label="Cart">
              <div className="cart-icon-container">
                <FaShoppingCart />
                {cartCount > 0 && (
                  <span className="cart-badge">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
            </Link>
            {renderAuthControls('desktop')}
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="navbar-mobile-menu">
            <button
              className="navbar-mobile-menu-close"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <FaTimes />
            </button>
            <Link href="/" className="navbar-link">Home</Link>
            <Link href="/products" className="navbar-link">Products</Link>
            <Link href="/categories" className="navbar-link">Categories</Link>
            <Link href="/deals" className="navbar-link">Deals</Link>
            {isLoggedIn && (
              <>
                <Link href={accountHref} className="navbar-link navbar-mobile-menu-account">
                  Account
                </Link>
                <button
                  type="button"
                  className="navbar-link navbar-mobile-menu-logout"
                  onClick={(event) => {
                    event.preventDefault();
                    handleLogout();
                  }}
                >
                  {isSigningOut ? 'Logging out...' : 'Log out'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
