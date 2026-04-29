// Header.jsx
// Purpose: Main navigation header with shop title and cart toggle
import React from 'react';
function Header({ cartCount, onCartClick }) {
    // Props: cartCount (number of items in cart), onCartClick (function to open cart overlay)

    return (
        <header className="header">
            <div className="header-left">
                <h1 className="shop-title"> Vivian's &nbsp;Flowers </h1>
                <p className="shop-subtitle">- Bringing a little beauty into your day -</p>
            </div>

            {/* Cart button with dynamic item counter badge */}
            <button className="cart-button" onClick={onCartClick}>
                Cart
                {cartCount > 0 && (
                    <span className="cart-badge">{cartCount}</span>
                )}
            </button>
        </header>
    );
}

export default Header;