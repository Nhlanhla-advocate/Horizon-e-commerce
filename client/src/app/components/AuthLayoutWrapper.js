'use client';

import { usePathname } from 'next/navigation';
import Navbar from "./navbar/Navbar";
import Footer from "./footer/Footer";

export default function AuthLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <>
      {!isAuthPage && !isAdminPage && <Navbar />}
      {children}
      {!isAuthPage && !isAdminPage && <Footer />}
    </>
  );
}
