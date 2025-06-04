import { Inter } from 'next/font/google';
import Navbar from './components/Navbar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Horizon E-commerce',
  description: 'Your one-stop shop for all your needs',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
} 