import React, { useContext, useState } from "react";
import { AuthContext } from "./AuthContext";
import { Package, Shield, TrendingUp, BarChart3, Lock, Globe, Smartphone } from "lucide-react";

function LoginPage() {
  const { loginWithGoogle, loginWithDemo } = useContext(AuthContext);
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="relative min-h-screen flex overflow-hidden">
      {/* Video Background */}
      {!videoError && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          onCanPlay={() => console.log("Video playing")}
          onError={() => setVideoError(true)}
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-warehouse-workers-walking-3846/1080p.mp4"
            type="video/mp4"
          />
          {/* Fallback video URL */}
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-warehouse-worker-checking-stock-on-a-tablet-42577-large.mp4"
            type="video/mp4"
          />
        </video>
      )}

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/85 to-gray-900/75 z-10" />

      {/* Content */}
      <div className="relative z-20 flex w-full min-h-screen">
        {/* Left Side - Branding (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Package className="h-7 w-7 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold tracking-tight">Four Star</h1>
              <p className="text-gray-400 text-sm font-medium">Inventory Management System</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-10 max-w-xl">
            <div>
              <h2 className="text-5xl font-bold text-white leading-tight mb-6">
                Manage your inventory
                <span className="block text-indigo-400">with confidence</span>
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                A powerful, intelligent system designed to help you track stock,
                monitor movements, and make data-driven decisions with AI-powered insights.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-4">
              {[
                {
                  icon: BarChart3,
                  title: "AI-Powered Analytics",
                  desc: "Get intelligent recommendations and opportunity scores for every product"
                },
                {
                  icon: TrendingUp,
                  title: "Real-time Tracking",
                  desc: "Monitor stock levels, movements, and trends instantly"
                },
                {
                  icon: Shield,
                  title: "Enterprise Security",
                  desc: "Google OAuth authentication with complete data isolation"
                }
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
                  >
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-600/20 rounded-lg flex items-center justify-center group-hover:bg-indigo-600/30 transition">
                      <Icon className="h-5 w-5 text-indigo-400" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                      <p className="text-gray-400 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center gap-8 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-400" />
              <span>End-to-end encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-400" />
              <span>Cloud synced</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-purple-400" />
              <span>Mobile ready</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-white text-xl font-bold">Four Star</h1>
                <p className="text-gray-400 text-sm">Inventory Management</p>
              </div>
            </div>

            {/* Login Card */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 mb-6">
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                  Welcome back
                </h2>
                <p className="text-gray-400 text-base">
                  Sign in to access your inventory dashboard
                </p>
              </div>

              {/* Google Sign-In Button */}
              <button
                onClick={loginWithGoogle}
                className="w-full group flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-xl px-6 py-4 text-base font-semibold text-gray-700 hover:border-indigo-400 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                {/* Google Logo */}
                <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-gray-800 px-3 text-gray-500 font-medium uppercase tracking-wider">
                    Or continue with demo
                  </span>
                </div>
              </div>

              {/* Demo Login */}
              <button
                onClick={loginWithDemo}
                className="w-full group flex items-center justify-center gap-3 bg-gray-700/50 hover:bg-gray-700 border-2 border-gray-600 hover:border-indigo-500 rounded-xl px-6 py-4 text-base font-semibold text-gray-300 hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                <Package className="h-5 w-5" strokeWidth={2} />
                <span>Demo Login</span>
              </button>

              {/* Security Badges */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="flex items-center justify-center gap-6 text-gray-500 text-xs">
                  <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3" />
                    <span>Secure login</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-3 w-3" />
                    <span>Google OAuth</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} Four Star Inventory. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
