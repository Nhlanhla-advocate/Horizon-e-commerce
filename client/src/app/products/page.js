'use client'

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../components/cart/Cart';
import '../assets/css/product.css';

const ProductsPage = () => { // Changed to PascalCase
    const { addToCart } = useCart();

    const allProducts = [
        {
            id: 1,
            name: 'PlayStation 5 Digital',
            _id: '687758601f8fda62d2898c43',
            price: 12000.00,
            image: '/Pictures/Playstation 5 Digital.jpg',
            slug: 'playstation-5-digital',
            description: 'Digital edition Playstation 5',
            category: 'consoles',
            stockQuantity: 10
        },
        {
            id: 2,
            name: 'PlayStation 4 Slim',
            _id: 'ps4-slim-placeholder-id',
            price:4000.00,
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
        }
    ];

   const [products, setProducts] = useState(allProducts);
   const [filters, setFilters] = useState({ // Changed from 'filter' to 'filters'
    category: 'all',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    search: '',
    sort: 'id',
    order: 'asc'
   });

//    Extract unique categories
const categories = ['all', ...new Set(allProducts.map(product => product.category))];

// Filter and sort products based on current filters
useEffect(() => {
let filtered = [...allProducts];

// Apply category filter
if (filters.category !== 'all') {
    filtered = filtered.filter(product => product.category === filters.category);
}

// Apply price range filter
if (filters.minPrice) {
    filtered = filtered.filter(product => product.price >= parseFloat(filters.minPrice));
}

if (filters.maxPrice) {
    filtered = filtered.filter(product => product.price <= parseFloat(filters.maxPrice));
}

// Apply in stock filter
if (filters.inStock) {
    filtered = filtered.filter(product => product.stockQuantity > 0);
}

// Apply search filter
if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
}

// Apply sorting
filtered.sort((a, b) => {
    if (filters.sort === 'name') {
        return filters.order === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (filters.sort === 'price') {
        return filters.order === 'asc'
        ? a.price - b.price
        : b.price - a.price; 
    } else {
        return filters.order === 'asc'
        ? a.id - b.id
        : b.id - a.id;
    
    }
});

setProducts(filtered);
}, [filters]); 
// Handle filter changes
const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value}));
};

// Handle search
const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled automatically by the useEffect
};

// Reset filters
const resetFilters = () => {
    setFilters({
        category: 'all',
        minPrice: '',
        maxPrice: '',
        inStock: false,
        search: '',
        sort: 'id',
        order: 'asc'
    });
};

// Format price function to fix hydration error
const formatPrice = (price) => {
    return `R ${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

return (
    <div className="products-page-container">
        <div className="page-header">
            <h1 className="page-title">Our Products</h1>
            <p className="page-description">Browse our complete collection of gaming products</p>
        </div>
        
        {/* Search and Filters */}
        <div className="products-controls">
            <div className="search-box">
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={filters.search} // Changed from 'filter' to 'filters'
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                </form>
            </div>
            
            <div className="filters-section">
                <div className="filter-group">
                    <label>Category:</label>
                    <select 
                        value={filters.category} 
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="filter-select"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="filter-group">
                    <label>Price Range:</label>
                    <div className="price-range">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice} 
                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                            className="price-input"
                        />
                        <span>to</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice} // Changed from 'filter' to 'filters'
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            className="price-input"
                        />
                    </div>
                </div>
                
                <div className="filter-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={filters.inStock} // Changed from 'filter' to 'filters'
                            onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                            className="stock-checkbox"
                        />
                        In Stock Only
                    </label>
                </div>
                
                <div className="filter-group">
                    <label>Sort By:</label>
                    <select 
                        value={`${filters.sort}-${filters.order}`} // Changed from 'filter' to 'filters'
                        onChange={(e) => {
                            const [sort, order] = e.target.value.split('-');
                            handleFilterChange('sort', sort);
                            handleFilterChange('order', order);
                        }}
                        className="sort-select"
                    >
                        <option value="id-asc">Default</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="name-asc">Name: A to Z</option>
                        <option value="name-desc">Name: Z to A</option>
                    </select>
                </div>
                
                <button onClick={resetFilters} className="reset-filters-button">
                    Reset Filters
                </button>
            </div>
        </div>
        
        {/* Products Grid */}
        <div className="products-grid">
            {products.map((product) => (
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
                        <div className="product-price">{formatPrice(product.price)}</div> {/* Fixed hydration error */}
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
            ))}
        </div>
        
        {/* Empty state if no products match filter */}
        {products.length === 0 && (
            <div className="empty-state">
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms.</p>
                <button onClick={resetFilters} className="reset-filters-button">
                    Reset Filters
                </button>
            </div>
        )}
    </div>
);
};

export default ProductsPage; 