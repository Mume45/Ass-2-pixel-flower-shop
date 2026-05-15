// AuthModal.jsx
// Created by Yuhan Sun
// 作用：登录 / 注册弹窗组件。
// 功能包括：
// 1. 默认显示登录界面
// 2. 可以切换到注册界面
// 3. 注册成功后显示 Registration Successful 成功界面
// 4. 保留后端错误处理，例如邮箱重复、格式验证失败、密码错误等

import { useState } from 'react';

function AuthModal({ onClose, onLoginSuccess }) {
    // mode 用来控制当前显示哪一个界面：
    // 'login'    = 登录界面
    // 'register' = 注册界面
    // 'success'  = 注册成功界面
    const [mode, setMode] = useState('login');

    // ---- 表单输入状态 ----
    // username 只在注册时使用
    const [username, setUsername] = useState('');

    // email 在登录和注册时都会使用
    const [email, setEmail] = useState('');

    // password 在登录和注册时都会使用
    const [password, setPassword] = useState('');

    // 控制密码是否可见，用于右侧 eye 按钮
    const [showPassword, setShowPassword] = useState(false);

    // ---- 错误提示状态 ----
    // errors 是一个对象，可以分别保存 username、email、password 的错误信息
    // 例如：{ email: 'Email already registered' }
    const [errors, setErrors] = useState({});

    // ---- 切换模式：清空表单和错误信息 ----
    const switchMode = (newMode) => {
        setMode(newMode);
        setUsername('');
        setEmail('');
        setPassword('');
        setShowPassword(false);
        setErrors({});
    };

    // ---- 处理注册 ----
    const handleRegister = async () => {
        // 每次提交前先清空之前的错误
        setErrors({});

        try {
            const response = await fetch('http://localhost:8000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },

                // 发送给后端的数据
                body: JSON.stringify({
                    username,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // 400：通常表示邮箱已被注册，或者后端主动返回的业务错误
                if (response.status === 400) {
                    setErrors({ email: data.detail || 'This email has already been registered.' });
                }

                // 422：FastAPI / Pydantic 的字段验证错误
                // 例如邮箱格式错误、密码长度不够等
                if (response.status === 422 && Array.isArray(data.detail)) {
                    const newErrors = {};

                    data.detail.forEach((err) => {
                        // err.loc 可能类似：['body', 'email']
                        // 所以字段名通常在 loc 的最后一项
                        const field = err.loc[err.loc.length - 1];
                        newErrors[field] = err.msg;
                    });

                    setErrors(newErrors);
                }

                return;
            }

            // 注册成功后，不直接关闭弹窗，而是显示注册成功界面
            setMode('success');
        } catch (error) {
            console.error('注册出错：', error);

            // 网络错误或后端没有启动时，显示通用错误
            setErrors({
                general: 'Cannot connect to server. Please check whether the backend is running.',
            });
        }
    };

    // ---- 处理登录 ----
    const handleLogin = async () => {
        // 每次提交前先清空之前的错误
        setErrors({});

        try {
            const response = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },

                // 这里沿用你原来的设计：登录时发送 email 和 password
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // 401：邮箱或密码错误
                if (response.status === 401) {
                    setErrors({ password: data.detail || 'Incorrect email or password.' });
                }

                // 422：字段格式错误
                if (response.status === 422 && Array.isArray(data.detail)) {
                    const newErrors = {};

                    data.detail.forEach((err) => {
                        const field = err.loc[err.loc.length - 1];
                        newErrors[field] = err.msg;
                    });

                    setErrors(newErrors);
                }

                return;
            }

            // 登录成功：保存 token
            localStorage.setItem('token', data.access_token);

            // 如果后端返回了 user 信息，也一起保存，方便 Header 显示用户名/角色
            if (data.user) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
            }

            // 通知 App.js 登录成功
            // 如果 data.user 存在，就传给父组件；如果没有，也不会影响原本逻辑
            onLoginSuccess(data.user);

            // 关闭弹窗
            onClose();
        } catch (error) {
            console.error('登录出错：', error);

            setErrors({
                general: 'Cannot connect to server. Please check whether the backend is running.',
            });
        }
    };

    // ---- 渲染 ----
    return (
        <div className="auth-overlay" onClick={onClose}>
            <div
                className={`auth-modal ${mode === 'register' ? 'auth-modal-register' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 关闭按钮 */}
                <button className="auth-close-btn" onClick={onClose}>
                    ✕
                </button>

                {/* =========================
            登录界面
           ========================= */}
                {mode === 'login' && (
                    <>
                        <h2 className="auth-title">✦ Log In ✦</h2>

                        <div className="auth-form">
                            {/* 邮箱输入框 */}
                            <div className="auth-field">
                                <label className="auth-label">Email</label>
                                <input
                                    className={`auth-input ${errors.email ? 'auth-input-error' : ''}`}
                                    type="email"
                                    placeholder="Enter your Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                                {errors.email && (
                                    <p className="auth-error">{errors.email}</p>
                                )}
                            </div>

                            {/* 密码输入框 */}
                            <div className="auth-field">
                                <label className="auth-label">Password</label>

                                <div className="password-field">
                                    <input
                                        className={`auth-input password-input ${errors.password ? 'auth-input-error' : ''}`}
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />

                                    <button
                                        type="button"
                                        className="password-eye-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        👁
                                    </button>
                                </div>

                                {errors.password && (
                                    <p className="auth-error">{errors.password}</p>
                                )}
                            </div>

                            {/* 通用错误，例如后端没启动 */}
                            {errors.general && (
                                <p className="auth-error auth-general-error">{errors.general}</p>
                            )}
                        </div>

                        {/* 登录按钮 */}
                        <button className="auth-submit-btn" onClick={handleLogin}>
                            ✦ Log In ✦
                        </button>

                        {/* 切换到注册 */}
                        <p className="auth-switch">
                            Don&apos;t have an account ?{' '}
                            <span
                                className="auth-switch-link"
                                onClick={() => switchMode('register')}
                            >
                                Sign up
                            </span>
                        </p>
                    </>
                )}

                {/* =========================
            注册界面
           ========================= */}
                {mode === 'register' && (
                    <>
                        <h2 className="auth-title">✦ Create Account ✦</h2>

                        <div className="auth-form">
                            {/* 用户名输入框 */}
                            <div className="auth-field">
                                <label className="auth-label">Username</label>
                                <input
                                    className={`auth-input ${errors.username ? 'auth-input-error' : ''}`}
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />

                                {errors.username && (
                                    <p className="auth-error">{errors.username}</p>
                                )}
                            </div>

                            {/* 邮箱输入框 */}
                            <div className="auth-field">
                                <label className="auth-label">Email</label>
                                <input
                                    className={`auth-input ${errors.email ? 'auth-input-error' : ''}`}
                                    type="email"
                                    placeholder="Enter your Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                                {errors.email && (
                                    <p className="auth-error">{errors.email}</p>
                                )}
                            </div>

                            {/* 密码输入框 */}
                            <div className="auth-field">
                                <label className="auth-label">Password</label>

                                <div className="password-field">
                                    <input
                                        className={`auth-input password-input ${errors.password ? 'auth-input-error' : ''}`}
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />

                                    <button
                                        type="button"
                                        className="password-eye-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        👁
                                    </button>
                                </div>

                                {errors.password && (
                                    <p className="auth-error">{errors.password}</p>
                                )}
                            </div>

                            {/* 通用错误，例如后端没启动 */}
                            {errors.general && (
                                <p className="auth-error auth-general-error">{errors.general}</p>
                            )}
                        </div>

                        {/* 注册按钮 */}
                        <button className="auth-submit-btn" onClick={handleRegister}>
                            ✦ Sign Up ✦
                        </button>

                        {/* 切换到登录 */}
                        <p className="auth-switch">
                            Already have an account ?{' '}
                            <span
                                className="auth-switch-link"
                                onClick={() => switchMode('login')}
                            >
                                Log in
                            </span>
                        </p>
                    </>
                )}

                {/* =========================
            注册成功界面
           ========================= */}
                {mode === 'success' && (
                    <div className="register-success-content">
                        <h2 className="success-title">
                            ✦ Registration
                            <br />
                            Successful ! ✦
                        </h2>

                        <div className="success-icon-box">
                            <div className="success-check-circle">✓</div>
                            <div className="success-flower-line">🌸 🎀 🌸</div>
                        </div>

                        <p className="success-welcome">
                            Hi! {username || 'username'}!
                        </p>

                        <p className="success-text">
                            Welcome to Vivian&apos;s Flowers!
                        </p>

                        <button
                            className="success-login-btn"
                            onClick={() => switchMode('login')}
                        >
                            Continue to Log In
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AuthModal;