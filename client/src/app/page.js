'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from './components/cart/Cart';

const Products = () => {
    const { addToCart } = useCart();
    
    const products = [
        {
            id: 1,
            name: 'PlayStation 5 Digital',
            _id: '687758601f8fda62d2898c43',
            price: 12000.00,
            image: '/Pictures/Playstation 5 Digital.jpg',
            slug: 'playstation-5-digital',
            description: 'Digital edition PlayStation 5',
            category: 'consoles',
            stockQuantity: 10
        },
        {
            id: 2,
            name: 'PlayStation 4 Slim',
            _id: 'ps4-slim-placeholder-id',
            price: 4000.00,
            image: '/Pictures/Playstation 4 Slim.jpg',
            slug: 'playstation-4-slim',
            description: 'Slim version of PlayStation 4',
            category: 'consoles',
            stockQuantity: 0   // Out of stock
        },
        {
            id: 3,
            name: 'PlayStation 4',
            _id: '68a5651b427b2be32fafb36d',
            price: 3000.00,
            image: '/Pictures/Playstation 4.jpg',
            slug: 'playstation-4',
            description: 'Standard PlayStation 4',
            category: 'consoles',
            stockQuantity: 3
        },
        {
            id: 4,
            name: 'PlayStation 5 Disk',
            _id: '68a563dc8597038db441354b',
            price: 16500.00,
            image: '/Pictures/Playstation 5 disk.jpg',
            slug: 'playstation-5-disk',
            description: 'Disk edition PlayStation 5',
            category: 'consoles',
            stockQuantity: 12
        },
        {
            id: 5,
            name: 'PlayStation 5 Pro',
            _id: '68a564b8ac286caca9d2bf0a',
            price: 19500.00,
            image: '/Pictures/Playstation 5 pro.jpg',
            slug: 'playstation-5-pro',
            description: 'Pro version PlayStation 5',
            category: 'consoles',
            stockQuantity: 8
        },
        {
            id: 6,
            name: 'PlayStation 4 Pro',
            _id: '68a56573a6d3751170b258a9',
            price: 12000.00,
            image: '/Pictures/Playstation 4 pro.jpg',
            slug: 'playstation-4-pro',
            description: 'Pro version PlayStation 4',
            category: 'consoles',
            stockQuantity: 5
        }
    ];

    // Format price function (same as products page)
    const formatPrice = (price) => {
        return `R ${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    };

    // Debug: check if products are loading
    console.log('Products loaded:', products);

    return (
        <div className="products-page-container">
            <div className="page-header">
                <h1 className="page-title">Featured Products</h1>
                <p className="page-description">Discover our most popular gaming products</p>
            </div>
            
            <div className="products-grid">
                {products.map((product) => {
                    // Debug each product
                    console.log('Rendering product:', product.name, 'ID:', product._id);
                    
                    return (
                        <div key={product.id} className="product-card">
                            <div className="product-image-container"> 
                                <Link href={`/products/${product.slug}`}>
                                    <div className="image-wrapper">
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            className="product-image"
                                            width={250}
                                            height={250}
                                            style={{ objectFit: 'cover' }}
                                        />
                                        {product.stockQuantity === 0 && (
                                            <div className="out-of-stock-badge">Out of Stock</div>
                                        )}
                                    </div>
                                </Link>
                            </div>
                            <div className="product-info">
                                <Link href={`/products/${product.slug}`}>
                                    <h3 className="product-name">{product.name}</h3>
                                </Link>
                                <div className="product-category">{product.category}</div>
                                <div className="product-price">{formatPrice(product.price)}</div>
                                <div className="product-stock">
                                    {product.stockQuantity > 0 ? (
                                        <span className="in-stock">{product.stockQuantity} in stock</span>
                                    ) : (
                                        <span className="out-of-stock">Out of stock</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="add-to-cart-button"
                                    onClick={() => {
                                        console.log('Add to Cart clicked for:', product.name, 'id:', product._id);
                                        addToCart(
                                            product._id,
                                            1,
                                            {
                                                name: product.name,
                                                price: product.price,
                                                image: product.image,
                                                description: product.description,
                                                category: product.category
                                            }
                                        );
                                    }}
                                    disabled={product.stockQuantity === 0}
                                >
                                    <span className="button-content">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="cart-icon" width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                        </svg>
                                        <span>Add to Cart</span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Products;