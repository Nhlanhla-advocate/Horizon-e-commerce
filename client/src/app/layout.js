
import './assets/css/navbar.css';

export const metadata = {
  title: 'Horizon E-commerce',
  description: 'Your one-stop shop for gaming consoles and accessories',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
} 