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
    ]
}