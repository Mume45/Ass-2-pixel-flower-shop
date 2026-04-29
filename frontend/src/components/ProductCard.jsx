// ProductCard.jsx
// Purpose: Displays individual product overview with image, price, and actions.
// Tech: React (Functional Component)
import React from 'react';

function ProductCard({ product, onAddToCart, onViewDetail }) {
    // Props: product (object), onAddToCart (function), onViewDetail (function)

    return (
        <div className="product-card">
            {/* Image area - triggers detail modal on click */}
            <div
                className="product-image"
                onClick={() => onViewDetail(product)}
            >
                <img
                    className="product-img"
                    src={`/images/${product.image}.png`}
                    alt={product.name}
                />
            </div>

            {/* Product identifying information */}
            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">${product.price.toFixed(2)}</p>
            </div>

            {/* Primary action: Add to cart */}
            <button
                className="add-to-cart-btn"
                onClick={() => onAddToCart(product.id)}
            >
                + Add to Cart
            </button>
        </div>
    );
}

export default ProductCard;