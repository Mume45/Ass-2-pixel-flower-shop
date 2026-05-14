// App.js - Root Component
// Purpose: Manages global state, API communications, and main UI layout.

import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Modal from './components/Modal';
import AdminDashboard from './admin/AdminDashboard';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [category, setCategory] = useState('all');
  const [showAdmin, setShowAdmin] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const url = category === 'all'
        ? 'http://localhost:8000/api/products'
        : `http://localhost:8000/api/products/category/${category}`;

      const response = await fetch(url);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, [category]);

  const fetchCart = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/cart/');
      const data = await response.json();
      setCartItems(data.items || []);
      setCartTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, [fetchProducts]);

  const addToCart = async (productId) => {
    try {
      await fetch('http://localhost:8000/api/cart/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: 1 })
      });
      fetchCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await fetch(`http://localhost:8000/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await fetch(`http://localhost:8000/api/cart/${itemId}`, {
        method: 'DELETE'
      });
      fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const clearCart = async () => {
    try {
      await fetch('http://localhost:8000/api/cart/', {
        method: 'DELETE'
      });
      fetchCart();
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  if (showAdmin) {
    return <AdminDashboard onBackToShop={() => setShowAdmin(false)} />;
  }

  return (
    <div className="app">
      <button
        onClick={() => setShowAdmin(true)}
        style={{
          position: "fixed",
          top: "18px",
          right: "180px",
          zIndex: 1000,
          padding: "10px 18px",
          borderRadius: "999px",
          border: "none",
          background: "#111827",
          color: "white",
          cursor: "pointer",
          fontWeight: "600"
        }}
      >
        Admin
      </button>

      <Header
        cartCount={cartItems.reduce((total, item) => total + item.quantity, 0)}
        onCartClick={() => setShowCart(!showCart)}
      />

      <div className="main-content">
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

        <ProductList
          products={products}
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
    </div>
  );
}

export default App;