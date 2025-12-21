import React from 'react';
import { LogOut, Home, Package, Plus, ListTodo, Menu, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import NotificationBell from './NotificationBell';
import DarkModeToggle from './DarkModeToggle';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Package, label: 'Lost Items', href: '/items?category=Lost' },
    { icon: Package, label: 'Found Items', href: '/items?category=Found' },
  ];

  const isActive = (href) => location.pathname === href || location.pathname === '/';

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 shadow-md transition-colors duration-300">
      <div className="px-6 lg:px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-vivid-500 to-electric-500 flex items-center justify-center shadow-lg shadow-vivid-500/30 group-hover:shadow-xl group-hover:shadow-electric-500/40 transition-all duration-300 transform group-hover:scale-105">
              <span className="text-white font-black text-lg md:text-xl">F</span>
            </div>
            <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-vivid-600 to-electric-600 bg-clip-text text-transparent">
              FindIt
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${isActive(item.href)
                    ? 'bg-electric-100 dark:bg-electric-900/30 text-electric-700 dark:text-electric-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-deep-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-4">
                  <DarkModeToggle />
                  <NotificationBell />

                  <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vivid-500 to-electric-500 flex items-center justify-center text-white font-bold shadow-md">
                      {user.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-sm font-semibold text-deep-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-300"
                >
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </>
            ) : (
              <>
                <DarkModeToggle />
                <Link to="/login" className="hidden md:block">
                  <Button variant="outline" size="md">Login</Button>
                </Link>
                <Link to="/register" className="hidden md:block">
                  <Button size="md">Register</Button>
                </Link>

                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-300"
                >
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </>
            )}
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-b from-white dark:from-slate-900 to-slate-50 dark:to-slate-800 animate-slide-up">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:text-vivid-600 dark:hover:text-vivid-400 hover:bg-vivid-50 dark:hover:bg-vivid-900/20 rounded-lg transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}

              {user && (
                <>
                  <div className="border-t border-slate-200 dark:border-slate-700 my-2 pt-2">
                    <Link to="/items/new" className="block px-4 py-3">
                      <Button icon={Plus} variant="primary" size="sm" className="w-full">
                        Post New Item
                      </Button>
                    </Link>
                  </div>

                  <Link to="/myitems" className="block px-4 py-2">
                    <Button icon={ListTodo} variant="secondary" size="sm" className="w-full">
                      My Items
                    </Button>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300 font-medium flex items-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              )}

              {!user && (
                <>
                  <Link to="/login" className="block px-4 py-2">
                    <Button variant="outline" size="sm" className="w-full">Login</Button>
                  </Link>
                  <Link to="/register" className="block px-4 py-2">
                    <Button size="sm" className="w-full">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;