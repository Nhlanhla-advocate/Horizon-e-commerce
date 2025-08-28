'use client';

import { usePathname } from 'next/navigation';
import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/Footer';

export default function layouClient({ children }) {
    const pathname = usePathname();

    const isAuthPage = 
    pathname === '/auth/signin' ||
    pathname === '/auth/signup' ||
    pathname === '/auth/forgotpassword' ||
    pathname === '/auth/resetpassword';

    if (isAuthPage) {
        return <div className= 'auth-layout'>{children}</div>;
    }

    return (
        <>
        <Navbar />
        {children}
        <Footer />
        </>
    );
}