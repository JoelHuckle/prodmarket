// components/layout/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Search, ShoppingCart, Bell, User, LogOut, Settings, Package, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { href: '/browse', label: 'Browse' },
    { href: '/subscriptions', label: 'Subscriptions' },
  ];

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <nav className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Menu button + Logo */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
            >
              <Menu size={24} />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">PM</span>
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">
                ProdMarket
              </span>
            </Link>
          </div>

          {/* Center: Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? 'bg-dark-700 text-white'
                    : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
              </div>
            </form>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
                >
                  <ShoppingCart size={22} />
                </Link>

                {/* Notifications */}
                <button className="relative p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors">
                  <Bell size={22} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-dark-700 transition-colors"
                  >
                    <Avatar name={user?.display_name || user?.username} size="sm" />
                  </button>

                  {/* Dropdown */}
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-dark-800 border border-dark-700 rounded-xl shadow-xl z-20 py-2 animate-fade-up">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-dark-700">
                          <p className="text-sm font-medium text-white truncate">
                            {user?.display_name || user?.username}
                          </p>
                          <p className="text-xs text-dark-400 truncate">{user?.email}</p>
                        </div>

                        {/* Links */}
                        <div className="py-2">
                          <Link
                            to="/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
                          >
                            <User size={16} />
                            Dashboard
                          </Link>
                          <Link
                            to="/orders"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
                          >
                            <Package size={16} />
                            My Orders
                          </Link>
                          <Link
                            to="/subscriptions"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
                          >
                            <Calendar size={16} />
                            Subscriptions
                          </Link>
                          <Link
                            to="/settings"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
                          >
                            <Settings size={16} />
                            Settings
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-dark-700 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-error-400 hover:text-error-300 hover:bg-dark-700 transition-colors w-full"
                          >
                            <LogOut size={16} />
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-dark-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
            </div>
          </form>
        </div>
      </div>
    </nav>
  );
}