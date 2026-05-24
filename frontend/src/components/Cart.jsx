// Cart.jsx — Shopping Cart Overlay
// Author: Yuhan Sun Ass1
// Purpose: Displays the cart panel with item list, totals, and controls.
import React from 'react';
import CartItem from './CartItem';

function Cart({ items, total, onUpdateQuantity, onRemove, onClear, onClose }) {
    return (
        /* Overlay background - clicking here closes the cart */
        <div className="cart-overlay" onClick={onClose}>

            {/* Cart panel - stopPropagation prevents closing when clicking inside the panel */}
            <div className="cart-panel" onClick={e => e.stopPropagation()}>

                <div className="cart-header">
                    <h2>Shopping Cart</h2>
                    <button className="close-btn" onClick={onClose}>X</button>
                </div>

                {items.length === 0 ? (
                    <div className="cart-empty">
                        <p>Your Cart is empty...</p>
                    </div>
                ) : (
                    <>
                        {/* Scrollable container for cart items */}
                        <div className="cart-items-container">
                            <div className="cart-items">
                                {items.map(item => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        onUpdateQuantity={onUpdateQuantity}
                                        onRemove={onRemove}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="cart-footer">
                            <div className="cart-total">
                                <span>Total:</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <button className="clear-btn" onClick={onClear}>
                                Clear Cart
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Cart;