// ProductCard.jsx
// Author: Yuhan Sun / Project Team
// Purpose: Displays product overview with image, price, and actions.
//
// Main features:
//   - Shows product image, name, and price
//   - Opens product detail modal when the image is clicked
//   - Adds the product to the shopping cart

import React from 'react';

function ProductCard({ product, onAddToCart, onViewDetail }) {
    return (
        <div className="product-card">
            {/* Product image area; clicking it opens the detail modal */}
            <div
                className="product-image"
                onClick={() => onViewDetail(product)}
            >
                <img
                    className="product-img"
                    src={
                        product.image?.startsWith("data:image")
                            ? product.image
                            : `/images/${product.image}.png`
                    }
                    alt={product.name}
                />
            </div>

            {/* Basic product information */}
            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">${product.price.toFixed(2)}</p>
            </div>

            {/* Add this product to the shopping cart */}
            <button
                className="add-to-cart-btn"
                onClick={() => onAddToCart(product.id)}
            >
                <span>Add to Cart</span>
            </button>
        </div>
    );
}

export default ProductCard;