// Header.jsx
// 作用：顶部导航栏，负责显示店铺标题、登录按钮、购物车按钮和用户头像菜单

import React, { useState } from 'react';

function Header({ cartCount, onCartClick, onAuthClick, currentUser, onLogout, onAdminClick }) {
  // 控制头像下拉菜单是否显示
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="header">

      {/* 左侧：店铺 Logo + 标题 */}
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

      {/* 右侧：未登录显示登录按钮；登录后显示购物车 + 头像 */}
      <div className="header-right">
        {currentUser ? (
          <>
            {/* 只有普通用户显示购物车按钮，admin 隐藏 */}
            {currentUser.role !== 'admin' && (
              <button className="cart-button" onClick={onCartClick}>
                <span className="cart-icon">🛒</span>
                <span>Cart</span>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>
            )}

            {/* 登录后显示用户头像 */}
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