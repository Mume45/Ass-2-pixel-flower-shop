// App.js - Root Component
// Purpose: Manages global state, API communications, and main UI layout.

import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Modal from './components/Modal';
import './App.css';

function App() {
  // ---- State Management ----
  const [products, setProducts] = useState([]);       // Product inventory from backend
  const [cartItems, setCartItems] = useState([]);     // Items currently in the cart
  const [cartTotal, setCartTotal] = useState(0);      // Total price calculated by backend
  const [selectedProduct, setSelectedProduct] = useState(null); // Data for detail modal
  const [showCart, setShowCart] = useState(false);    // Toggle for cart overlay
  const [category, setCategory] = useState('all');    // Current filter category

  // ---- API Logic ----

  /**
   * Fetches products based on selected category.
   * Wrapped in useCallback to prevent unnecessary re-renders.
   */
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

  /**
   * Fetches current cart status from the backend.
   */
  const fetchCart = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/cart/');
      const data = await response.json();
      // Defensive programming: ensure cartItems is always an array
      setCartItems(data.items || []);
      setCartTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  // Initial data load on component mount
  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, [fetchProducts]);

  // ---- Cart Operations ----

  const addToCart = async (productId) => {
    try {
      await fetch('http://localhost:8000/api/cart/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: 1 })
      });
      fetchCart(); // Refresh cart data after update
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await fetch(`http://localhost:8000/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: quantity })
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

  // ---- Main UI Rendering ----
  return (
    <div className="app">
      {/* Header with dynamic cart counter badge */}
      <Header
        cartCount={cartItems.reduce((total, item) => total + item.quantity, 0)}
        onCartClick={() => setShowCart(!showCart)}
      />

      <div className="main-content">
        {/* Category Navigation Tabs */}
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

        {/* Product Grid Layout */}
        <ProductList
          products={products}
          onAddToCart={addToCart}
          onViewDetail={setSelectedProduct}
        />
      </div>

      {/* Cart Sidebar/Overlay Panel */}
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

      {/* Product Detail Popup Modal */}
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