import { Inter } from 'next/font/google';
import './assets/css/navbar.css';
import './assets/css/buttons.css';
import './assets/css/product.css';
import './assets/css/footer.css';
import './assets/css/authlayout.css';

import { CartProvider } from './components/cart/Cart';
import AuthLayoutWrapper from './components/AuthLayoutWrapper.js';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Horizon E-commerce',
  description: 'Your one-stop shop for all your needs',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <AuthLayoutWrapper>
            {children}
          </AuthLayoutWrapper>
        </CartProvider>
      </body>
    </html>
  );
}