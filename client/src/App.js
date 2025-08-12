import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './app/components/navbar/Navbar';

function App() {
  return (
    <Router>
      <div className="App">
        {/* <Navbar /> */}
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/products" element={<div>Products Page</div>} />
          <Route path="/categories" element={<div>Categories Page</div>} />
          <Route path="/deals" element={<div>Deals Page</div>} />
          <Route path="/cart" element={<div>Cart Page</div>} />
          <Route path="/account" element={<div>Account Page</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 