'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import '../globals.css';
import '../assets/css/navbar.css';

const Products = () => {
    const products = [
        {
            id: 1,
            name: 'PlayStation 5 Digital',
            price: 12000.00,
            image: '/Pictures/Playstation 5 Digital.jpg'
        },
        {
            id: 2,
            name: 'PlayStation 4 Slim',
            price: 4000.00,
            image: '/Pictures/Playstation 4 Slim.jpg'
        },
        {
            id: 3,
            name: 'PlayStation 4',
            price: 3000.00,
            image: '/Pictures/Playstation 4.jpg'
        },
        {
            id: 4,
            name: 'PlayStation 5 Disk',
            price: 16500.00,
            image: '/Pictures/Playstation 5 disk.jpg'
        },
        {
            id: 5,
            name: 'PlayStation 5 Pro',
            price: 19500.00,
            image: '/Pictures/Playstation 5 pro.jpg'
        },
        {
            id: 6,
            name: 'PlayStation 4 Pro',
            price: 12000.00,
            image: '/Pictures/Playstation 4 pro.jpg'
        }
    ];

    return (
        <div className="products-container">
            <h2 className="products-title">Featured Products</h2>
            <div className="products-grid">
                {products.map((product) => (
                    <div key={product.id} className="product-card">
                        <div className="product-image-container">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="product-image"
                            />
                        </div>
                        <div className="product-info">
                            <h3 className="product-name">{product.name}</h3>
                            <div className="product-price">R {product.price.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            <button className="add-to-cart-button">
                                <span className="button-content">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="cart-icon" width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                    </svg>
                                    <span>Add to Cart</span>
                                </span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Products;
