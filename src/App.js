import React, { useEffect, useState, useContext } from "react";
import { Home, Package, Plus, History, LogOut } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { AuthContext } from "./AuthContext";
import LoginPage from "./LoginPage";

function App() {
  const { user, token, loading: authLoading, logout } = useContext(AuthContext);

  // All hooks must be called at the top level, before any early returns
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState("dashboard");
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    quantity: "",
    price: "",
    minStock: ""
  });

  const [history, setHistory] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [operation, setOperation] = useState("");
  const [changeValue, setChangeValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [note, setNote] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  // History Filters
  const [historyFilterName, setHistoryFilterName] = useState("");
  const [historyFilterDateFrom, setHistoryFilterDateFrom] = useState("");
  const [historyFilterDateTo, setHistoryFilterDateTo] = useState("");
  const [historyFilterType, setHistoryFilterType] = useState("all");

  // Mobile Sidebar Toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Toast Notifications
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState({ show: false, title: "", message: "", onConfirm: () => {} });

  const confirmAction = (title, message, onConfirm) => {
    setConfirmModal({ show: true, title, message, onConfirm });
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  // API helper with auth token
  const api = async (url, options = {}) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const res = await fetch(`${baseUrl}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers
      }
    });
    return res.json();
  };

  const fetchHistory = () => {
    setHistoryLoading(true);
    api("/history")
      .then(data => {
        setHistory(data);
        setHistoryLoading(false);
      })
      .catch(() => setHistoryLoading(false));
  };

  const fetchProducts = () => {
    setProductsLoading(true);
    api("/products")
      .then(data => {
        setProducts(data);
        setProductsLoading(false);
        setLoading(false);
      })
      .catch(() => {
        setProductsLoading(false);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
    fetchHistory();
  }, []);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!authLoading && !user) {
    return <LoginPage />;
  }

  // 📊 Stats
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
  const lowStock = products.filter(p => p.quantity <= p.minStock).length;
  const approachingStock = products.filter(
    p => p.quantity > p.minStock && p.quantity <= p.minStock + 5
  ).length;

  const totalValue = products.reduce(
    (sum, p) => sum + p.quantity * p.price,
    0
  );

  const chartData = products.map(p => ({
    name: p.name,
    quantity: p.quantity
  }));

  // SORT
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const getSortedProducts = (list) => {
    return [...list].sort((a, b) => {
      let valA, valB;
      if (sortConfig.key === "name") {
        valA = a.name.toLowerCase(); valB = b.name.toLowerCase();
      } else if (sortConfig.key === "quantity") {
        valA = a.quantity; valB = b.quantity;
      } else if (sortConfig.key === "price") {
        valA = a.price; valB = b.price;
      } else if (sortConfig.key === "minStock") {
        valA = a.minStock; valB = b.minStock;
      } else {
        valA = a.quantity - a.minStock; valB = b.quantity - b.minStock;
      }
      return sortConfig.direction === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  };

  // FORM
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ADD / UPDATE
  const handleSubmit = async () => {
    setSaving(true);
    const url = editId
      ? `/products/${editId}`
      : "/products";

    const method = editId ? "PUT" : "POST";

    await api(url, {
      method,
      body: JSON.stringify({
        name: form.name,
        quantity: Number(form.quantity),
        price: Number(form.price),
        minStock: Number(form.minStock)
      })
    });

    // history
    await api("/history", {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        change: editId ? "Updated Product" : `Added ${form.quantity}`,
        time: new Date().toLocaleString(),
        note: editId ? "Edited via dashboard" : "Created via dashboard"
      })
    });
    fetchHistory();

    setForm({ name: "", quantity: "", price: "", minStock: "" });
    setEditId(null);
    fetchProducts();
    setPage("dashboard");
    setSaving(false);
    showToast(editId ? "Product updated successfully!" : "Product added successfully!");
  };

  // DELETE
  const deleteProduct = async (id) => {
    await api(`/products/${id}`, { method: "DELETE" });
    fetchProducts();
    showToast("Product deleted successfully!");
  };

  // EDIT
  const editProduct = (p) => {
    setForm(p);
    setEditId(p._id);
    setPage("add");
  };

  // POPUP
  const openPopup = (product, type) => {
    setSelectedProduct(product);
    setOperation(type);
    setChangeValue("");
    setNote("");
  };

  const applyChange = async () => {
    let newQty = selectedProduct.quantity;

    if (operation === "add") newQty += Number(changeValue);
    else newQty -= Number(changeValue);

    if (newQty < 0) newQty = 0;

    const newEntry = {
      name: selectedProduct.name,
      change: operation === "add" ? `+${changeValue}` : `-${changeValue}`,
      time: new Date().toLocaleString(),
      note: note || "—"
    };

    await api("/history", {
      method: "POST",
      body: JSON.stringify(newEntry)
    });

    fetchHistory();

    await api(`/products/${selectedProduct._id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...selectedProduct,
        quantity: newQty
      })
    });

    setSelectedProduct(null);
    fetchProducts();
    showToast(`Stock ${operation === "add" ? "added" : "subtracted"} successfully!`);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "products", label: "Products", icon: Package },
    { id: "add", label: "Add Product", icon: Plus },
    { id: "history", label: "History", icon: History }
  ];

  // Loading Spinner Component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
    </div>
  );

  // Skeleton Card Component
  const SkeletonCard = () => (
    <div className="bg-gray-200 animate-pulse rounded-2xl p-6 h-28"></div>
  );

  // Skeleton Product Card
  const SkeletonProductCard = () => (
    <div className="bg-gray-200 animate-pulse rounded-2xl h-64"></div>
  );

  // Skeleton Table Row
  const SkeletonTableRow = () => (
    <tr className="border-b border-gray-100">
      <td className="px-6 py-4"><div className="bg-gray-200 animate-pulse h-4 rounded w-24"></div></td>
      <td className="px-6 py-4"><div className="bg-gray-200 animate-pulse h-4 rounded w-16"></div></td>
      <td className="px-6 py-4"><div className="bg-gray-200 animate-pulse h-4 rounded w-32"></div></td>
      <td className="px-6 py-4"><div className="bg-gray-200 animate-pulse h-4 rounded w-20"></div></td>
      <td className="px-6 py-4"><div className="bg-gray-200 animate-pulse h-4 rounded w-8"></div></td>
    </tr>
  );

  return (
    <div className="flex h-screen bg-gray-50 relative font-sans">

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-lg shadow-2xl text-white font-medium text-sm transition-all animate-slide-in flex items-center gap-3 ${
          toast.type === "success" ? "bg-emerald-600" :
          toast.type === "error" ? "bg-red-600" :
          toast.type === "warning" ? "bg-amber-500" :
          "bg-blue-600"
        }`}>
          <span className="text-lg">
            {toast.type === "success" ? "✓" :
             toast.type === "error" ? "✕" :
             toast.type === "warning" ? "⚠" : "ℹ"}
          </span>
          <span>{toast.message}</span>
          <button
            onClick={() => setToast({ ...toast, show: false })}
            className="ml-4 text-white/70 hover:text-white transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-[28rem] animate-slide-in overflow-hidden">
            <div className="px-8 pt-8 pb-4 text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-50 mb-5">
                <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{confirmModal.title}</h3>
              <p className="text-gray-500 mt-2 text-sm">{confirmModal.message}</p>
            </div>
            <div className="bg-gray-50 px-8 py-5 flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, show: false });
                }}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BACKDROP */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <div className={`fixed md:static inset-y-0 left-0 w-72 bg-[#1a1d29] shadow-2xl flex flex-col transform ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } transition-transform z-50 md:z-auto`}>
        {/* Mobile Close */}
        <div className="absolute top-5 right-5 md:hidden">
          <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Brand */}
        <div className="px-7 py-8 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg tracking-tight">Four Star</h1>
              <p className="text-gray-500 text-[11px] uppercase tracking-wider font-medium">Inventory System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setPage(item.id); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3.5 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
                    : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
                }`}
              >
                <Icon size={19} strokeWidth={isActive ? 2.5 : 1.5} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer - User Profile */}
        <div className="px-5 py-5 border-t border-gray-700/50">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="h-9 w-9 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-300 text-sm font-medium truncate">{user?.name || "Admin User"}</p>
              <p className="text-gray-600 text-xs truncate">{user?.email || "admin@fourstar.com"}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-600/10 hover:text-red-400 transition"
          >
            <LogOut size={18} strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-auto w-full">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 md:px-10 py-5 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-gray-600 text-2xl">☰</button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 capitalize">
                {page === "add" ? "Add Product" : page === "lowstock" ? "Low Stock" : page === "worth" ? "Total Worth" : page}
              </h1>
              <p className="text-gray-400 text-xs mt-0.5">
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
              <div className="h-7 w-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.name || "Admin"}</span>
            </div>
            {page === "products" && (
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 w-48 md:w-72 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
                />
              </div>
            )}
          </div>
        </div>

        <div className="px-6 md:px-10 py-8">

          {/* DASHBOARD */}
          {page === "dashboard" && (
            <>
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-8">
                  <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-8">
                  {[
                    { label: "Total Products", value: totalProducts, color: "bg-indigo-50 border-indigo-200 text-indigo-700", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
                    { label: "Total Stock", value: totalStock, color: "bg-emerald-50 border-emerald-200 text-emerald-700", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" },
                    { label: "Approaching", value: approachingStock, color: "bg-amber-50 border-amber-200 text-amber-700", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
                    { label: "Low Stock", value: lowStock, color: "bg-red-50 border-red-200 text-red-700 cursor-pointer hover:shadow-md transition", icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", onClick: () => setPage("lowstock") },
                    { label: "Total Worth", value: `₹${totalValue.toLocaleString()}`, color: "bg-purple-50 border-purple-200 text-purple-700 cursor-pointer hover:shadow-md transition", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", onClick: () => setPage("worth") }
                  ].map((card, i) => (
                    <div
                      key={i}
                      onClick={card.onClick}
                      className={`${card.color} border rounded-xl p-5 transition-all ${card.onClick ? "cursor-pointer" : ""}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{card.label}</p>
                        <svg className="h-5 w-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                        </svg>
                      </div>
                      <p className="text-2xl font-bold">{card.value}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 overflow-x-auto">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Stock Overview</h3>
                <BarChart width={600} height={300} data={chartData}>
                  <XAxis dataKey="name"/>
                  <YAxis/>
                  <Tooltip/>
                  <Bar dataKey="quantity" fill="#3b82f6" radius={[8, 8, 0, 0]}/>
                </BarChart>
              </div>
            </>
          )}

          {/* PRODUCTS */}
          {page === "products" && (
            <div>
              {/* Sort Bar */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-6 overflow-x-auto whitespace-nowrap">
                <div className="inline-flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-3">Sort by:</span>
                  {[
                    { key: "name", label: "Name" },
                    { key: "quantity", label: "Quantity" },
                    { key: "price", label: "Price" },
                    { key: "minStock", label: "Min Stock" },
                    { key: "status", label: "Status" }
                  ].map(col => (
                    <button
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
                        sortConfig.key === col.key
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {col.label}
                      {sortConfig.key === col.key && (
                        <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Grid */}
              {productsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <SkeletonProductCard /><SkeletonProductCard /><SkeletonProductCard />
                  <SkeletonProductCard /><SkeletonProductCard /><SkeletonProductCard />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {getSortedProducts(
                    products.filter(p =>
                      p.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                  ).map(p => (
                <div key={p._id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all overflow-hidden">
                  <div className={`h-1 ${p.quantity <= p.minStock ? "bg-red-500" : "bg-emerald-500"}`}></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-base font-semibold text-gray-900">{p.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.quantity <= p.minStock
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {p.quantity <= p.minStock ? "Low" : "In Stock"}
                      </span>
                    </div>

                    <div className="space-y-2.5 mb-5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Quantity</span>
                        <span className="font-semibold text-gray-900">{p.quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Price</span>
                        <span className="font-semibold text-gray-900">₹{p.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Min Stock</span>
                        <span className="font-semibold text-gray-900">{p.minStock}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Value</span>
                        <span className="font-semibold text-indigo-600">₹{(p.quantity * p.price).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <button onClick={() => openPopup(p, "add")} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 rounded-lg text-sm transition" title="Add Stock">+</button>
                      <button onClick={() => openPopup(p, "subtract")} className="bg-amber-50 hover:bg-amber-100 text-amber-700 py-2 rounded-lg text-sm transition" title="Subtract">−</button>
                      <button onClick={() => editProduct(p)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-lg text-sm transition" title="Edit">
                        <svg className="h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          confirmAction(
                            "Delete Product?",
                            `Are you sure you want to delete "${p.name}"?`,
                            () => deleteProduct(p._id)
                          );
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded-lg text-sm transition"
                        title="Delete"
                      >
                        <svg className="h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {getSortedProducts(
                  products.filter(p =>
                    p.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                ).length === 0 && (
                <div className="col-span-3 bg-gray-100 text-gray-500 p-12 rounded-xl text-center text-lg">
                  {searchQuery ? `No products found for "${searchQuery}"` : "No products yet."}
                </div>
              )}
                </div>
              )}
            </div>
          )}

          {/* LOW STOCK */}
          {page === "lowstock" && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-red-600">⚠️ Low Stock Items</h2>
                <button
                  onClick={() => setPage("dashboard")}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition w-full md:w-auto"
                >
                  ← Back
                </button>
              </div>

              {products.filter(p => p.quantity <= p.minStock).length === 0 ? (
                <div className="bg-green-100 text-green-700 p-6 rounded-xl text-center text-lg font-semibold">
                  ✅ All products are well stocked!
                </div>
              ) : (
                <div className="space-y-3">
                  {products.filter(p => p.quantity <= p.minStock).map(p => (
                    <div key={p._id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center border-l-4 border-red-500">
                      <div>
                        <h3 className="font-bold text-lg">{p.name}</h3>
                        <p className="text-gray-600">Stock: <span className="text-red-600 font-bold">{p.quantity}</span> / {p.minStock}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setForm(p);
                            setEditId(p._id);
                            setPage("add");
                          }}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Restock
                        </button>
                        <button
                          onClick={() => {
                            confirmAction(
                              "Delete Product?",
                              `Are you sure you want to delete "${p.name}"?`,
                              () => deleteProduct(p._id)
                            );
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TOTAL WORTH BREAKDOWN */}
          {page === "worth" && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-purple-600">💰 Total Worth Breakdown</h2>
                <button
                  onClick={() => setPage("dashboard")}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition w-full md:w-auto"
                >
                  ← Back
                </button>
              </div>

              {products.length === 0 ? (
                <div className="bg-gray-100 text-gray-500 p-8 rounded-xl text-center text-lg">
                  No products yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map(p => (
                    <div key={p._id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">{p.name}</h3>
                        <p className="text-gray-600">{p.quantity} units × ₹{p.price} each</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">₹{p.quantity * p.price}</p>
                      </div>
                    </div>
                  ))}
                  <div className="bg-purple-100 border-2 border-purple-400 p-4 rounded-lg flex justify-between items-center">
                    <h3 className="font-bold text-lg text-purple-800">Grand Total</h3>
                    <p className="text-2xl font-bold text-purple-800">₹{totalValue}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ADD / EDIT PRODUCT */}
          {page === "add" && (
            <div className="max-w-2xl">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-8">
                  {editId ? "Edit Product Details" : "Create New Product"}
                </h2>

                <div className="space-y-6">
                  {[
                    { name: "name", label: "Product Name", type: "text", placeholder: "e.g., Wheat, Rice, Sugar" },
                    { name: "quantity", label: "Quantity", type: "number", placeholder: "e.g., 50" },
                    { name: "price", label: "Price (₹)", type: "number", step: "0.01", placeholder: "e.g., 120.50" },
                    { name: "minStock", label: "Min Stock Level", type: "number", placeholder: "e.g., 10" }
                  ].map(field => (
                    <div key={field.name} className="flex flex-col md:flex-row md:items-center gap-2">
                      <label className="md:w-36 text-sm font-medium text-gray-500">{field.label}</label>
                      <input
                        name={field.name}
                        type={field.type}
                        min={field.type === "number" ? "0" : undefined}
                        step={field.step}
                        value={form[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium w-full py-3 rounded-lg mt-8 transition flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    editId ? "Update Product" : "Create Product"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* HISTORY */}
          {page === "history" && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">📋 History</h2>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  {history.length > 0 && (
                    <button
                      onClick={async () => {
                        try {
                          const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
                          const res = await fetch(`${baseUrl}/history/download`, {
                            headers: {
                              Authorization: `Bearer ${token}`
                            }
                          });
                          if (res.ok) {
                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "history_export.csv";
                            a.click();
                            window.URL.revokeObjectURL(url);
                          }
                        } catch (err) {
                          console.error("Download failed:", err);
                        }
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition w-full md:w-auto"
                    >
                      📥 Download CSV
                    </button>
                  )}
                  {history.length > 0 && (
                    <button
                      onClick={() => {
                        confirmAction(
                          "Clear All History?",
                          "This will permanently delete all history records.",
                          () => {
                            api("/history", { method: "DELETE" })
                              .then(() => {
                                setHistory([]);
                                showToast("History cleared!");
                              });
                          }
                        );
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition w-full md:w-auto"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Bar */}
              <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">Search:</span>
                    <input
                      type="text"
                      placeholder="Product name..."
                      value={historyFilterName}
                      onChange={(e) => setHistoryFilterName(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 w-full"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">From:</span>
                    <input
                      type="date"
                      value={historyFilterDateFrom}
                      onChange={(e) => setHistoryFilterDateFrom(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 w-full"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">To:</span>
                    <input
                      type="date"
                      value={historyFilterDateTo}
                      onChange={(e) => setHistoryFilterDateTo(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 w-full"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">Type:</span>
                    <select
                      value={historyFilterType}
                      onChange={(e) => setHistoryFilterType(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 w-full"
                    >
                      <option value="all">All</option>
                      <option value="add">Stock In (+)</option>
                      <option value="subtract">Stock Out (-)</option>
                      <option value="update">Updated</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setHistoryFilterName("");
                      setHistoryFilterDateFrom("");
                      setHistoryFilterDateTo("");
                      setHistoryFilterType("all");
                    }}
                    className="w-full md:w-auto text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>

              {/* Filtered History Logic */}
              {(() => {
                if (historyLoading) {
                  return (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Product</th>
                              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Stock Change</th>
                              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Time</th>
                              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Note</th>
                              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600"></th>
                            </tr>
                          </thead>
                          <tbody>
                            <SkeletonTableRow />
                            <SkeletonTableRow />
                            <SkeletonTableRow />
                            <SkeletonTableRow />
                            <SkeletonTableRow />
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }

                const filtered = history.filter(h => {
                  // Name filter
                  if (historyFilterName && !h.name.toLowerCase().includes(historyFilterName.toLowerCase())) {
                    return false;
                  }

                  // Type filter
                  if (historyFilterType !== "all") {
                    if (historyFilterType === "add" && !h.change.startsWith("+")) return false;
                    if (historyFilterType === "subtract" && !h.change.startsWith("-")) return false;
                    if (historyFilterType === "update" && h.change.includes("Updated")) return false;
                  }

                  // Date filter
                  const entryDate = new Date(h.createdAt);
                  if (historyFilterDateFrom && entryDate < new Date(historyFilterDateFrom)) return false;
                  if (historyFilterDateTo) {
                    const toDate = new Date(historyFilterDateTo);
                    toDate.setHours(23, 59, 59, 999); // Include the whole end day
                    if (entryDate > toDate) return false;
                  }

                  return true;
                });

                return (
                  <>
                    {filtered.length === 0 ? (
                      <div className="bg-gray-100 text-gray-500 p-8 rounded-xl text-center text-lg">
                        {history.length === 0 ? "No history yet." : "No results match your filters."}
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[600px]">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Product</th>
                              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Stock Change</th>
                              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Time</th>
                              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Note</th>
                              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map((h) => (
                              <tr key={h._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                  <span className="font-semibold text-blue-600">{h.name}</span>
                                </td>
                                <td className="px-6 py-4">
                                  {h.change.startsWith("+") ? (
                                    <span className="text-green-600 font-semibold">
                                      {h.change} ↑
                                    </span>
                                  ) : h.change.startsWith("-") ? (
                                    <span className="text-red-600 font-semibold">
                                      {h.change} ↓
                                    </span>
                                  ) : (
                                    <span className="text-gray-700 font-semibold">
                                      {h.change}
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm">
                                  📅 {h.time}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  📝 {h.note || "—"}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button
                                    onClick={() => {
                                      api(`/history/${h._id}`, { method: "DELETE" })
                                        .then(() => {
                                          fetchHistory();
                                          showToast("Entry deleted!");
                                        });
                                    }}
                                    className="text-red-400 hover:text-red-600 transition"
                                  >
                                    🗑️
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        </div>
                        <div className="bg-gray-50 px-6 py-3 text-sm text-gray-500 text-right border-t">
                          Showing {filtered.length} of {history.length} entries
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* POPUP - Add/Subtract Stock */}
          {selectedProduct && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-8 rounded-2xl shadow-2xl w-[28rem]">
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  {operation === "add" ? "➕ Add Stock" : "➖ Subtract Stock"}
                </h3>
                <p className="text-gray-500 mb-5">
                  {selectedProduct.name} — Current: <span className="font-bold text-gray-800">{selectedProduct.quantity}</span>
                </p>

                <input
                  type="number"
                  min="0"
                  autoFocus
                  value={changeValue}
                  onChange={(e) => setChangeValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && changeValue) {
                      applyChange();
                    }
                  }}
                  placeholder="Enter quantity"
                  className="w-full border-2 border-gray-300 rounded-lg p-3 mb-3 focus:outline-none focus:border-blue-500 text-lg"
                />

                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && changeValue) {
                      applyChange();
                    }
                  }}
                  placeholder="Add a note (optional)"
                  className="w-full border-2 border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:border-blue-500 text-sm"
                />

                <div className="flex gap-3">
                  <button
                    onClick={applyChange}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;