// CartItem.jsx
// Author: Yuhan Sun Ass1
// Purpose: Individual cart row component with quantity controls
import React from 'react';

function CartItem({ item, onUpdateQuantity, onRemove }) {
    return (
        <div className="cart-item">
            {/* Display product name */}
            <div className="cart-item-name">{item.name}</div>

            <div className="cart-item-row-bottom">
                {/* Quantity controls and subtotal */}
                <div className="cart-item-left-group">
                    <div className="quantity-controls">
                        <button
                            className="qty-btn"
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        >-</button>
                        <span className="qty-number">{item.quantity}</span>
                        <button
                            className="qty-btn"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >+</button>
                    </div>
                    <span className="cart-item-subtotal">
                        ${(item.price * item.quantity).toFixed(2)}
                    </span>
                </div>

                {/* Remove item button */}
                <button className="remove-btn" onClick={() => onRemove(item.id)}>
                    DEL
                </button>
            </div>
        </div>
    );
}

export default CartItem;