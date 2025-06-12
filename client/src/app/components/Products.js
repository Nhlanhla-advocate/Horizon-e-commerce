'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import '../../app/globals.css';

const Products = () => {
    const products = [
        {
            id: 1,
            name: 'PlayStation 5 Digital',
            price: 399.99,
            image: '/Pictures/Playstation 5 Digital.jpg'
        },
        {
            id: 2,
            name: 'PlayStation 4 Slim',
            price: 299.99,
            image: '/Pictures/Playstation 4 Slim.jpg'
        },
        {
            id: 3,
            name: 'PlayStation 4',
            price: 279.99,
            image: '/Pictures/Playstation 4.jpg'
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
                            <div className="product-price">R{product.price}</div>
                            <button className="add-to-cart-button">Add to Cart</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Products;
