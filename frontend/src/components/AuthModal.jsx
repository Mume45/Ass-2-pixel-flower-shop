// AuthModal.jsx
// Author: Shiying Gu, Yuhan Sun
// Purpose: Login / Register modal component.
// Features include:
// 1. Display login screen by default
// 2. Allow switching to register screen
// 3. Show Registration Successful screen after registration
// 4. Keep backend error handling, such as duplicate email,
//    validation errors, incorrect password, etc.

import { useState } from 'react';

function AuthModal({ onClose, onLoginSuccess }) {
    // mode controls which screen is displayed:
    // 'login'    = login screen
    // 'register' = register screen
    // 'success'  = registration success screen
    const [mode, setMode] = useState('login');

    // ---- Form input states ----
    // username is only used for registration
    const [username, setUsername] = useState('');

    // email is used for both login and registration
    const [email, setEmail] = useState('');

    // password is used for both login and registration
    const [password, setPassword] = useState('');

    // Control password visibility for the eye button
    const [showPassword, setShowPassword] = useState(false);

    // ---- Error message state ----
    // errors is an object that stores validation messages
    // Example: { email: 'Email already registered' }
    const [errors, setErrors] = useState({});

    // ---- Switch mode: clear form and errors ----
    const switchMode = (newMode) => {
        setMode(newMode);
        setUsername('');
        setEmail('');
        setPassword('');
        setShowPassword(false);
        setErrors({});
    };

    // ---- Handle registration ----
    const handleRegister = async () => {
        // Clear previous errors before submitting
        setErrors({});

        try {
            const response = await fetch('http://localhost:8000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },

                // Data sent to backend
                body: JSON.stringify({
                    username,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // 400: usually means duplicate email
                // or backend business logic error
                if (response.status === 400) {
                    setErrors({ email: data.detail || 'This email has already been registered.' });
                }

                // 422: FastAPI / Pydantic validation error
                // Example: invalid email format or short password
                if (response.status === 422 && Array.isArray(data.detail)) {
                    const newErrors = {};

                    data.detail.forEach((err) => {
                        // err.loc may look like: ['body', 'email']
                        // Field name is usually the last item
                        const field = err.loc[err.loc.length - 1];
                        newErrors[field] = err.msg;
                    });

                    setErrors(newErrors);
                }

                return;
            }

            // Show success screen after registration
            // instead of closing modal immediately
            setMode('success');
        } catch (error) {
            console.error('注册出错：', error);

            // Show general error if backend is unavailable
            setErrors({
                general: 'Cannot connect to server. Please check whether the backend is running.',
            });
        }
    };

    // ---- Handle login ----
    const handleLogin = async () => {
        // Clear previous errors before submitting
        setErrors({});

        try {
            const response = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },

                // Keep original logic:
                // send email and password for login
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // 401: incorrect email or password
                if (response.status === 401) {
                    setErrors({ password: data.detail || 'Incorrect email or password.' });
                }

                // 422: validation error
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

            // Save token after login
            localStorage.setItem('token', data.access_token);

            // Save user info if returned by backend
            // Used for showing username and role in Header
            if (data.user) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
            }

            // Notify App.js that login succeeded
            // Pass user data if available
            onLoginSuccess(data.user);

            // Close modal
            onClose();
        } catch (error) {
            console.error('登录出错：', error);

            setErrors({
                general: 'Cannot connect to server. Please check whether the backend is running.',
            });
        }
    };

    // ---- Render component ----
    return (
        <div className="auth-overlay" onClick={onClose}>
            <div
                className={`auth-modal ${mode === 'register' ? 'auth-modal-register' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button className="auth-close-btn" onClick={onClose}>
                    ✕
                </button>

                {/* =========================
                    Login screen
                   ========================= */}
                {mode === 'login' && (
                    <>
                        <h2 className="auth-title">✦ Log In ✦</h2>

                        <div className="auth-form">
                            {/* Email input field */}
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

                            {/* Password input field */}
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
                                        <img
                                            src="/images/eye_icon.png"
                                            alt="eye"
                                            className="eye-icon"
                                        />
                                    </button>
                                </div>

                                {errors.password && (
                                    <p className="auth-error">{errors.password}</p>
                                )}
                            </div>

                            {/* General error message
                                Example: backend not running */}
                            {errors.general && (
                                <p className="auth-error auth-general-error">{errors.general}</p>
                            )}
                        </div>

                        {/* Login button */}
                        <button className="auth-submit-btn" onClick={handleLogin}>
                            ✦ Log In ✦
                        </button>

                        {/* Switch to register screen */}
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
                    Register screen
                   ========================= */}
                {mode === 'register' && (
                    <>
                        <h2 className="auth-title">✦ Create Account ✦</h2>

                        <div className="auth-form">
                            {/* Username input field */}
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

                            {/* Email input field */}
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

                            {/* Password input field */}
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
                                        <img
                                            src="/images/eye_icon.png"
                                            alt="eye"
                                            className="eye-icon"
                                        />
                                    </button>
                                </div>

                                {errors.password && (
                                    <p className="auth-error">{errors.password}</p>
                                )}
                            </div>

                            {/* General error message
                                Example: backend not running */}
                            {errors.general && (
                                <p className="auth-error auth-general-error">{errors.general}</p>
                            )}
                        </div>

                        {/* Register button */}
                        <button className="auth-submit-btn" onClick={handleRegister}>
                            ✦ Sign Up ✦
                        </button>

                        {/* Switch to login screen */}
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
                    Registration success screen
                   ========================= */}
                {mode === 'success' && (
                    <div className="register-success-content">
                        <h2 className="success-title">
                            ✦ Registration
                            <br />
                            Successful ! ✦
                        </h2>

                        <div className="success-icon-box">
                            <img
                                src="/images/register_success.png"
                                alt="Registration Successful"
                                className="register-success-img"
                            />
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