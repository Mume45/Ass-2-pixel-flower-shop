// App.js
// Author: Shiying Gu, Yuhan Sun
// Purpose: Main root component of the flower shop application.
//
// Main responsibilities:
//   - Manage global application states
//   - Handle communication with backend APIs
//   - Manage authentication and user sessions
//   - Control product filtering, searching, and pagination
//   - Handle shopping cart operations
//   - Display modals and admin dashboard
//
// Main features:
//   - Product browsing and category filtering
//   - Product detail modal
//   - Shopping cart management
//   - User login and authentication
//   - Admin dashboard access control

import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Modal from './components/Modal';
import AuthModal from './components/AuthModal';
import AdminDashboard from './admin/AdminDashboard';
import './App.css';

function App() {
  // Main product and cart states
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  // UI display states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [category, setCategory] = useState('all');
  const [showAuth, setShowAuth] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Build authorization header from saved token
  const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch products by selected category
  const fetchProducts = useCallback(async () => {
    try {
      const url = category === 'all'
        ? 'http://localhost:8000/api/products'
        : `http://localhost:8000/api/products/category/${category}`;
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to retrieve product：", error);
    }
  }, [category]);

  // Fetch current user's cart
  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('token');

    // Do not load cart when user is not logged in or is admin
    if (!token || currentUser?.role === 'admin') {
      setCartItems([]);
      setCartTotal(0);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/cart/', {
        headers: { ...authHeader(), 'Content-Type': 'application/json' }
      });

      // Log out user if token is invalid
      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();
      setCartItems(data.items || []);
      setCartTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to retrieve shopping cart：", error);
    }
  }, [currentUser]);

  // Restore login session when page loads
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) restoreSession();
  }, []);


  useEffect(() => {
    fetchProducts();
    fetchCart();

    // Auto refresh products every second
    const interval = setInterval(() => {
      fetchProducts();
    }, 1000);

    return () => clearInterval(interval);

  }, [fetchProducts]);

  // Refresh cart when cart fetch logic changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Restore user information from saved token
  const restoreSession = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/me', {
        headers: authHeader()
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);

        // Open admin dashboard directly for admin users
        if (data.role === 'admin') {
          setShowAdmin(true);
        }
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error restoring login status：', error);
    }
  };

  // Add selected product to cart
  const addToCart = async (productId, quantity = 1) => {
    // Ask user to log in before adding to cart
    if (!currentUser) {
      setShowAuth(true);
      return;
    }

    // Admin users cannot add products to cart
    if (currentUser.role === 'admin') {
      return;
    }

    try {
      await fetch('http://localhost:8000/api/cart/', {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity
        })
      });
      fetchCart();
    } catch (error) {
      console.error("Error restoring login status：", error);
    }
  };

  // Update quantity of a cart item
  const updateQuantity = async (itemId, quantity) => {
    try {
      await fetch(`http://localhost:8000/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      fetchCart();
    } catch (error) {
      console.error("Update quantity failed：", error);
    }
  };

  // Remove one item from cart
  const removeFromCart = async (itemId) => {
    try {
      await fetch(`http://localhost:8000/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: authHeader()
      });
      fetchCart();
    } catch (error) {
      console.error("Product removal failed：", error);
    }
  };

  // Clear all items from cart
  const clearCart = async () => {
    try {
      await fetch('http://localhost:8000/api/cart/', {
        method: 'DELETE',
        headers: authHeader()
      });
      fetchCart();
    } catch (error) {
      console.error("Shopping cart failed to be emptied：", error);
    }
  };

  // Handle successful login and load user information
  const handleLoginSuccess = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/me', {
        headers: authHeader()
      });

      const data = await response.json();
      setCurrentUser(data);

      // Show admin dashboard after admin login
      if (data.role === 'admin') {
        setShowAdmin(true);
      }
    } catch (error) {
      console.error('Error retrieving user information：', error);
    }
  };

  // Log out current user and reset states
  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setCartItems([]);
    setCartTotal(0);
    setShowAdmin(false);
  };

  // Filter products by search keyword
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;

  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Show admin dashboard for admin users
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
                onClick={() => {
                  setCategory(cat);
                  setCurrentPage(1);
                }}
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
              onChange={e => {
                setSearchKeyword(e.target.value);
                setCurrentPage(1);
              }}
            />
            <img
              src="/images/search_icon.png"
              alt="search"
              className="search-icon"
            />
          </div>
        </div>

        <ProductList
          products={currentProducts}
          onAddToCart={addToCart}
          onViewDetail={setSelectedProduct}
        />

        {/* Show pagination when there is more than one page */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-nav-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              ← Previous
            </button>

            {[1, 2, 3].filter(page => page <= totalPages).map(page => (
              <button
                key={page}
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            {totalPages > 5 && <span className="page-ellipsis">...</span>}

            {totalPages > 3 && (
              <>
                {totalPages - 1 > 3 && (
                  <button
                    className={`page-btn ${currentPage === totalPages - 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(totalPages - 1)}
                  >
                    {totalPages - 1}
                  </button>
                )}

                <button
                  className={`page-btn ${currentPage === totalPages ? 'active' : ''}`}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              className="page-nav-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next →
            </button>
          </div>
        )}

        {/* Show cart panel */}
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

        {/* Show product detail modal */}
        {selectedProduct && (
          <Modal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={addToCart}
          />
        )}

        {/* Show login/register modal */}
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </div>

      <footer className="footer"></footer>
    </div>
  );
}

export default App;