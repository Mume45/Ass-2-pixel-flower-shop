// AuthModal.jsx
// Created by Yuhan Sun
// 作用：使用一个弹窗组件内处理用户注册和登录功能。
// 通过内部状态在 'register'（注册）和 'login'（登录）两种模式之间切换。

import { useState } from 'react';

function AuthModal({ onClose, onLoginSuccess }) {

    const [mode, setMode] = useState('register'); // 'register' 注册 或 'login' 登录

    // ---- 表单输入状态 ----
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // ---- 错误提示状态 ----
    const [errors, setErrors] = useState({});

    const [showSuccess, setShowSuccess] = useState(false); // 控制注册成功小弹窗

    // ---- 切换模式：清空表单和错误信息 ----
    const switchMode = (newMode) => {
        setMode(newMode);
        setUsername('');
        setEmail('');
        setPassword('');
        setErrors({});
    };

    // ---- 处理注册 ----
    const handleRegister = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                // 处理 400 错误：邮箱已被注册
                if (response.status === 400) {
                    setErrors({ email: data.detail });
                }
                // 处理 422 错误：格式验证失败（如邮箱格式不对、密码太短）
                if (response.status === 422) {
                    const newErrors = {};
                    data.detail.forEach(err => {
                        const field = err.loc[1]; // 字段名：'username'、'email' 或 'password'
                        newErrors[field] = err.msg;
                    });
                    setErrors(newErrors);
                }
                return;
            }

            // 注册成功：显示成功提示弹窗
            setShowSuccess(true);

        } catch (error) {
            console.error('注册出错：', error);
        }
    };


    // ---- 处理登录 ----
    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                // 处理 401 错误：邮箱或密码错误
                if (response.status === 401) {
                    setErrors({ password: data.detail });
                }
                return;
            }

            // 登录成功：保存 token 并关闭弹窗
            localStorage.setItem('token', data.access_token);
            onLoginSuccess();
            onClose();

        } catch (error) {
            console.error('登录出错：', error);
        }
    };

    // ---- 渲染 ----
    return (
        <div className="auth-overlay" onClick={onClose}>
            <div className="auth-modal" onClick={e => e.stopPropagation()}>

                {/* 关闭按钮 */}
                <button className="auth-close-btn" onClick={onClose}>✕</button>

                {/* 注册成功小弹窗 */}
                {showSuccess && (
                    <div className="success-modal">
                        <p className="success-message">
                            Registration successful! Welcome to Vivian's Flower Shop, {username}! 🌸
                        </p>
                        <button
                            className="success-close-btn"
                            onClick={() => setShowSuccess(false)}
                        >
                            Close
                        </button>
                    </div>
                )}

                {/* 标题 */}
                <h2 className="auth-title">
                    {mode === 'register' ? '✦ Create Account ✦' : '✦ Welcome Back ✦'}
                </h2>

                {/* 表单区域 */}
                <div className="auth-form">

                    {/* 用户名输入框 — 仅注册模式显示 */}
                    {mode === 'register' && (
                        <div className="auth-field">
                            <label className="auth-label">Username</label>
                            <input
                                className={`auth-input ${errors.username ? 'auth-input-error' : ''}`}
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                            {/* 用户名错误提示 */}
                            {errors.username && (
                                <p className="auth-error">{errors.username}</p>
                            )}
                        </div>
                    )}

                    {/* 邮箱输入框 */}
                    <div className="auth-field">
                        <label className="auth-label">Email or Username</label>
                        <input
                            className={`auth-input ${errors.email ? 'auth-input-error' : ''}`}
                            type="text"
                            placeholder="Enter your email or username"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        {/* 邮箱错误提示 */}
                        {errors.email && (
                            <p className="auth-error">{errors.email}</p>
                        )}
                    </div>

                    {/* 密码输入框 */}
                    <div className="auth-field">
                        <label className="auth-label">Password</label>
                        <input
                            className={`auth-input ${errors.password ? 'auth-input-error' : ''}`}
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        {/* 密码错误提示 */}
                        {errors.password && (
                            <p className="auth-error">{errors.password}</p>
                        )}
                    </div>

                </div>

                {/* 提交按钮 */}
                <button
                    className="auth-submit-btn"
                    onClick={mode === 'register' ? handleRegister : handleLogin}
                >
                    {mode === 'register' ? '✦ Sign Up ✦' : '✦ Log In ✦'}
                </button>

                {/* 切换模式链接 */}
                {mode === 'register' ? (
                    <p className="auth-switch">
                        Already have an account?{' '}
                        <span className="auth-switch-link" onClick={() => switchMode('login')}>
                            Log in
                        </span>
                    </p>
                ) : (
                    <p className="auth-switch">
                        Don't have an account?{' '}
                        <span className="auth-switch-link" onClick={() => switchMode('register')}>
                            Sign up
                        </span>
                    </p>
                )}


            </div>
        </div>
    );
}

export default AuthModal;