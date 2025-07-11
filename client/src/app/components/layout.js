import { Inter } from 'next/font/google';
import './assets/css/style.css';
import './assets/css/navbar.css';
import './assets/css/buttons.css';
import './assets/css/product.css';
import './assets/css/footer.css';
import '../assets/css/navbar.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Horizon E-commerce',
  description: 'Your one-stop shop for all your needs',
};

export default function RootLayout({ children }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}