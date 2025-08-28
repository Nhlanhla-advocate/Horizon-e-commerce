'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../components/cart/Cart';
import './productsPage.css';

const productsPage = () => {
    const { addToCart } = useCart();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortOption, setSortOption] = useState('default');

    const products = [
        {
            id: 1,
            name: 'PlayStation 5 Digital',
            _id: '687758601f8fda62d2898c43',
            price: 12000.00,
            image: '/Pictures/Playstation 5 Digital.jpg',
            slug: 'playstation-5-digital',
            description: 'Digital edition Playstation 5',
            category: 'consoles'
        },
        {
            id: 2,
            name: 'PlayStation 4 Slim',
            _id: 'ps4-slim-placeholder-id',
            price:4000.00,
            image: '/Pictures/Playstation 4 Slim.jpg',
            slug: 'playstation-4-slim',
            description: 'Slim version of PlayStation 4',
            category: 'consoles'
        },
        {
            id: 3,
            name: 'PlayStation 4',
            _id: '68a5651b427b2be32fafb36d',
            price: 3000.00,
            image: '/Pictures/Playstation 4.jpg',
            slug: 'playstation-4',
            description: 'Standard PlayStation 4',
            category: 'consoles'
        },
        {
            id: 4,
            name: 'PlayStation 5 Disk',
            _id: '68a563dc8597038db441354b',
            price: 16500.00,
            image: '/Pictures/Playstation 5 disk.jpg',
            slug: 'playstation-5-disk',
            description: 'Disk edition PlayStation 5',
            category: 'consoles'
        },
    ];

    // Extract all categories
    const categories = ['all', ...new Set(products.map(product => product.category))];

    // Filter products
    const filterProducts = selectedCategory === 'all'
    ? products
    :products.filter(product => product.category === selectedCategory);

    // Sort products based on selected options
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortOption === 'price-low') return a.price - b.price;
        if (sortOption === 'price-high') return b.price - a.price;
        if (sortOption === 'name') return a.name.localeCompare(b.name);
        return a.id - b.id;
    });
}