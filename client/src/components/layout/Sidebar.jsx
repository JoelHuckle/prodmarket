// components/layout/Sidebar.jsx
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Home, Grid, Package, Repeat, ShoppingBag, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user, isLoggedIn, logout } = useAuth();

  // Close sidebar on route change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Grid, label: 'Browse', href: '/browse' },
    { icon: Repeat, label: 'Subscriptions', href: '/subscriptions' },
    { icon: ShoppingBag, label: 'My Orders', href: '/orders' },
  ];

  const accountItems = [
    { icon: User, label: 'Dashboard', href: '/dashboard' },
    { icon: Package, label: 'My Services', href: '/my-services' },
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: HelpCircle, label: 'Help & Support', href: '/help' },
  ];

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-dark-800 border-r border-dark-700 z-50 lg:hidden transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-dark-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-white">ProdMarket</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* User Info or Login */}
          {isLoggedIn && user ? (
            <div className="p-4 border-b border-dark-700">
              <div className="flex items-center gap-3">
                <Avatar name={user.display_name || user.username} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user.display_name || user.username}
                  </p>
                  <p className="text-xs text-dark-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-dark-700 space-y-2">
              <Link to="/login" onClick={onClose}>
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
              <Link to="/signup" onClick={onClose}>
                <Button variant="primary" className="w-full">Sign Up</Button>
              </Link>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            {/* Main Menu */}
            <div className="space-y-1 mb-6">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-primary-500/10 text-primary-400'
                        : 'text-dark-300 hover:text-white hover:bg-dark-700'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Account Menu (only if logged in) */}
            {isLoggedIn && (
              <>
                <div className="border-t border-dark-700 pt-4 mb-4">
                  <p className="px-4 text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2">
                    Account
                  </p>
                  <div className="space-y-1">
                    {accountItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            isActive
                              ? 'bg-primary-500/10 text-primary-400'
                              : 'text-dark-300 hover:text-white hover:bg-dark-700'
                          }`}
                        >
                          <Icon size={20} />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-error-400 hover:text-error-300 hover:bg-dark-700 transition-colors w-full"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            )}
          </nav>

          {/* Bottom */}
          <div className="p-4 border-t border-dark-700">
            <p className="text-xs text-dark-500 text-center">
              © {new Date().getFullYear()} ProdMarket
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}