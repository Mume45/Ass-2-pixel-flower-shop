// ProductList.jsx
// Purpose: Renders a responsive grid of ProductCard components.
import React from 'react';
import ProductCard from './ProductCard';

function ProductList({ products, onAddToCart, onViewDetail }) {

    // Handle empty state if no products are found in the current category
    if (products.length === 0) {
        return (
            <div className="empty-message">
                <p>This category is empty...</p>
            </div>
        );
    }

    return (
        <div className="product-grid">
            {products.map(product => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onViewDetail={onViewDetail}
                />
            ))}
        </div>
    );
}

export default ProductList;