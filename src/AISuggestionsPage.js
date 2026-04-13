import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { Lightbulb, AlertTriangle, TrendingUp, TrendingDown, Package, DollarSign, Calendar, Gift, Trash2, Check, X, Filter, RefreshCw } from "lucide-react";

function AISuggestionsPage({ darkMode }) {
  const { token } = useContext(AuthContext);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== "all") params.append("type", filterType);
      if (filterPriority !== "all") params.append("priority", filterPriority);

      const res = await fetch(`${API_URL}/suggestions?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [filterType, filterPriority]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSuggestions();
    setRefreshing(false);
  };

  const dismissSuggestion = async (id) => {
    await fetch(`${API_URL}/suggestions/${id}/dismiss`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    setSuggestions(suggestions.filter(s => s._id !== id));
  };

  const actOnSuggestion = async (id) => {
    await fetch(`${API_URL}/suggestions/${id}/act`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    setSuggestions(suggestions.map(s => 
      s._id === id ? { ...s, actedUpon: true } : s
    ));
  };

  const getTypeIcon = (type) => {
    const icons = {
      reorder: AlertTriangle,
      dead_stock: Package,
      fast_mover: TrendingUp,
      pricing: DollarSign,
      seasonal: Calendar,
      bundle: Gift,
      clearance: Trash2,
      trend: TrendingUp
    };
    const Icon = icons[type] || Lightbulb;
    return <Icon size={20} />;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return darkMode ? "border-red-700 bg-red-900/30" : "border-red-200 bg-red-50";
      case "medium": return darkMode ? "border-amber-700 bg-amber-900/30" : "border-amber-200 bg-amber-50";
      case "low": return darkMode ? "border-blue-700 bg-blue-900/30" : "border-blue-200 bg-blue-50";
      default: return darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50";
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: "bg-red-600 text-white",
      medium: "bg-amber-500 text-white",
      low: "bg-blue-500 text-white"
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${colors[priority]}`}>
        {priority}
      </span>
    );
  };

  const getTypeLabel = (type) => {
    const labels = {
      reorder: "Reorder Alert",
      dead_stock: "Dead Stock",
      fast_mover: "Fast Mover",
      pricing: "Pricing Insight",
      seasonal: "Seasonal Trend",
      bundle: "Bundle Opportunity",
      clearance: "Clearance",
      trend: "Trending"
    };
    return labels[type] || type;
  };

  const suggestionTypes = [
    { value: "all", label: "All Types" },
    { value: "reorder", label: "Reorder Alerts" },
    { value: "dead_stock", label: "Dead Stock" },
    { value: "fast_mover", label: "Fast Movers" },
    { value: "pricing", label: "Pricing" },
    { value: "seasonal", label: "Seasonal" },
    { value: "bundle", label: "Bundles" },
    { value: "clearance", label: "Clearance" },
    { value: "trend", label: "Trends" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold flex items-center gap-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
            <Lightbulb className="text-amber-500" size={28} />
            AI Business Suggestions
          </h2>
          <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Smart insights based on your inventory patterns and trends
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
            darkMode
              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          } ${refreshing ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Analyzing..." : "Refresh Analysis"}
        </button>
      </div>

      {/* Filters */}
      <div className={`rounded-xl border p-4 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className="flex items-center gap-3 mb-3">
          <Filter size={18} className={darkMode ? "text-gray-400" : "text-gray-600"} />
          <span className={`font-semibold text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Suggestion Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              {suggestionTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-xs font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Priority Level
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`animate-pulse rounded-xl border p-6 h-48 ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}
            ></div>
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <div className={`rounded-xl border p-12 text-center ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}>
          <Lightbulb size={48} className={`mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            No suggestions available
          </h3>
          <p className={darkMode ? "text-gray-500" : "text-gray-500"}>
            Add more products and history to receive personalized business insights
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map(suggestion => (
            <div
              key={suggestion._id}
              className={`rounded-xl border-2 transition-all ${getPriorityColor(suggestion.priority)} ${
                suggestion.actedUpon ? "opacity-60" : ""
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      darkMode ? "bg-gray-700" : "bg-white"
                    }`}>
                      {getTypeIcon(suggestion.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {suggestion.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getPriorityBadge(suggestion.priority)}
                        <span className={`text-xs px-2 py-1 rounded ${
                          darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                        }`}>
                          {getTypeLabel(suggestion.type)}
                        </span>
                        {suggestion.productName && (
                          <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            • {suggestion.productName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className={`mb-4 text-sm leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {suggestion.description}
                </p>

                {/* Action & Impact */}
                {suggestion.action && (
                  <div className={`mb-3 p-3 rounded-lg ${
                    darkMode ? "bg-gray-700/50" : "bg-indigo-50"
                  }`}>
                    <p className={`text-xs font-semibold mb-1 ${darkMode ? "text-indigo-400" : "text-indigo-700"}`}>
                      💡 Suggested Action:
                    </p>
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {suggestion.action}
                    </p>
                  </div>
                )}

                {suggestion.impact && (
                  <div className={`p-3 rounded-lg ${
                    darkMode ? "bg-emerald-900/30" : "bg-emerald-50"
                  }`}>
                    <p className={`text-xs font-semibold mb-1 ${darkMode ? "text-emerald-400" : "text-emerald-700"}`}>
                      📊 Expected Impact:
                    </p>
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {suggestion.impact}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {!suggestion.actedUpon && (
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => actOnSuggestion(suggestion._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
                    >
                      <Check size={16} />
                      Mark as Done
                    </button>
                    <button
                      onClick={() => dismissSuggestion(suggestion._id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                      }`}
                    >
                      <X size={16} />
                      Dismiss
                    </button>
                  </div>
                )}

                {suggestion.actedUpon && (
                  <div className={`mt-4 pt-4 border-t flex items-center gap-2 text-sm ${
                    darkMode ? "border-gray-700 text-emerald-400" : "border-gray-200 text-emerald-600"
                  }`}>
                    <Check size={16} />
                    <span className="font-medium">Acted upon</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {!loading && suggestions.length > 0 && (
        <div className={`rounded-xl border p-6 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <h3 className={`font-semibold mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Analysis Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${darkMode ? "bg-red-900/30" : "bg-red-50"}`}>
              <p className={`text-2xl font-bold ${darkMode ? "text-red-400" : "text-red-600"}`}>
                {suggestions.filter(s => s.priority === "high").length}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>High Priority</p>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? "bg-amber-900/30" : "bg-amber-50"}`}>
              <p className={`text-2xl font-bold ${darkMode ? "text-amber-400" : "text-amber-600"}`}>
                {suggestions.filter(s => s.priority === "medium").length}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Medium Priority</p>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? "bg-blue-900/30" : "bg-blue-50"}`}>
              <p className={`text-2xl font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                {suggestions.filter(s => s.priority === "low").length}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Low Priority</p>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? "bg-emerald-900/30" : "bg-emerald-50"}`}>
              <p className={`text-2xl font-bold ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>
                {suggestions.filter(s => s.actedUpon).length}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Completed</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AISuggestionsPage;
