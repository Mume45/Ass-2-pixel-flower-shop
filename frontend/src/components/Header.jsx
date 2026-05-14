// Header.jsx
// 作用：顶部导航栏，包含店铺标题、登录/注册按钮（未登录）或头像下拉菜单（已登录）和购物车按钮

import React, { useState } from 'react';

function Header({ cartCount, onCartClick, onAuthClick, currentUser, onLogout, onAdminClick }) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="shop-title"> Vivian's &nbsp;Flowers </h1>
        <p className="shop-subtitle">- Bringing a little beauty into your day -</p>
      </div>

      <div className="header-right">
        {currentUser ? (
          <div className="user-avatar-wrapper">
            <div
              className="user-avatar"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <img
                src={currentUser.role === 'admin' ? '/images/admin_avatar.png' : '/images/user_avatar.png'}
                alt="avatar"
                className="avatar-img"
              />
            </div>

            {showDropdown && (
              <div className="dropdown-menu">
                <p className="dropdown-username">👤 {currentUser.username}</p>

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
                      Switch to Admin
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
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="auth-header-btn" onClick={onAuthClick}>
            Login / Register
          </button>
        )}

        {currentUser?.role !== 'admin' && (
          <button className="cart-button" onClick={onCartClick}>
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;