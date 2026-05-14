import { useEffect, useState } from "react";
import "./admin.css";

export default function AdminDashboard({ onBackToShop }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [summary, setSummary] = useState({
    products: 0,
    users: 0,
    cart_items: 0,
  });

  useEffect(() => {
    fetchUsers();
    fetchCart();
    fetchSummary();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("http://localhost:8000/api/admin/users");
    const data = await res.json();
    setUsers(data);
  };

  const fetchCart = async () => {
    const res = await fetch("http://localhost:8000/api/admin/cart");
    const data = await res.json();
    setCartItems(data);
  };

  const fetchSummary = async () => {
    const res = await fetch("http://localhost:8000/api/admin/summary");
    const data = await res.json();
    setSummary(data);
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h2>Vivian Admin</h2>

        <div
          className={activeTab === "dashboard" ? "nav-item active" : "nav-item"}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </div>

        <div
          className={activeTab === "users" ? "nav-item active" : "nav-item"}
          onClick={() => setActiveTab("users")}
        >
          Users
        </div>

        <div
          className={activeTab === "cart" ? "nav-item active" : "nav-item"}
          onClick={() => setActiveTab("cart")}
        >
          Cart
        </div>
      </aside>

      <main className="dashboard-content">
        <div className="top-bar">
          <h1>Flower Shop Dashboard</h1>
          <button className="admin-btn" onClick={onBackToShop}>
            Back to Shop
          </button>
        </div>

        {(activeTab === "dashboard" || activeTab === "users" || activeTab === "cart") && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{summary.products}</h3>
              <p>Products</p>
            </div>

            <div className="stat-card">
              <h3>{summary.users}</h3>
              <p>Users</p>
            </div>

            <div className="stat-card">
              <h3>{summary.cart_items}</h3>
              <p>Cart Items</p>
            </div>
          </div>
        )}

        {(activeTab === "dashboard" || activeTab === "users") && (
          <section className="table-section">
            <div className="section-header">
              <h2>Users</h2>
              <span className="section-subtitle">Manage customer and admin accounts</span>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={user.role === "admin" ? "role-tag admin-role" : "role-tag"}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={user.status === "active" ? "status active-status" : "status inactive-status"}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {(activeTab === "dashboard" || activeTab === "cart") && (
          <section className="table-section">
            <div className="section-header">
              <h2>Shopping Cart</h2>
              <span className="section-subtitle">View all current cart records</span>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Flower</th>
                  <th>Price</th>
                  <th>Quantity</th>
                </tr>
              </thead>

              <tbody>
                {cartItems.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="empty-cell">
                      No cart items yet.
                    </td>
                  </tr>
                ) : (
                  cartItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>${item.price}</td>
                      <td>{item.quantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}