// Header.jsx
// 作用：顶部导航栏，包含店铺标题、登录/注册按钮（未登录）或头像下拉菜单（已登录）和购物车按钮

import React, { useState } from 'react';

function Header({ cartCount, onCartClick, onAuthClick, currentUser, onLogout }) {
    // Props:
    // cartCount — 购物车中的商品数量
    // onCartClick — 打开购物车的函数
    // onAuthClick — 打开登录/注册弹窗的函数
    // currentUser — 当前登录用户信息，null表示未登录
    // onLogout — 登出的函数

    const [showDropdown, setShowDropdown] = useState(false); // 控制下拉菜单显示

    return (
        <header className="header">
            <div className="header-left">
                <h1 className="shop-title"> Vivian's &nbsp;Flowers </h1>
                <p className="shop-subtitle">- Bringing a little beauty into your day -</p>
            </div>

            <div className="header-right">
                {/* 登录状态：显示头像和下拉菜单 */}
                {currentUser ? (
                    <div className="user-avatar-wrapper">
                        {/* 头像按钮 */}
                        <div
                            className="user-avatar"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            {/* 根据角色显示不同头像 */}
                            <img
                                src={currentUser.role === 'admin' ? '/images/admin_avatar.png' : '/images/user_avatar.png'}
                                alt="avatar"
                                className="avatar-img"
                            />
                        </div>

                        {/* 下拉菜单 */}
                        {showDropdown && (
                            <div className="dropdown-menu">
                                <p className="dropdown-username">👤 {currentUser.username}</p>
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
                    /* 未登录状态：显示登录/注册按钮 */
                    <button className="auth-header-btn" onClick={onAuthClick}>
                        Login / Register
                    </button>
                )}

                {/* 购物车按钮（带数量角标） */}
                <button className="cart-button" onClick={onCartClick}>
                    Cart
                    {cartCount > 0 && (
                        <span className="cart-badge">{cartCount}</span>
                    )}
                </button>
            </div>
        </header>
    );
}

export default Header;