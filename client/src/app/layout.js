
import './assets/css/style.css';
import './assets/css/navbar.css';
import './assets/css/buttons.css';
import './assets/css/product.css';

export const metadata = {
  title: 'Horizon E-commerce',
  description: 'Your one-stop shop for gaming consoles and accessories',
}

export default function RootLayout({ children }) {
  return <>{children}</>;
  }