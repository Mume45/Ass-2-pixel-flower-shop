// ProductCard.jsx
// Purpose: Displays individual product overview with image, price, and actions.

import React from 'react';

function ProductCard({ product, onAddToCart, onViewDetail }) {
    return (
        <div className="product-card">
            {/* 点击图片区域可以查看商品详情 */}
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

            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">${product.price.toFixed(2)}</p>
            </div>

            <button
                className="add-to-cart-btn"
                onClick={() => onAddToCart(product.id)}
            >
                <span className="cart-btn-icon">🛒</span>
                <span>Add to Cart</span>
            </button>
        </div>
    );
}

export default ProductCard;