// Header.jsx
// Author: Shiying Gu, Yuhan Sun
// Purpose: top navigation bar, shows shop title, login button, cart button, and user avatar menu

import React, { useState } from 'react';

function Header({ cartCount, onCartClick, onAuthClick, currentUser, onLogout, onAdminClick }) {
  // Control whether the avatar dropdown menu is shown
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="header">

      {/* Left side: shop logo and title */}
      <div className="header-left">
        <img
          src="/images/shop_logo.png"
          alt="Vivian's Flowers Logo"
          className="shop-logo"
        />

        <div className="shop-title-group">
          <h1 className="shop-title">Vivian's Flowers</h1>
          <p className="shop-subtitle">- Bring a little beauty into your day -</p>
        </div>
      </div>

      {/* Right side: show login button before login; show cart and avatar after login */}
      <div className="header-right">
        {currentUser ? (
          <>
            {/* Only normal users can see the cart button; admin users do not show it */}
            {currentUser.role !== 'admin' && (
              <button className="cart-button" onClick={onCartClick}>
                <span className="cart-icon">🛒</span>
                <span>Cart</span>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>
            )}

            {/* Show user avatar after login */}
            <div className="user-avatar-wrapper">
              <div
                className="user-avatar"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <img
                  src={
                    currentUser.role === 'admin'
                      ? '/images/admin_avatar.png'
                      : '/images/user_avatar.png'
                  }
                  alt="avatar"
                  className="avatar-img"
                />
              </div>

              {showDropdown && (
                <div className="dropdown-menu">
                  <p className="dropdown-username">
                    {currentUser.role === 'admin' ? 'Admin Name' : currentUser.username}
                  </p>

                  {currentUser.role === 'admin' && (
                    <>
                      <hr className="dropdown-divider" />
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          onAdminClick();
                          setShowDropdown(false);
                        }}
                      >
                        Admin Panel
                      </button>
                    </>
                  )}

                  <hr className="dropdown-divider" />

                  <button
                    className="dropdown-item"
                    onClick={() => {
                      onLogout();
                      setShowDropdown(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button className="auth-header-btn" onClick={onAuthClick}>
            Login / Register
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;