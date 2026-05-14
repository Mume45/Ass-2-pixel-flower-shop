// App.js - 根组件
// 作用：管理全局状态、API 通信和主界面布局
import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Modal from './components/Modal';
import AuthModal from './components/AuthModal';
import AdminDashboard from './admin/AdminDashboard';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [category, setCategory] = useState('all');
  const [showAuth, setShowAuth] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

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

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token || currentUser?.role === 'admin') {
      setCartItems([]);
      setCartTotal(0);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/cart/', {
        headers: { ...authHeader(), 'Content-Type': 'application/json' }
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();
      setCartItems(data.items || []);
      setCartTotal(data.total || 0);
    } catch (error) {
      console.error("获取购物车失败：", error);
    }
  }, [currentUser]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) restoreSession();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
  fetchProducts();
  fetchCart();

  // every 2 seconds auto refresh products
  const interval = setInterval(() => {
    fetchProducts();
  }, 1000);

  return () => clearInterval(interval);

}, [fetchProducts]);

  const restoreSession = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/me', {
        headers: authHeader()
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);

        if (data.role === 'admin') {
          setShowAdmin(true);
        }
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('恢复登录状态出错：', error);
    }
  };

  const addToCart = async (productId) => {
    if (!currentUser) {
      setShowAuth(true);
      return;
    }

    if (currentUser.role === 'admin') {
      setShowAdmin(true);
      return;
    }

    try {
      await fetch('http://localhost:8000/api/cart/', {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: 1 })
      });
      fetchCart();
    } catch (error) {
      console.error("加入购物车失败：", error);
    }
  };

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

  const handleLoginSuccess = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/me', {
        headers: authHeader()
      });

      const data = await response.json();
      setCurrentUser(data);

      if (data.role === 'admin') {
        setShowAdmin(true);
      }
    } catch (error) {
      console.error('获取用户信息出错：', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setCartItems([]);
    setCartTotal(0);
    setShowAdmin(false);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  if (showAdmin && currentUser?.role === 'admin') {
    return (
      <AdminDashboard
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchToShop={() => setShowAdmin(false)}
      />
    );
  }

  return (
    <div className="app">
      <Header
        cartCount={cartItems.reduce((total, item) => total + item.quantity, 0)}
        onCartClick={() => setShowCart(!showCart)}
        onAuthClick={() => setShowAuth(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onAdminClick={() => setShowAdmin(true)}
      />


      <div className="main-content">
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

        <ProductList
          products={filteredProducts}
          onAddToCart={addToCart}
          onViewDetail={setSelectedProduct}
        />
      </div>

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

      {selectedProduct && (
        <Modal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

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