// App.js - 根组件
// 作用：管理全局状态、API 通信和主界面布局

import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Modal from './components/Modal';
import AuthModal from './components/AuthModal';
import './App.css';

function App() {
  // ---- 全局状态 ----
  const [products, setProducts] = useState([]);           // 从后端获取的商品列表
  const [cartItems, setCartItems] = useState([]);         // 当前用户购物车中的商品
  const [cartTotal, setCartTotal] = useState(0);          // 购物车总价（由后端计算）
  const [selectedProduct, setSelectedProduct] = useState(null); // 详情弹窗中显示的商品
  const [showCart, setShowCart] = useState(false);        // 控制购物车侧边栏的显示
  const [category, setCategory] = useState('all');        // 当前选中的商品分类
  const [showAuth, setShowAuth] = useState(false);        // 控制登录/注册弹窗的显示
  const [searchKeyword, setSearchKeyword] = useState(''); // 搜索关键词
  const [currentUser, setCurrentUser] = useState(null);  // 当前登录用户信息，null 表示未登录

  // ---- 工具函数：生成带 token 的请求头 ----
  const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ---- 获取商品列表（根据分类） ----
  const fetchProducts = useCallback(async () => {
    try {
      const url = category === 'all'
        ? 'http://localhost:8000/api/products'
        : `http://localhost:8000/api/products/category/${category}`;
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("获取商品失败：", error);
    }
  }, [category]);

  // ---- 获取当前用户的购物车（未登录则清空） ----
  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // 未登录时清空购物车显示
      setCartItems([]);
      setCartTotal(0);
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/api/cart/', {
        headers: { ...authHeader(), 'Content-Type': 'application/json' }
      });
      if (response.status === 401) {
        // Token 失效时自动登出
        handleLogout();
        return;
      }
      const data = await response.json();
      setCartItems(data.items || []);
      setCartTotal(data.total || 0);
    } catch (error) {
      console.error("获取购物车失败：", error);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- 页面加载时：若 localStorage 有 token 则自动恢复登录状态 ----
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      restoreSession();
    }
  }, []);

  // 分类切换时重新获取商品
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 用户切换（登录/登出）时重新获取购物车
  useEffect(() => {
    fetchCart();
  }, [currentUser]);

  // ---- 恢复登录状态（刷新页面后用 token 重新拉取用户信息） ----
  const restoreSession = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/me', {
        headers: authHeader()
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data); // 恢复用户信息
      } else {
        // Token 无效则清除
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('恢复登录状态出错：', error);
    }
  };

  // ---- 购物车操作 ----

  // 加入购物车（未登录时弹出登录框）
  const addToCart = async (productId) => {
    if (!currentUser) {
      setShowAuth(true);
      return;
    }
    try {
      await fetch('http://localhost:8000/api/cart/', {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: 1 })
      });
      fetchCart(); // 操作后刷新购物车
    } catch (error) {
      console.error("加入购物车失败：", error);
    }
  };

  // 修改购物车中某商品的数量
  const updateQuantity = async (itemId, quantity) => {
    try {
      await fetch(`http://localhost:8000/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      fetchCart();
    } catch (error) {
      console.error("更新数量失败：", error);
    }
  };

  // 移除购物车中某件商品
  const removeFromCart = async (itemId) => {
    try {
      await fetch(`http://localhost:8000/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: authHeader()
      });
      fetchCart();
    } catch (error) {
      console.error("移除商品失败：", error);
    }
  };

  // 清空当前用户的整个购物车
  const clearCart = async () => {
    try {
      await fetch('http://localhost:8000/api/cart/', {
        method: 'DELETE',
        headers: authHeader()
      });
      fetchCart();
    } catch (error) {
      console.error("清空购物车失败：", error);
    }
  };

  // ---- 登录成功后获取当前用户信息 ----
  const handleLoginSuccess = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/me', {
        headers: authHeader()
      });
      const data = await response.json();
      setCurrentUser(data); // 保存用户信息：{ id, username, email, role }
    } catch (error) {
      console.error('获取用户信息出错：', error);
    }
  };

  // ---- 登出：清除 token 和所有用户相关状态 ----
  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setCartItems([]);
    setCartTotal(0);
  };

  // ---- 根据搜索关键词过滤当前商品列表 ----
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // ---- 主界面渲染 ----
  return (
    <div className="app">
      {/* 顶部导航栏 */}
      <Header
        cartCount={cartItems.reduce((total, item) => total + item.quantity, 0)}
        onCartClick={() => setShowCart(!showCart)}
        onAuthClick={() => setShowAuth(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="main-content">
        {/* 分类筛选栏 + 搜索框 */}
        <div className="category-bar">
          <div className="category-tabs">
            {['all', 'single', 'bouquet', 'basket', 'gift_box'].map(cat => (
              <button
                key={cat}
                className={category === cat ? 'tab active' : 'tab'}
                onClick={() => setCategory(cat)}
              >
                {cat === 'all' ? 'All' :
                  cat === 'single' ? 'Single' :
                    cat === 'bouquet' ? 'Bouquet' :
                      cat === 'basket' ? 'Basket' : 'Gift Box'}
              </button>
            ))}
          </div>

          {/* 搜索框 */}
          <div className="search-bar">
            <input
              className="search-input"
              type="text"
              placeholder="Search flowers..."
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {/* 商品列表（按关键词过滤后显示） */}
        <ProductList
          products={filteredProducts}
          onAddToCart={addToCart}
          onViewDetail={setSelectedProduct}
        />
      </div>

      {/* 购物车侧边栏 */}
      {showCart && (
        <Cart
          items={cartItems}
          total={cartTotal}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onClear={clearCart}
          onClose={() => setShowCart(false)}
        />
      )}

      {/* 商品详情弹窗 */}
      {selectedProduct && (
        <Modal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* 登录/注册弹窗 */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}

export default App;