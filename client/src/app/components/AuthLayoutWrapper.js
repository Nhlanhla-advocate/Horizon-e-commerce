'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import Footer from "./footer/Footer";

// Avoid SSR for the navbar so browser extensions (e.g. autofill) cannot inject attributes
// like fdprocessedid into server HTML before hydration and trigger mismatches.
const Navbar = dynamic(() => import('./navbar/Navbar'), { ssr: false });

export default function AuthLayoutWrapper({ children }) {
  const pathname = usePathname();
  const hideStoreChrome =
    pathname?.startsWith('/auth') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/superAdmin');

  return (
    <>
      {!hideStoreChrome && <Navbar />}
      {children}
      {!hideStoreChrome && <Footer />}
    </>
  );
}
