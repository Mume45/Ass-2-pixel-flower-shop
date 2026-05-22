import { useEffect, useState } from "react";
import "./admin.css";

const API = "http://localhost:8000/api/admin";

const emptyProduct = {
  name: "",
  price: "",
  description: "",
  image: "",
  category: "single",
};

export default function AdminDashboard({ currentUser, onLogout, onSwitchToShop }) {
  const [activeTab, setActiveTab] = useState("products");

  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [usernameSearch, setUsernameSearch] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const [productForm, setProductForm] = useState(emptyProduct);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState(null);
  const [productPage, setProductPage] = useState(1);
  const productsPerPage = 6;

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });
  const getImageSrc = (image) => {
  if (!image) return "";
  if (image.startsWith("data:image")) return image;
  return `/images/${image}.png`;
};

  const handleAddProductImage = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = () => {
    setProductForm({ ...productForm, image: reader.result });
  };
  reader.readAsDataURL(file);
};
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await Promise.all([loadProducts(), loadUsers(), loadCart()]);
  };

  const loadProducts = async () => {
    const res = await fetch(`${API}/products`, { headers: authHeader() });
    const data = await res.json();

    console.log("admin products status:", res.status);
    console.log("admin products data:", data);

    setProducts(Array.isArray(data) ? data : []);
  };

  const loadUsers = async () => {
    const res = await fetch(`${API}/users`, { headers: authHeader() });
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  };

  const loadCart = async () => {
    const res = await fetch(`${API}/cart`, { headers: authHeader() });
    const data = await res.json();
    setCartItems(Array.isArray(data) ? data : []);
  };

  const filteredProducts = products.filter((product) => {
    const nameMatch = product.name
      ?.toLowerCase()
      .includes(productSearch.toLowerCase());

    const categoryMatch =
      productCategoryFilter === "all" ||
      product.category === productCategoryFilter;

    return nameMatch && categoryMatch;
  });
  const totalProductPages = Math.ceil(filteredProducts.length / productsPerPage);

  const productStartIndex = (productPage - 1) * productsPerPage;

  const currentProducts = filteredProducts.slice(
    productStartIndex,
    productStartIndex + productsPerPage
  );

  const filteredUsers = users.filter((user) => {
    const usernameMatch = user.username
      ?.toLowerCase()
      .includes(usernameSearch.toLowerCase());

    const emailMatch = user.email
      ?.toLowerCase()
      .includes(emailSearch.toLowerCase());

    const roleMatch = roleFilter === "all" || user.role === roleFilter;

    return usernameMatch && emailMatch && roleMatch;
  });

  const addProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.image) {
      alert("Please enter product name, price and image.");
      return;
    }

    await fetch(`${API}/products`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({
        ...productForm,
        price: Number(productForm.price),
      }),
    });

    setProductForm(emptyProduct);
    loadAll();
  };

  const openEditProduct = (product) => {
    setEditingProduct({
      ...product,
      price: String(product.price),
    });
  };

  const saveEditProduct = async () => {
    if (!editingProduct.name || !editingProduct.price || !editingProduct.image) {
      alert("Please enter product name, price and image.");
      return;
    }

    await fetch(`${API}/products/${editingProduct.id}`, {
      method: "PUT",
      headers: authHeader(),
      body: JSON.stringify({
        name: editingProduct.name,
        price: Number(editingProduct.price),
        description: editingProduct.description,
        image: editingProduct.image,
        category: editingProduct.category,
      }),
    });

    setEditingProduct(null);
    loadAll();
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    await fetch(`${API}/products/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    });

    loadAll();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user and their cart?")) return;

    await fetch(`${API}/users/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    });

    if (selectedUser?.id === id) {
      setSelectedUser(null);
    }

    loadAll();
  };

  const selectedUserCartItems = selectedUser
    ? cartItems.filter((item) => item.user_id === selectedUser.id)
    : [];

  const selectedUserCartTotal = selectedUserCartItems.reduce(
    (sum, item) => sum + Number(item.subtotal || item.price * item.quantity || 0),
    0
  );

  const getUserCartCount = (userId) => {
    return cartItems.filter((item) => item.user_id === userId).length;
  };

  const renderProductForm = () => {
    return (
      <section className="admin-card">
        <h2>Add New Products</h2>

        <div className="product-add-layout">
          <div className="image-box">
            {productForm.image ? (
              <img
                src={getImageSrc(productForm.image)}
                alt="preview"
                className="product-preview-img"
              />
            ) : (
              <div className="upload-placeholder">
                <span>⬆</span>
                <p>Product Image</p>
              </div>
            )}

            <label className="upload-btn">
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleAddProductImage}
                hidden
            />
            </label>
            <button className="small-add-btn add-product-btn" onClick={addProduct}>
              Add Product
            </button>
          </div>

          <div className="product-form-grid">
            <label>
              Product Name
              <input
                placeholder="e.g. Crimson Rose"
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
              />
            </label>

            <label>
              Category
              <select
                value={productForm.category}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    category: e.target.value,
                  })
                }
              >
                <option value="single">single</option>
                <option value="bouquet">bouquet</option>
                <option value="basket">basket</option>
                <option value="gift_box">gift_box</option>
              </select>
            </label>

            <label>
              Price ($)
              <input
                placeholder="e.g. 5.99"
                value={productForm.price}
                onChange={(e) =>
                  setProductForm({ ...productForm, price: e.target.value })
                }
              />
            </label>

            <label className="full-width">
              Description
              <textarea
                placeholder="Write a description about the product..."
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    description: e.target.value,
                  })
                }
              />
            </label>


          </div>
        </div>
      </section>
    );
  };
    const handleEditProductImage = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = () => {
    setEditingProduct({ ...editingProduct, image: reader.result });
  };
  reader.readAsDataURL(file);
};

  const renderProductTable = () => {
    return (
      <section className="admin-card">
        <div className="section-top">
          <h2>All Products</h2>
        </div>

        <div className="admin-form product-search-form">
          <input
            placeholder="Search product name..."
            value={productSearch}
            onChange={(e) => {
              setProductSearch(e.target.value);
              setProductPage(1);
            }}
          />

          <select
            value={productCategoryFilter}
            onChange={(e) => {
              setProductCategoryFilter(e.target.value);
              setProductPage(1);
            }}
          >
            <option value="all">all</option>
            <option value="single">single</option>
            <option value="bouquet">bouquet</option>
            <option value="basket">basket</option>
            <option value="gift_box">gift_box</option>
          </select>
        </div>

        <table>
          <colgroup>
            <col style={{ width: "20%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "16%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Products</th>
              <th>Category</th>
              <th>Price</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="table-text-limit">
                    {product.name}
                  </div>
                </td>
                <td>{product.category}</td>
                <td>${product.price}</td>
                <td>
                  <div className="table-text-limit description-limit">
                    {product.description}
                  </div>
                </td>
                <td>
                  <span className="status-active">Active</span>
                </td>
                <td>
                  <button onClick={() => openEditProduct(product)}>
                    Edit
                  </button>
                  <button
                    className="danger"
                    onClick={() => deleteProduct(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="6" className="empty">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {totalProductPages > 1 && (
          <div className="pagination admin-product-pagination">
            <button
              className="page-nav-btn"
              disabled={productPage === 1}
              onClick={() => setProductPage(productPage - 1)}
            >
              ← Previous
            </button>

            {Array.from({ length: totalProductPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`page-btn ${productPage === page ? "active" : ""}`}
                onClick={() => setProductPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="page-nav-btn"
              disabled={productPage === totalProductPages}
              onClick={() => setProductPage(productPage + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="admin-page">
      <header className="header admin-top-header">
        <div className="header-left">
          <img
            src="/images/shop_logo.png"
            alt="Vivian's Flowers logo"
            className="shop-logo"
          />

          <div className="shop-title-group">
            <h1 className="shop-title">Vivian's Flowers</h1>
            <p className="shop-subtitle">- BRING A LITTLE BEAUTY INTO YOUR DAY -</p>
          </div>
        </div>

        <div className="header-right">
          <div className="user-avatar-wrapper">
            <div
              className="user-avatar"
              onClick={() => setShowAdminMenu(!showAdminMenu)}
            >
              <img
                src="/images/admin_avatar.png"
                alt="admin avatar"
                className="avatar-img"
              />
            </div>

            {showAdminMenu && (
              <div className="dropdown-menu">
                <p className="dropdown-username">{currentUser?.username}</p>

                <hr className="dropdown-divider" />

                <button
                  className="dropdown-item"
                  onClick={() => {
                    onSwitchToShop();
                    setShowAdminMenu(false);
                  }}
                >
                  Main Page
                </button>

                <hr className="dropdown-divider" />

                <button
                  className="dropdown-item"
                  onClick={() => {
                    onLogout();
                    setShowAdminMenu(false);
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <h2>Admin Dashboard</h2>

          <button
            onClick={() => setActiveTab("products")}
            className={activeTab === "products" ? "active" : ""}
          >
            Products
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={activeTab === "users" ? "active" : ""}
          >
            Users
          </button>
        </aside>

        <main className="admin-main">
          {activeTab === "products" && (
            <div className="admin-products-page">
              {renderProductForm()}
              {renderProductTable()}
            </div>
          )}

          {activeTab === "users" && (
            <>
              <section className="admin-card">
                <div className="section-top">
                  <h2>All Users</h2>
                </div>

                <div className="admin-form">
                  <input
                    placeholder="Search username..."
                    value={usernameSearch}
                    onChange={(e) => {
                      setUsernameSearch(e.target.value);
                      setSelectedUser(null);
                    }}
                  />

                  <input
                    placeholder="Search email..."
                    value={emailSearch}
                    onChange={(e) => {
                      setEmailSearch(e.target.value);
                      setSelectedUser(null);
                    }}
                  />

                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setSelectedUser(null);
                    }}
                  >
                    <option value="all">all</option>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Cart Items</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className="tag">{user.role}</span>
                        </td>
                        <td>{getUserCartCount(user.id)}</td>
                        <td>
                          <button onClick={() => setSelectedUser(user)}>
                            View Cart
                          </button>

                          <button
                            className="danger"
                            onClick={() => deleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="5" className="empty">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>

              {selectedUser && (
                <section className="admin-card">
                  <h2>Selected User Cart Preview</h2>

                  <p className="selected-user-text">
                    User: <strong>{selectedUser.username}</strong> | Email:{" "}
                    <strong>{selectedUser.email}</strong>
                  </p>

                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedUserCartItems.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="empty">
                            This user has no cart items.
                          </td>
                        </tr>
                      ) : (
                        selectedUserCartItems.map((item) => (
                          <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>
                              {
                                item.category ||
                                products.find((p) => p.id === item.product_id || p.name === item.name)?.category ||
                                "-"
                                }
</td>
                            <td>${item.price}</td>
                            <td>{item.quantity}</td>
                            <td>${item.subtotal}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  <div className="cart-total">
                    Total: ${selectedUserCartTotal.toFixed(2)}
                  </div>
                </section>
              )}
            </>
          )}
        </main>

        {editingProduct && (
          <div className="modal-backdrop">
            <div className="edit-product-modal">
              <button className="modal-close" onClick={() => setEditingProduct(null)}>
                ×
              </button>

              <h2>Edit Product</h2>

              <div className="edit-product-layout">
                <div className="edit-image-area">
                  <div className="edit-image-frame">
                    <img
                      src={getImageSrc(editingProduct.image)}
                      alt={editingProduct.name}
                      className="product-preview-img"
                    />
                  </div>

                  <label className="upload-btn">
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditProductImage}
                      hidden
                    />
                  </label>
                </div>

                <div className="edit-form">
                  <label>
                    Product Name
                    <input
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          name: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Category
                    <select
                      value={editingProduct.category}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="single">single</option>
                      <option value="bouquet">bouquet</option>
                      <option value="basket">basket</option>
                      <option value="gift_box">gift_box</option>
                    </select>
                  </label>

                  <label>
                    Price ($)
                    <input
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          price: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Description
                    <textarea
                      value={editingProduct.description}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          description: e.target.value,
                        })
                      }
                    />
                  </label>

                  <div className="modal-actions">
                    <button className="small-add-btn" onClick={saveEditProduct}>
                      Save Change
                    </button>
                    <button className="cancel-btn" onClick={() => setEditingProduct(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="admin-footer"></footer>
    </div>
  );
}