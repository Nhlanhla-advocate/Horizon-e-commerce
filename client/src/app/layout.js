import { Inter } from 'next/font/google';
import './Styles/style.css';
import './Styles/navbar.css';
import './Styles/buttons.css';
import './Styles/product.css';
import './Styles/footer.css';
import { CartProvider } from './cart/Cart';
import Footer from './components/Footer';
import { FaShoppingCart } from 'react-icons/fa';


const inter = Inter({ subsets: ['latin'] });


export const metadata = {
  title: 'Horizon E-commerce',
  description: 'Your one-stop shop for all your needs',
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
