// Modal.jsx
// Author: Yuhan Sun Ass1
// Purpose: Displays a product detail pop-up modal for customers.
//
// Main features:
//   - Shows product image, name, category, price, and description
//   - Allows users to increase or decrease product quantity
//   - Adds the selected quantity of the product to the shopping cart
//   - Closes the modal when users click the close button or outside area

import React, { useState } from 'react';

function Modal({ product, onClose, onAddToCart }) {
    // Store the quantity selected by the user
    const [quantity, setQuantity] = useState(1);

    // Convert product category value into a user-friendly label
    const categoryLabel =
        product.category === 'single' ? 'Single' :
            product.category === 'bouquet' ? 'Bouquet' :
                product.category === 'basket' ? 'Basket' : 'Gift Box';

    return (
        // Modal background overlay; clicking it closes the modal
        <div className="modal-overlay" onClick={onClose}>
            {/* Stop click event from closing the modal when clicking inside the modal box */}
            <div className="detail-modal" onClick={e => e.stopPropagation()}>
                <button className="detail-close-btn" onClick={onClose}>×</button>

                {/* Left side: product image and decoration */}
                <div className="detail-left">
                    <div className="detail-frame">
                        <img
                            src={
                                product.image?.startsWith("data:image")
                                    ? product.image
                                    : `/images/${product.image}.png`
                            }
                            alt={product.name}
                            className="detail-product-img"
                        />
                    </div>

                    <img
                        src="/images/detail_decoration.png"
                        alt="decoration"
                        className="detail-decoration-img"
                    />
                </div>

                {/* Right side: product information and cart action */}
                <div className="detail-right">
                    <h2 className="detail-title">{product.name}</h2>

                    <div className="detail-category">{categoryLabel}</div>

                    <div className="detail-divider"></div>

                    <p className="detail-price">${Number(product.price).toFixed(2)}</p>

                    <div className="detail-divider"></div>

                    <p className="detail-description">{product.description}</p>

                    <div className="detail-divider"></div>

                    <label className="detail-quantity-label">Quantity</label>

                    {/* Quantity control buttons */}
                    <div className="detail-quantity-row">
                        <button
                            className="detail-qty-btn"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                            −
                        </button>

                        <div className="detail-qty-number">{quantity}</div>

                        <button
                            className="detail-qty-btn"
                            onClick={() => setQuantity(quantity + 1)}
                        >
                            +
                        </button>
                    </div>

                    {/* Add selected quantity to cart, then close the modal */}
                    <button
                        className="detail-add-btn"
                        onClick={() => {
                            onAddToCart(product.id, quantity);
                            onClose();
                        }}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Modal;