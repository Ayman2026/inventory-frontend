import React, { useEffect, useState, useContext } from "react";
import { Home, Package, Plus, History, LogOut, Moon, Sun, TrendingUp, Lightbulb, Clock, Zap, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, Area, AreaChart, CartesianGrid } from "recharts";
import { AuthContext } from "./AuthContext";
import LoginPage from "./LoginPage";
import AISuggestionsPage from "./AISuggestionsPage";

function App() {
  const { user, token, loading: authLoading, logout } = useContext(AuthContext);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // All hooks must be called at the top level, before any early returns
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState("dashboard");
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    quantity: "",
    price: "",
    minStock: "",
    damagedQuantity: ""
  });

  const [history, setHistory] = useState([]);

  // Category and Subcategory states
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddSubcategory, setShowAddSubcategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [operation, setOperation] = useState("");
  const [changeValue, setChangeValue] = useState("");
  const [damagedValue, setDamagedValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [productsSubmenuOpen, setProductsSubmenuOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubcategory, setFilterSubcategory] = useState("");
  const [showProductsSearch, setShowProductsSearch] = useState("");

  // Debounce search input (200ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  const [note, setNote] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  // History Filters
  const [historyFilterName, setHistoryFilterName] = useState("");
  const [historyFilterDateFrom, setHistoryFilterDateFrom] = useState("");
  const [historyFilterDateTo, setHistoryFilterDateTo] = useState("");
  const [historyFilterType, setHistoryFilterType] = useState("all");

  // Top Movers
  const [topMovers, setTopMovers] = useState([]);
  const [topMoversLoading, setTopMoversLoading] = useState(false);

  // Mobile Sidebar Toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dashboardPeriod, setDashboardPeriod] = useState("30"); // days

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
    api("/history?page=1&limit=100")
      .then(data => {
        setHistory(data.data || []);
        setHistoryLoading(false);
      })
      .catch(() => setHistoryLoading(false));
  };

  const fetchTopMovers = () => {
    setTopMoversLoading(true);
    api("/history/top-movers?limit=10")
      .then(data => {
        setTopMovers(data);
        setTopMoversLoading(false);
      })
      .catch(() => setTopMoversLoading(false));
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

  const fetchCategories = () => {
    api("/categories")
      .then(data => setCategories(data))
      .catch(() => {});
  };

  const fetchSubcategories = (categoryId) => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    api(`/subcategories?categoryId=${categoryId}`)
      .then(data => setSubcategories(data))
      .catch(() => {});
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;
    const data = await api("/categories", {
      method: "POST",
      body: JSON.stringify({ name: newCategoryName })
    });
    setCategories([...categories, data]);
    setNewCategoryName("");
    setShowAddCategory(false);
    showToast("Category added successfully!");
  };

  const addSubcategory = async () => {
    if (!newSubcategoryName.trim() || !selectedCategory) return;
    const data = await api("/subcategories", {
      method: "POST",
      body: JSON.stringify({ name: newSubcategoryName, categoryId: selectedCategory })
    });
    setSubcategories([...subcategories, data]);
    setNewSubcategoryName("");
    setShowAddSubcategory(false);
    showToast("Subcategory added successfully!");
  };

  useEffect(() => {
    fetchProducts();
    fetchHistory();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (page === "topmovers") {
      fetchTopMovers();
    }
  }, [page]);

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
  const damagedProducts = products.filter(p => p.damagedQuantity > 0).length;
  const totalDamagedQuantity = products.reduce((sum, p) => sum + (p.damagedQuantity || 0), 0);

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
        minStock: Number(form.minStock),
        damagedQuantity: Number(form.damagedQuantity) || 0,
        category: selectedCategory || null,
        subcategory: selectedSubcategory || null
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

    setForm({ name: "", quantity: "", price: "", minStock: "", damagedQuantity: "" });
    setSelectedCategory("");
    setSelectedSubcategory("");
    setEditId(null);
    fetchProducts();
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
    setSelectedCategory(p.category || "");
    setSelectedSubcategory(p.subcategory || "");
    if (p.category) {
      fetchSubcategories(p.category);
    }
    setPage("add");
  };

  // POPUP
  const openPopup = (product, type) => {
    setSelectedProduct(product);
    setOperation(type);
    setChangeValue("");
    setDamagedValue("");
    setNote("");
  };

  const applyChange = async () => {
    if (operation === "receive" || operation === "dispatch") {
      // New API endpoints for receive/dispatch
      const endpoint = operation === "receive" ? "receive" : "dispatch";
      
      const body = {
        quantity: Number(changeValue),
        note: note || (operation === "receive" ? "Product Received" : "Product Dispatched")
      };
      
      // Add damaged quantity only for receive operation
      if (operation === "receive" && damagedValue) {
        body.damagedQuantity = Number(damagedValue);
      }
      
      await api(`/products/${selectedProduct._id}/${endpoint}`, {
        method: "POST",
        body: JSON.stringify(body)
      });

      setSelectedProduct(null);
      setDamagedValue("");
      fetchProducts();
      fetchHistory();
      showToast(`Product ${operation === "receive" ? "received" : "dispatched"} successfully!`);
    } else {
      // Old logic for backward compatibility
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
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { 
      id: "products", 
      label: "Products", 
      icon: Package,
      hasSubmenu: true,
      submenu: [
        { id: "products-show", label: "Show All Products", parent: "products" },
        { 
          id: "products-manage", 
          label: "Manage", 
          parent: "products",
          hasSubmenu: true,
          submenu: [
            { id: "products-received", label: "Product Received", parent: "products-manage" },
            { id: "products-dispatched", label: "Product Dispatched", parent: "products-manage" },
            { id: "products-delete", label: "Delete Product", parent: "products-manage" }
          ]
        }
      ]
    },
    { id: "add", label: "Add Product", icon: Plus },
    { id: "topmovers", label: "Top Movers", icon: TrendingUp },
    { id: "suggestions", label: "AI Suggestions", icon: Lightbulb },
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
    <div className={`animate-pulse rounded-2xl p-6 h-28 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}></div>
  );

  // Skeleton Product Card
  const SkeletonProductCard = () => (
    <div className={`animate-pulse rounded-2xl h-64 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}></div>
  );

  // Skeleton Table Row
  const SkeletonTableRow = () => (
    <tr className={`border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
      <td className="px-6 py-4"><div className={`animate-pulse h-4 rounded w-24 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}></div></td>
      <td className="px-6 py-4"><div className={`animate-pulse h-4 rounded w-16 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}></div></td>
      <td className="px-6 py-4"><div className={`animate-pulse h-4 rounded w-32 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}></div></td>
      <td className="px-6 py-4"><div className={`animate-pulse h-4 rounded w-20 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}></div></td>
      <td className="px-6 py-4"><div className={`animate-pulse h-4 rounded w-8 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}></div></td>
    </tr>
  );

  return (
    <div className={`flex h-screen relative font-sans transition-colors duration-300 ${
      darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
    }`}>

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
          <div className={`rounded-xl shadow-2xl w-[28rem] animate-slide-in overflow-hidden transition-colors ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
            <div className="px-8 pt-8 pb-4 text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-50 mb-5">
                <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{confirmModal.title}</h3>
              <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{confirmModal.message}</p>
            </div>
            <div className={`px-8 py-5 flex gap-3 justify-end ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
              <button
                onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                className={`px-5 py-2.5 text-sm font-medium border rounded-lg transition ${
                  darkMode ? "text-gray-300 bg-gray-800 border-gray-600 hover:bg-gray-700" : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                }`}
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
      <div className={`fixed md:static inset-y-0 left-0 w-72 shadow-2xl flex flex-col transform transition-transform z-50 md:z-auto ${
        darkMode ? "bg-gray-800 border-r border-gray-700" : "bg-[#1a1d29]"
      } ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
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
            const isActive = page === item.id || page.startsWith(item.id + "-");
            
            // Main navigation item
            if (item.hasSubmenu) {
              return (
                <div key={item.id}>
                  <button
                    onClick={() => setProductsSubmenuOpen(!productsSubmenuOpen)}
                    className={`flex items-center justify-between gap-3.5 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
                        : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon size={19} strokeWidth={isActive ? 2.5 : 1.5} />
                      {item.label}
                    </div>
                    <svg 
                      className={`h-4 w-4 transition-transform ${productsSubmenuOpen ? "rotate-180" : ""}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Submenu */}
                  {productsSubmenuOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.submenu.map(subItem => {
                        const isSubActive = page === subItem.id;
                        
                        // If submenu item has its own submenu (Manage)
                        if (subItem.hasSubmenu) {
                          return (
                            <div key={subItem.id}>
                              <button
                                onClick={() => setPage(subItem.id)}
                                className={`flex items-center justify-between gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                  isSubActive || page.startsWith(subItem.id + "-")
                                    ? "bg-indigo-500 text-white"
                                    : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
                                }`}
                              >
                                <span>{subItem.label}</span>
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                              
                              {/* Nested submenu for Manage */}
                              <div className="ml-4 mt-1 space-y-1">
                                {subItem.submenu.map(nestedItem => {
                                  const isNestedActive = page === nestedItem.id;
                                  return (
                                    <button
                                      key={nestedItem.id}
                                      onClick={() => { setPage(nestedItem.id); setMobileMenuOpen(false); }}
                                      className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                                        isNestedActive
                                          ? "bg-indigo-400 text-white"
                                          : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
                                      }`}
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                      {nestedItem.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }
                        
                        // Regular submenu item
                        return (
                          <button
                            key={subItem.id}
                            onClick={() => { setPage(subItem.id); setMobileMenuOpen(false); }}
                            className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                              isSubActive
                                ? "bg-indigo-500 text-white"
                                : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {subItem.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            
            // Regular navigation item (no submenu)
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
        <div className={`px-6 md:px-10 py-5 flex items-center justify-between gap-4 sticky top-0 z-30 border-b transition-colors duration-300 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className={`text-2xl md:hidden ${darkMode ? "text-gray-300" : "text-gray-600"}`}>☰</button>
            <div>
              <h1 className={`text-xl font-semibold capitalize ${darkMode ? "text-white" : "text-gray-900"}`}>
                {page === "add" ? "Add Product" : 
                 page === "lowstock" ? "Low Stock" : 
                 page === "worth" ? "Total Worth" : 
                 page === "topmovers" ? "Top Movers" : 
                 page === "suggestions" ? "AI Suggestions" :
                 page === "products-show" ? "All Products" :
                 page === "products-manage" ? "Manage Products" :
                 page === "products-received" ? "Product Received" :
                 page === "products-dispatched" ? "Product Dispatched" :
                 page === "products-delete" ? "Delete Product" :
                 page === "damaged" ? "Damaged Products" :
                 page}
              </h1>
              <p className="text-gray-400 text-xs mt-0.5">
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? "bg-gray-700 text-yellow-400 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User Avatar */}
            <div className={`hidden md:flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              darkMode ? "bg-gray-700" : "bg-gray-50"
            }`}>
              <div className="h-7 w-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <span className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>{user?.name || "Admin"}</span>
            </div>
          </div>
        </div>

        <div className="px-6 md:px-10 py-8">

          {/* DASHBOARD */}
          {page === "dashboard" && (
            <>
              {/* Period Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Dashboard Overview</h2>
                  <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Track your inventory performance and insights
                  </p>
                </div>
                <div className={`flex items-center gap-2 p-1 rounded-lg ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                  {[
                    { value: "7", label: "7D" },
                    { value: "30", label: "30D" },
                    { value: "90", label: "90D" },
                    { value: "all", label: "All" }
                  ].map(period => (
                    <button
                      key={period.value}
                      onClick={() => setDashboardPeriod(period.value)}
                      className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                        dashboardPeriod === period.value
                          ? "bg-indigo-600 text-white shadow-sm"
                          : darkMode
                          ? "text-gray-400 hover:text-white hover:bg-gray-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white"
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-8">
                  <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
                </div>
              ) : (
                <>
                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-8">
                    {[
                      { 
                        label: "Total Products", 
                        value: totalProducts, 
                        color: "indigo",
                        icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
                        onClick: () => setPage("products")
                      },
                      { 
                        label: "Total Stock", 
                        value: totalStock.toLocaleString(), 
                        color: "emerald",
                        icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      },
                      { 
                        label: "Total Value", 
                        value: `₹${totalValue.toLocaleString()}`, 
                        color: "purple",
                        icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                        onClick: () => setPage("worth")
                      },
                      { 
                        label: "Low Stock Alerts", 
                        value: lowStock, 
                        color: lowStock > 0 ? "red" : "gray",
                        icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                        onClick: () => setPage("lowstock")
                      },
                      { 
                        label: "Damaged Products", 
                        value: totalDamagedQuantity, 
                        color: damagedProducts > 0 ? "orange" : "gray",
                        icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
                        onClick: () => setPage("damaged")
                      }
                    ].map((card, i) => {
                      const colors = {
                        indigo: darkMode ? "bg-indigo-900/30 border-indigo-700" : "bg-indigo-50 border-indigo-200",
                        emerald: darkMode ? "bg-emerald-900/30 border-emerald-700" : "bg-emerald-50 border-emerald-200",
                        purple: darkMode ? "bg-purple-900/30 border-purple-700" : "bg-purple-50 border-purple-200",
                        red: darkMode ? "bg-red-900/30 border-red-700" : "bg-red-50 border-red-200",
                        orange: darkMode ? "bg-orange-900/30 border-orange-700" : "bg-orange-50 border-orange-200",
                        gray: darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                      };
                      const textColors = {
                        indigo: darkMode ? "text-indigo-400" : "text-indigo-600",
                        emerald: darkMode ? "text-emerald-400" : "text-emerald-600",
                        purple: darkMode ? "text-purple-400" : "text-purple-600",
                        red: darkMode ? "text-red-400" : "text-red-600",
                        orange: darkMode ? "text-orange-400" : "text-orange-600",
                        gray: darkMode ? "text-gray-400" : "text-gray-600"
                      };
                      return (
                        <div
                          key={i}
                          onClick={card.onClick}
                          className={`${colors[card.color]} border rounded-xl p-5 transition-all hover:shadow-md ${card.onClick ? "cursor-pointer" : ""}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className={`p-2 rounded-lg ${darkMode ? "bg-white/10" : "bg-white"}`}>
                              <svg className={`h-5 w-5 ${textColors[card.color]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                              </svg>
                            </div>
                          </div>
                          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {card.label}
                          </p>
                          <p className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {card.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Stock Overview (Bar Chart) */}
                    <div className={`rounded-xl border p-6 transition-colors lg:col-span-2 ${
                      darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Stock Overview
                          </h3>
                          <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                            Current stock levels by product
                          </p>
                        </div>
                        <Package size={20} className={darkMode ? "text-gray-600" : "text-gray-400"} />
                      </div>
                      {products.length === 0 ? (
                        <div className={`h-64 flex items-center justify-center ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
                          <p className="text-sm">No products added yet</p>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={chartData.slice(0, 10)}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                            <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} fontSize={12} />
                            <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} fontSize={12} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: darkMode ? "#1f2937" : "#fff",
                                border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                                borderRadius: "8px"
                              }}
                            />
                            <Bar dataKey="quantity" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Second Row - Value Distribution & Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Value Distribution (Pie Chart) */}
                    <div className={`rounded-xl border p-6 transition-colors ${
                      darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Value Distribution
                          </h3>
                          <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                            Stock value by product
                          </p>
                        </div>
                      </div>
                      {products.length === 0 ? (
                        <div className={`h-64 flex items-center justify-center ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
                          <p className="text-sm">No data available</p>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Pie
                              data={products.slice(0, 6).map(p => ({
                                name: p.name,
                                value: p.quantity * p.price
                              }))}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {products.slice(0, 6).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: darkMode ? "#1f2937" : "#fff",
                                border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                                borderRadius: "8px"
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    {/* Recent Activity Feed */}
                    <div className={`rounded-xl border p-6 transition-colors ${
                      darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Recent Activity
                          </h3>
                          <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                            Latest stock movements
                          </p>
                        </div>
                        <button
                          onClick={() => setPage("history")}
                          className={`text-xs font-semibold px-3 py-1.5 rounded transition ${
                            darkMode ? "text-indigo-400 hover:bg-gray-700" : "text-indigo-600 hover:bg-gray-100"
                          }`}
                        >
                          View All →
                        </button>
                      </div>
                      {history.length === 0 ? (
                        <div className={`h-64 flex items-center justify-center ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
                          <div className="text-center">
                            <Clock size={40} className={`mx-auto mb-3 ${darkMode ? "text-gray-700" : "text-gray-300"}`} />
                            <p className="text-sm">No activity yet</p>
                            <p className="text-xs mt-1">Start adding or removing products to see activity</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {history.slice(0, 8).map((entry, idx) => {
                            const isAdd = entry.change.startsWith('+');
                            const isUpdate = entry.change.includes('Updated');
                            const borderColor = isUpdate 
                              ? darkMode ? 'border-gray-600' : 'border-gray-300'
                              : isAdd 
                              ? darkMode ? 'border-emerald-700' : 'border-emerald-300'
                              : darkMode ? 'border-red-700' : 'border-red-300';
                            const bgColor = isUpdate 
                              ? darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                              : isAdd 
                              ? darkMode ? 'bg-emerald-900/20' : 'bg-emerald-50'
                              : darkMode ? 'bg-red-900/20' : 'bg-red-50';
                            return (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg border-l-4 ${borderColor} ${bgColor} transition hover:shadow-sm`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                                      {entry.name}
                                    </p>
                                    <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                      {entry.note || 'No notes'}
                                    </p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className={`text-sm font-bold ${
                                      isUpdate 
                                        ? darkMode ? 'text-gray-400' : 'text-gray-600'
                                        : isAdd 
                                        ? 'text-emerald-600' 
                                        : 'text-red-600'
                                    }`}>
                                      {entry.change}
                                    </p>
                                    <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                      {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* PRODUCTS */}
          {page === "products" && (
            <div>
              {/* Download Button */}
              {products.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={async () => {
                      try {
                        const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
                        const res = await fetch(`${baseUrl}/products/download`, {
                          headers: {
                            Authorization: `Bearer ${token}`
                          }
                        });
                        if (res.ok) {
                          const blob = await res.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "products_export.csv";
                          a.click();
                          window.URL.revokeObjectURL(url);
                        }
                      } catch (err) {
                        console.error("Download failed:", err);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm transition ${
                      darkMode ? "bg-green-600 hover:bg-green-700 text-white" : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    📥 Download Products CSV
                  </button>
                </div>
              )}
              
              {/* Sort Bar */}
              <div className={`border rounded-xl shadow-sm p-4 mb-6 overflow-x-auto whitespace-nowrap transition-colors duration-300 ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}>
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
                          : darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                      p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
                    )
                  ).map(p => (
                <div key={p._id} className={`border rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all overflow-hidden ${
                  darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}>
                  <div className={`h-1 ${p.quantity <= p.minStock ? "bg-red-500" : "bg-emerald-500"}`}></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className={`text-base font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>{p.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.quantity <= p.minStock
                          ? darkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700"
                          : darkMode ? "bg-emerald-900/50 text-emerald-300" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {p.quantity <= p.minStock ? "Low" : "In Stock"}
                      </span>
                    </div>

                    <div className="space-y-2.5 mb-5">
                      <div className="flex justify-between text-sm">
                        <span className={darkMode ? "text-gray-400" : "text-gray-400"}>Quantity</span>
                        <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-900"}`}>{p.quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={darkMode ? "text-gray-400" : "text-gray-400"}>Price</span>
                        <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-900"}`}>₹{p.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={darkMode ? "text-gray-400" : "text-gray-400"}>Min Stock</span>
                        <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-900"}`}>{p.minStock}</span>
                      </div>
                      {p.category && (
                        <div className="flex justify-between text-sm">
                          <span className={darkMode ? "text-gray-400" : "text-gray-400"}>Category</span>
                          <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-900"}`}>{p.category.name}</span>
                        </div>
                      )}
                      {p.subcategory && (
                        <div className="flex justify-between text-sm">
                          <span className={darkMode ? "text-gray-400" : "text-gray-400"}>Subcategory</span>
                          <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-900"}`}>{p.subcategory.name}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className={darkMode ? "text-gray-400" : "text-gray-400"}>Value</span>
                        <span className={`font-semibold ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>₹{(p.quantity * p.price).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="relative">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === p._id ? null : p._id)}
                        className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${
                          darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        Manage Product
                        <svg className={`h-4 w-4 transition-transform ${openMenuId === p._id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === p._id && (
                        <>
                          {/* Backdrop to close menu */}
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenMenuId(null)}
                          ></div>
                          
                          <div className={`absolute left-0 right-0 mt-2 rounded-lg shadow-xl border overflow-hidden z-20 ${
                            darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
                          }`}>
                            <button
                              onClick={() => {
                                openPopup(p, "receive");
                                setOpenMenuId(null);
                              }}
                              className={`w-full px-4 py-3 text-left text-sm font-medium transition flex items-center gap-3 ${
                                darkMode ? "hover:bg-gray-600 text-emerald-300" : "hover:bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                              </svg>
                              Product Received
                            </button>
                            
                            <button
                              onClick={() => {
                                openPopup(p, "dispatch");
                                setOpenMenuId(null);
                              }}
                              className={`w-full px-4 py-3 text-left text-sm font-medium transition flex items-center gap-3 border-t ${
                                darkMode ? "hover:bg-gray-600 text-blue-300 border-gray-600" : "hover:bg-blue-50 text-blue-700 border-gray-100"
                              }`}
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
                              Product Dispatched
                            </button>

                            <button
                              onClick={() => {
                                setSelectedProduct(p);
                                setOperation("view");
                                setOpenMenuId(null);
                              }}
                              className={`w-full px-4 py-3 text-left text-sm font-medium transition flex items-center gap-3 border-t ${
                                darkMode ? "hover:bg-gray-600 text-indigo-300 border-gray-600" : "hover:bg-indigo-50 text-indigo-700 border-gray-100"
                              }`}
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Details
                            </button>

                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                confirmAction(
                                  "Delete Product?",
                                  `Are you sure you want to delete "${p.name}"?`,
                                  () => deleteProduct(p._id)
                                );
                              }}
                              className={`w-full px-4 py-3 text-left text-sm font-medium transition flex items-center gap-3 border-t ${
                                darkMode ? "hover:bg-red-900/30 text-red-300 border-gray-600" : "hover:bg-red-50 text-red-700 border-gray-100"
                              }`}
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete Product
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {getSortedProducts(
                  products.filter(p =>
                    p.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                ).length === 0 && (
                <div className={`col-span-3 p-12 rounded-xl text-center text-lg transition-colors ${
                  darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
                }`}>
                  {searchQuery ? `No products found for "${searchQuery}"` : "No products yet."}
                </div>
              )}
                </div>
              )}
            </div>
          )}

          {/* SHOW ALL PRODUCTS */}
          {page === "products-show" && (
            <div>
              {/* Filters and Download Section */}
              <div className={`mb-6 p-4 rounded-xl border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <div className="flex flex-col gap-4">
                  {/* Search Bar */}
                  <div className="w-full">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Search Products
                    </label>
                    <div className="relative">
                      <svg className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${darkMode ? "text-gray-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search by product name..."
                        value={showProductsSearch}
                        onChange={(e) => setShowProductsSearch(e.target.value)}
                        className={`w-full border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                          darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                        }`}
                      />
                      {showProductsSearch && (
                        <button
                          onClick={() => setShowProductsSearch("")}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filters Row */}
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                    {/* Category Filter */}
                    <div className="flex-1">
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Filter by Category
                      </label>
                      <select
                        value={filterCategory}
                        onChange={(e) => {
                          setFilterCategory(e.target.value);
                          setFilterSubcategory(""); // Reset subcategory when category changes
                          if (e.target.value) {
                            fetchSubcategories(e.target.value);
                          }
                        }}
                        className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                          darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"
                        }`}
                      >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Subcategory Filter */}
                    <div className="flex-1">
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Filter by Subcategory
                      </label>
                      <select
                        value={filterSubcategory}
                        onChange={(e) => setFilterSubcategory(e.target.value)}
                        disabled={!filterCategory}
                        className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                          darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"
                        } ${!filterCategory ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <option value="">All Subcategories</option>
                        {subcategories.map(sub => (
                          <option key={sub._id} value={sub._id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Clear Filters Button */}
                    {(filterCategory || filterSubcategory || showProductsSearch) && (
                      <button
                        onClick={() => {
                          setFilterCategory("");
                          setFilterSubcategory("");
                          setShowProductsSearch("");
                        }}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                          darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                      >
                        Clear All
                      </button>
                    )}

                    {/* Download Button */}
                    <button
                      onClick={async () => {
                        try {
                          const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
                          const params = new URLSearchParams();
                          if (filterCategory) params.append("category", filterCategory);
                          if (filterSubcategory) params.append("subcategory", filterSubcategory);
                          if (showProductsSearch) params.append("search", showProductsSearch);
                          
                          const res = await fetch(`${baseUrl}/products/download?${params.toString()}`, {
                            headers: {
                              Authorization: `Bearer ${token}`
                            }
                          });
                          if (res.ok) {
                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "products_export.csv";
                            a.click();
                            window.URL.revokeObjectURL(url);
                            showToast("Products exported successfully!");
                          }
                        } catch (err) {
                          console.error("Download failed:", err);
                          showToast("Download failed", "error");
                        }
                      }}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
                        darkMode ? "bg-green-600 hover:bg-green-700 text-white" : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download CSV
                    </button>
                  </div>
                </div>

                {/* Filter Summary */}
                {(filterCategory || filterSubcategory || showProductsSearch) && (
                  <div className={`mt-4 pt-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Showing products
                      {showProductsSearch && (
                        <span className="font-semibold"> matching "{showProductsSearch}"</span>
                      )}
                      {filterCategory && (
                        <span className="font-semibold"> in category: {categories.find(c => c._id === filterCategory)?.name}</span>
                      )}
                      {filterSubcategory && (
                        <span className="font-semibold"> → subcategory: {subcategories.find(s => s._id === filterSubcategory)?.name}</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Product Table */}
              {productsLoading ? (
                <LoadingSpinner />
              ) : (
                <div className={`rounded-xl border overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                        <tr>
                          <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Product Name</th>
                          <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Category</th>
                          <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Subcategory</th>
                          <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Quantity</th>
                          <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Price</th>
                          <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Min Stock</th>
                          <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Total Value</th>
                          <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Status</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                        {products
                          .filter(p => {
                            // Apply search filter
                            if (showProductsSearch && !p.name.toLowerCase().includes(showProductsSearch.toLowerCase())) return false;
                            // Apply category filter
                            if (filterCategory && p.category?._id !== filterCategory) return false;
                            // Apply subcategory filter
                            if (filterSubcategory && p.subcategory?._id !== filterSubcategory) return false;
                            return true;
                          })
                          .map(p => (
                          <tr key={p._id} className={`transition ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}>
                            <td className={`px-6 py-4 font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{p.name}</td>
                            <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                              {p.category ? (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"
                                }`}>
                                  {p.category.name}
                                </span>
                              ) : (
                                <span className={darkMode ? "text-gray-500" : "text-gray-400"}>—</span>
                              )}
                            </td>
                            <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                              {p.subcategory ? (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  darkMode ? "bg-purple-900/30 text-purple-300" : "bg-purple-100 text-purple-700"
                                }`}>
                                  {p.subcategory.name}
                                </span>
                              ) : (
                                <span className={darkMode ? "text-gray-500" : "text-gray-400"}>—</span>
                              )}
                            </td>
                            <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{p.quantity}</td>
                            <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>₹{p.price.toLocaleString()}</td>
                            <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{p.minStock}</td>
                            <td className={`px-6 py-4 font-semibold ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>₹{(p.quantity * p.price).toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                p.quantity <= p.minStock
                                  ? darkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700"
                                  : darkMode ? "bg-emerald-900/50 text-emerald-300" : "bg-emerald-100 text-emerald-700"
                              }`}>
                                {p.quantity <= p.minStock ? "Low Stock" : "In Stock"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {products.filter(p => {
                    if (showProductsSearch && !p.name.toLowerCase().includes(showProductsSearch.toLowerCase())) return false;
                    if (filterCategory && p.category?._id !== filterCategory) return false;
                    if (filterSubcategory && p.subcategory?._id !== filterSubcategory) return false;
                    return true;
                  }).length === 0 && (
                    <div className={`p-12 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      No products found matching the selected filters.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PRODUCT RECEIVED */}
          {page === "products-received" && (
            <div>
              <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Select a product to record received stock
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map(p => (
                  <div key={p._id} className={`border rounded-xl p-6 transition hover:shadow-lg cursor-pointer ${
                    darkMode ? "bg-gray-800 border-gray-700 hover:border-emerald-500" : "bg-white border-gray-200 hover:border-emerald-500"
                  }`}
                  onClick={() => openPopup(p, "receive")}
                  >
                    <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>{p.name}</h3>
                    <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Current Stock: <span className="font-bold">{p.quantity}</span></p>
                    <button className={`w-full py-2 rounded-lg font-medium transition ${
                      darkMode ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    }`}>
                      📦 Record Received
                    </button>
                  </div>
                ))}
              </div>
              
              {products.length === 0 && (
                <div className={`p-12 rounded-xl text-center ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                  No products available.
                </div>
              )}
            </div>
          )}

          {/* PRODUCT DISPATCHED */}
          {page === "products-dispatched" && (
            <div>
              <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Select a product to record dispatched stock
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map(p => (
                  <div key={p._id} className={`border rounded-xl p-6 transition hover:shadow-lg cursor-pointer ${
                    darkMode ? "bg-gray-800 border-gray-700 hover:border-blue-500" : "bg-white border-gray-200 hover:border-blue-500"
                  }`}
                  onClick={() => openPopup(p, "dispatch")}
                  >
                    <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>{p.name}</h3>
                    <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Current Stock: <span className="font-bold">{p.quantity}</span></p>
                    <button className={`w-full py-2 rounded-lg font-medium transition ${
                      darkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}>
                      🚚 Record Dispatched
                    </button>
                  </div>
                ))}
              </div>
              
              {products.length === 0 && (
                <div className={`p-12 rounded-xl text-center ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                  No products available.
                </div>
              )}
            </div>
          )}

          {/* DELETE PRODUCT */}
          {page === "products-delete" && (
            <div>
              <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Select a product to delete
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map(p => (
                  <div key={p._id} className={`border rounded-xl p-6 transition hover:shadow-lg ${
                    darkMode ? "bg-gray-800 border-gray-700 hover:border-red-500" : "bg-white border-gray-200 hover:border-red-500"
                  }`}>
                    <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>{p.name}</h3>
                    <div className={`text-sm mb-4 space-y-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      <p>Stock: <span className="font-bold">{p.quantity}</span></p>
                      <p>Price: <span className="font-bold">₹{p.price.toLocaleString()}</span></p>
                      <p>Value: <span className="font-bold">₹{(p.quantity * p.price).toLocaleString()}</span></p>
                    </div>
                    <button 
                      onClick={() => {
                        confirmAction(
                          "Delete Product?",
                          `Are you sure you want to delete "${p.name}"? This action cannot be undone.`,
                          () => deleteProduct(p._id)
                        );
                      }}
                      className={`w-full py-2 rounded-lg font-medium transition ${
                        darkMode ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                    >
                      🗑️ Delete Product
                    </button>
                  </div>
                ))}
              </div>
              
              {products.length === 0 && (
                <div className={`p-12 rounded-xl text-center ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                  No products available.
                </div>
              )}
            </div>
          )}

          {/* LOW STOCK */}
          {page === "lowstock" && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className={`text-2xl font-bold ${darkMode ? "text-red-400" : "text-red-600"}`}>⚠️ Low Stock Items</h2>
                <button
                  onClick={() => setPage("dashboard")}
                  className={`px-4 py-2 rounded-lg transition w-full md:w-auto ${
                    darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  ← Back
                </button>
              </div>

              {products.filter(p => p.quantity <= p.minStock).length === 0 ? (
                <div className={`p-6 rounded-xl text-center text-lg font-semibold ${
                  darkMode ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700"
                }`}>
                  ✅ All products are well stocked!
                </div>
              ) : (
                <div className="space-y-3">
                  {products.filter(p => p.quantity <= p.minStock).map(p => (
                    <div key={p._id} className={`p-4 rounded-lg shadow flex justify-between items-center border-l-4 border-red-500 transition-colors ${
                      darkMode ? "bg-gray-800" : "bg-white"
                    }`}>
                      <div>
                        <h3 className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>{p.name}</h3>
                        <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>Stock: <span className={`font-bold ${darkMode ? "text-red-400" : "text-red-600"}`}>{p.quantity}</span> / {p.minStock}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setForm(p);
                            setEditId(p._id);
                            setPage("add");
                          }}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
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
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
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

          {/* DAMAGED PRODUCTS */}
          {page === "damaged" && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className={`text-2xl font-bold ${darkMode ? "text-orange-400" : "text-orange-600"}`}>⚠️ Damaged Products</h2>
                <button
                  onClick={() => setPage("dashboard")}
                  className={`px-4 py-2 rounded-lg transition w-full md:w-auto ${
                    darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  ← Back
                </button>
              </div>

              {products.filter(p => p.damagedQuantity > 0).length === 0 ? (
                <div className={`p-6 rounded-xl text-center text-lg font-semibold ${
                  darkMode ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700"
                }`}>
                  ✅ No damaged products!
                </div>
              ) : (
                <div className="space-y-3">
                  {products.filter(p => p.damagedQuantity > 0).map(p => (
                    <div key={p._id} className={`p-4 rounded-lg shadow flex justify-between items-center border-l-4 border-orange-500 transition-colors ${
                      darkMode ? "bg-gray-800" : "bg-white"
                    }`}>
                      <div>
                        <h3 className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>{p.name}</h3>
                        <div className={`mt-1 space-y-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          <p>Good Stock: <span className={`font-bold ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>{p.quantity}</span></p>
                          <p>Damaged: <span className={`font-bold ${darkMode ? "text-orange-400" : "text-orange-600"}`}>{p.damagedQuantity}</span></p>
                          <p>Total: <span className="font-bold">{p.quantity + p.damagedQuantity}</span></p>
                          {p.category && (
                            <p>Category: <span className="font-semibold">{p.category.name}</span></p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setForm(p);
                            setEditId(p._id);
                            setSelectedCategory(p.category?._id || "");
                            setSelectedSubcategory(p.subcategory?._id || "");
                            if (p.category?._id) {
                              fetchSubcategories(p.category._id);
                            }
                            setPage("add");
                          }}
                          className={`px-3 py-1 rounded text-sm font-medium transition ${
                            darkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
                          }`}
                        >
                          Edit
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
                <h2 className={`text-2xl font-bold ${darkMode ? "text-purple-400" : "text-purple-600"}`}>💰 Total Worth Breakdown</h2>
                <button
                  onClick={() => setPage("dashboard")}
                  className={`px-4 py-2 rounded-lg transition w-full md:w-auto ${
                    darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  ← Back
                </button>
              </div>

              {products.length === 0 ? (
                <div className={`p-8 rounded-xl text-center text-lg transition-colors ${
                  darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
                }`}>
                  No products yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map(p => (
                    <div key={p._id} className={`p-4 rounded-lg shadow flex justify-between items-center transition-colors ${
                      darkMode ? "bg-gray-800" : "bg-white"
                    }`}>
                      <div>
                        <h3 className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>{p.name}</h3>
                        <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>{p.quantity} units × ₹{p.price} each</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${darkMode ? "text-purple-400" : "text-purple-600"}`}>₹{p.quantity * p.price}</p>
                      </div>
                    </div>
                  ))}
                  <div className={`border-2 p-4 rounded-lg flex justify-between items-center ${
                    darkMode ? "bg-purple-900/30 border-purple-700" : "bg-purple-100 border-purple-400"
                  }`}>
                    <h3 className={`font-bold text-lg ${darkMode ? "text-purple-300" : "text-purple-800"}`}>Grand Total</h3>
                    <p className={`text-2xl font-bold ${darkMode ? "text-purple-300" : "text-purple-800"}`}>₹{totalValue}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ADD / EDIT PRODUCT */}
          {page === "add" && (
            <div className="max-w-2xl">
              <div className={`border rounded-xl shadow-sm p-8 transition-colors duration-300 ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}>
                <h2 className={`text-xl font-semibold mb-8 ${darkMode ? "text-white" : "text-gray-900"}`}>
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
                      <label className={`md:w-36 text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{field.label}</label>
                      <input
                        name={field.name}
                        type={field.type}
                        min={field.type === "number" ? "0" : undefined}
                        step={field.step}
                        value={form[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className={`flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                          darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500" : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                    </div>
                  ))}

                  {/* Damaged Quantity Field (Optional) */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <label className={`md:w-36 text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Damaged Quantity
                      <span className={`ml-1 text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>(Optional)</span>
                    </label>
                    <input
                      name="damagedQuantity"
                      type="number"
                      min="0"
                      value={form.damagedQuantity}
                      onChange={handleChange}
                      placeholder="e.g., 5"
                      className={`flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                        darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500" : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>

                  {/* Category Dropdown */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <label className={`md:w-36 text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Category</label>
                    <div className="flex-1 flex gap-2">
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setSelectedSubcategory("");
                          fetchSubcategories(e.target.value);
                        }}
                        className={`flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                          darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"
                        }`}
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setShowAddCategory(true)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                          darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                        title="Add New Category"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Add New Category Modal */}
                  {showAddCategory && (
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <label className={`md:w-36 text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>New Category</label>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Enter category name"
                          className={`flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                            darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500" : "bg-white border-gray-300 text-gray-900"
                          }`}
                          onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                        />
                        <button
                          onClick={addCategory}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => { setShowAddCategory(false); setNewCategoryName(""); }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Subcategory Dropdown */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <label className={`md:w-36 text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Subcategory</label>
                    <div className="flex-1 flex gap-2">
                      <select
                        value={selectedSubcategory}
                        onChange={(e) => setSelectedSubcategory(e.target.value)}
                        disabled={!selectedCategory}
                        className={`flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                          darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"
                        } ${!selectedCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <option value="">Select Subcategory</option>
                        {subcategories.map(sub => (
                          <option key={sub._id} value={sub._id}>{sub.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => { if (selectedCategory) setShowAddSubcategory(true); }}
                        disabled={!selectedCategory}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                          !selectedCategory ? 'opacity-50 cursor-not-allowed' : ''
                        } ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}
                        title="Add New Subcategory"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Add New Subcategory Modal */}
                  {showAddSubcategory && (
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <label className={`md:w-36 text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>New Subcategory</label>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={newSubcategoryName}
                          onChange={(e) => setNewSubcategoryName(e.target.value)}
                          placeholder="Enter subcategory name"
                          className={`flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                            darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500" : "bg-white border-gray-300 text-gray-900"
                          }`}
                          onKeyPress={(e) => e.key === 'Enter' && addSubcategory()}
                        />
                        <button
                          onClick={addSubcategory}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => { setShowAddSubcategory(false); setNewSubcategoryName(""); }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
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

          {/* TOP MOVERS */}
          {page === "topmovers" && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className={`text-2xl font-bold ${darkMode ? "text-orange-400" : "text-orange-600"}`}>🔥 Top Movers</h2>
                  <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Products with the highest stock movement velocity</p>
                </div>
                <button
                  onClick={fetchTopMovers}
                  className={`px-4 py-2 rounded-lg text-sm transition w-full md:w-auto ${
                    darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  🔄 Refresh
                </button>
              </div>

              {topMoversLoading ? (
                <div className={`rounded-xl shadow-lg overflow-hidden transition-colors duration-300 ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className={`border-b transition-colors ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                          <th className={`text-left px-6 py-3 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Rank</th>
                          <th className={`text-left px-6 py-3 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Product</th>
                          <th className={`text-left px-6 py-3 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Total Moved</th>
                          <th className={`text-left px-6 py-3 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Transactions</th>
                          <th className={`text-left px-6 py-3 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Last Activity</th>
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
              ) : topMovers.length === 0 ? (
                <div className={`p-8 rounded-xl text-center text-lg transition-colors ${
                  darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
                }`}>
                  No stock movements yet. Start adding or removing products to see top movers!
                </div>
              ) : (
                <div className={`rounded-xl shadow-lg overflow-hidden transition-colors duration-300 ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className={`border-b transition-colors ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                          <th className={`text-left px-6 py-3 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Rank</th>
                          <th className={`text-left px-6 py-3 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Product</th>
                          <th className={`text-left px-6 py-3 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Total Moved</th>
                          <th className={`text-left px-6 py-3 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Transactions</th>
                          <th className={`text-left px-6 py-3 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Last Activity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topMovers.map((mover, index) => {
                          const rank = index + 1;
                          const rankBadge = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;
                          const lastActivityDate = new Date(mover.lastActivity).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          });
                          return (
                            <tr key={mover.name} className={`border-b transition-colors ${darkMode ? "border-gray-700 hover:bg-gray-700/50" : "border-gray-100 hover:bg-gray-50"}`}>
                              <td className="px-6 py-4">
                                <span className="text-xl">{rankBadge}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`font-semibold text-lg ${darkMode ? "text-blue-400" : "text-blue-600"}`}>{mover.name}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className={`h-2 rounded-full ${darkMode ? "bg-orange-900" : "bg-orange-100"}`} style={{ width: `${Math.min((mover.totalMoved / (topMovers[0]?.totalMoved || 1)) * 100, 100)}px` }}></div>
                                  <span className={`font-bold ${darkMode ? "text-orange-400" : "text-orange-600"}`}>{mover.totalMoved} units</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                  mover.transactions > 10
                                    ? darkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700"
                                    : mover.transactions > 5
                                    ? darkMode ? "bg-amber-900/50 text-amber-300" : "bg-amber-100 text-amber-700"
                                    : darkMode ? "bg-emerald-900/50 text-emerald-300" : "bg-emerald-100 text-emerald-700"
                                }`}>
                                  {mover.transactions} {mover.transactions === 1 ? "time" : "times"}
                                </span>
                              </td>
                              <td className={`px-6 py-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                {lastActivityDate}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI SUGGESTIONS */}
          {page === "suggestions" && (
            <AISuggestionsPage darkMode={darkMode} />
          )}

          {/* HISTORY */}
          {page === "history" && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>📋 History</h2>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  {history.length > 0 && (
                    <button
                      onClick={async () => {
                        try {
                          const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
                          const params = new URLSearchParams();
                          if (historyFilterName) params.append("name", historyFilterName);
                          if (historyFilterDateFrom) params.append("dateFrom", historyFilterDateFrom);
                          if (historyFilterDateTo) params.append("dateTo", historyFilterDateTo);
                          if (historyFilterType && historyFilterType !== "all") params.append("type", historyFilterType);
                          
                          const query = params.toString();
                          const res = await fetch(`${baseUrl}/history/download${query ? `?${query}` : ""}`, {
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
                      className={`px-4 py-2 rounded-lg text-sm transition w-full md:w-auto ${
                        darkMode ? "bg-green-600 hover:bg-green-700 text-white" : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
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
              <div className={`rounded-xl shadow-lg p-4 mb-6 transition-colors duration-300 ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}>
                <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className={`text-sm font-semibold whitespace-nowrap ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Search:</span>
                    <input
                      type="text"
                      placeholder="Product name..."
                      value={historyFilterName}
                      onChange={(e) => setHistoryFilterName(e.target.value)}
                      className={`border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 w-full transition-colors ${
                        darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500" : "border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className={`text-sm font-semibold whitespace-nowrap ${darkMode ? "text-gray-400" : "text-gray-600"}`}>From:</span>
                    <input
                      type="date"
                      value={historyFilterDateFrom}
                      onChange={(e) => setHistoryFilterDateFrom(e.target.value)}
                      className={`border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 w-full transition-colors ${
                        darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className={`text-sm font-semibold whitespace-nowrap ${darkMode ? "text-gray-400" : "text-gray-600"}`}>To:</span>
                    <input
                      type="date"
                      value={historyFilterDateTo}
                      onChange={(e) => setHistoryFilterDateTo(e.target.value)}
                      className={`border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 w-full transition-colors ${
                        darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className={`text-sm font-semibold whitespace-nowrap ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Type:</span>
                    <select
                      value={historyFilterType}
                      onChange={(e) => setHistoryFilterType(e.target.value)}
                      className={`border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 w-full transition-colors ${
                        darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-300 text-gray-900"
                      }`}
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
                      <div className={`p-8 rounded-xl text-center text-lg transition-colors ${
                        darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
                      }`}>
                        {history.length === 0 ? "No history yet." : "No results match your filters."}
                      </div>
                    ) : (
                      <div className={`rounded-xl shadow-lg overflow-hidden transition-colors duration-300 ${
                        darkMode ? "bg-gray-800" : "bg-white"
                      }`}>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[600px]">
                          <thead>
                            <tr className={`border-b transition-colors ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                              <th className={`text-left px-6 py-3 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Product</th>
                              <th className={`text-left px-6 py-3 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Stock Change</th>
                              <th className={`text-left px-6 py-3 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Time</th>
                              <th className={`text-left px-6 py-3 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Note</th>
                              <th className={`text-right px-6 py-3 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map((h) => (
                              <tr key={h._id} className={`border-b transition-colors ${darkMode ? "border-gray-700 hover:bg-gray-700/50" : "border-gray-100 hover:bg-gray-50"}`}>
                                <td className="px-6 py-4">
                                  <span className={`font-semibold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>{h.name}</span>
                                </td>
                                <td className="px-6 py-4">
                                  {h.change.startsWith("+") ? (
                                    <span className={`font-semibold ${darkMode ? "text-green-400" : "text-green-600"}`}>
                                      {h.change} ↑
                                    </span>
                                  ) : h.change.startsWith("-") ? (
                                    <span className={`font-semibold ${darkMode ? "text-red-400" : "text-red-600"}`}>
                                      {h.change} ↓
                                    </span>
                                  ) : (
                                    <span className={`font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                      {h.change}
                                    </span>
                                  )}
                                </td>
                                <td className={`px-6 py-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                  📅 {h.time}
                                </td>
                                <td className={`px-6 py-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
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
                        <div className={`px-6 py-3 text-sm text-right border-t transition-colors ${
                          darkMode ? "bg-gray-700 text-gray-400 border-gray-600" : "bg-gray-50 text-gray-500 border-gray-200"
                        }`}>
                          Showing {filtered.length} of {history.length} entries
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* POPUP - Product Operations */}
          {selectedProduct && operation !== "view" && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className={`p-8 rounded-2xl shadow-2xl w-[28rem] transition-colors ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}>
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
                  {operation === "receive" ? "📦 Product Received" : 
                   operation === "dispatch" ? "🚚 Product Dispatched" :
                   operation === "add" ? "➕ Add Stock" : "➖ Subtract Stock"}
                </h3>
                <p className={`mb-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {selectedProduct.name} — Current: <span className={`font-bold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{selectedProduct.quantity}</span>
                  {selectedProduct.damagedQuantity > 0 && (
                    <span className={`ml-2 ${darkMode ? "text-orange-400" : "text-orange-600"}`}>
                      (Damaged: {selectedProduct.damagedQuantity})
                    </span>
                  )}
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
                  placeholder={operation === "receive" ? "Enter good quantity received" : "Enter quantity"}
                  className={`w-full border-2 rounded-lg p-3 mb-3 focus:outline-none focus:border-blue-500 text-lg transition-colors ${
                    darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500" : "border-gray-300 text-gray-900"
                  }`}
                />

                {operation === "receive" && (
                  <input
                    type="number"
                    min="0"
                    value={damagedValue}
                    onChange={(e) => setDamagedValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && changeValue) {
                        applyChange();
                      }
                    }}
                    placeholder="Enter damaged quantity (optional)"
                    className={`w-full border-2 rounded-lg p-3 mb-3 focus:outline-none focus:border-orange-500 text-lg transition-colors ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500" : "border-gray-300 text-gray-900"
                    }`}
                  />
                )}

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
                  className={`w-full border-2 rounded-lg p-3 mb-4 focus:outline-none focus:border-blue-500 text-sm transition-colors ${
                    darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500" : "border-gray-300 text-gray-900"
                  }`}
                />

                <div className="flex gap-3">
                  <button
                    onClick={applyChange}
                    disabled={!changeValue}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      setDamagedValue("");
                    }}
                    className={`flex-1 font-semibold py-2.5 rounded-lg transition ${
                      darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW ALL MODAL - Product Details */}
          {selectedProduct && operation === "view" && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
              <div className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transition-colors ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}>
                {/* Header */}
                <div className={`px-8 py-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {selectedProduct.name}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-2 ${
                        selectedProduct.quantity <= selectedProduct.minStock
                          ? darkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700"
                          : darkMode ? "bg-emerald-900/50 text-emerald-300" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {selectedProduct.quantity <= selectedProduct.minStock ? "Low Stock" : "In Stock"}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className={`p-2 rounded-lg transition ${
                        darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                      }`}
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-8 py-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                      <p className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Current Quantity</p>
                      <p className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedProduct.quantity}</p>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                      <p className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Price per Unit</p>
                      <p className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>₹{selectedProduct.price.toLocaleString()}</p>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                      <p className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Minimum Stock</p>
                      <p className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedProduct.minStock}</p>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? "bg-indigo-900/30" : "bg-indigo-50"}`}>
                      <p className={`text-sm font-medium mb-1 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>Total Value</p>
                      <p className={`text-3xl font-bold ${darkMode ? "text-indigo-300" : "text-indigo-700"}`}>₹{(selectedProduct.quantity * selectedProduct.price).toLocaleString()}</p>
                    </div>
                  </div>

                  {(selectedProduct.category || selectedProduct.subcategory) && (
                    <div className={`p-4 rounded-lg mb-6 ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                      <h4 className={`text-sm font-semibold mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Classification</h4>
                      <div className="space-y-2">
                        {selectedProduct.category && (
                          <div className="flex justify-between">
                            <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Category</span>
                            <span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedProduct.category.name}</span>
                          </div>
                        )}
                        {selectedProduct.subcategory && (
                          <div className="flex justify-between">
                            <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Subcategory</span>
                            <span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedProduct.subcategory.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                    <h4 className={`text-sm font-semibold mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Stock Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Available</span>
                        <span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedProduct.quantity} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Difference from Min</span>
                        <span className={`font-medium ${
                          selectedProduct.quantity - selectedProduct.minStock < 0 
                            ? "text-red-500" 
                            : darkMode ? "text-emerald-400" : "text-emerald-600"
                        }`}>
                          {selectedProduct.quantity - selectedProduct.minStock > 0 ? "+" : ""}{selectedProduct.quantity - selectedProduct.minStock} units
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className={`px-8 py-4 border-t flex gap-3 ${darkMode ? "border-gray-700 bg-gray-750" : "border-gray-200 bg-gray-50"}`}>
                  <button
                    onClick={() => {
                      setOperation("receive");
                      setChangeValue("");
                      setNote("");
                    }}
                    className={`flex-1 py-2.5 rounded-lg font-medium transition ${
                      darkMode ? "bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-300" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    📦 Receive
                  </button>
                  <button
                    onClick={() => {
                      setOperation("dispatch");
                      setChangeValue("");
                      setNote("");
                    }}
                    className={`flex-1 py-2.5 rounded-lg font-medium transition ${
                      darkMode ? "bg-blue-900/30 hover:bg-blue-900/50 text-blue-300" : "bg-blue-50 hover:bg-blue-100 text-blue-700"
                    }`}
                  >
                    🚚 Dispatch
                  </button>
                  <button
                    onClick={() => editProduct(selectedProduct)}
                    className={`flex-1 py-2.5 rounded-lg font-medium transition ${
                      darkMode ? "bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-300" : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    ✏️ Edit
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