import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Search,
  User,
  Menu,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useAppConfig } from '../context/AppConfigContext';
import UnikaiLogo from './UnikaiLogo';
import MobileMenu from './MobileMenu';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isExecutive, logout } = useAuth();
  const { totalQuantity } = useCart();
  const { salesman, health, refreshConfig } = useAppConfig();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(84);

  // Measure and update fixed header height dynamically
  useEffect(() => {
    if (!headerRef.current) return;
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(headerRef.current);
    window.addEventListener('resize', updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [health.errorBanner, searchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    } else {
      navigate('/products');
    }
  };

  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/products', label: 'Products' },
    { to: '/categories', label: 'Categories' },
    { to: '/brands', label: 'Brands' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-40 w-full bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm"
      >
      {/* Connection Warning Banner if MongoDB or Server is Offline */}
      {health.errorBanner && (
        <div className="bg-red-600 text-white px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{health.errorBanner}</span>
          </div>
          <button
            onClick={refreshConfig}
            className="px-2.5 py-1 rounded bg-white/20 hover:bg-white/30 text-xs font-semibold shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top B2B Announcement Bar */}
      <div className="bg-unikai-navy text-slate-200 text-[11px] sm:text-xs py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-medium truncate">
              Official UNIKAI B2B Wholesale Catalogue • Oman & GCC Cold-Chain Distribution
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <span className="text-slate-300">
              Salesman: <strong className="text-white">{salesman.name}</strong> ({salesman.phone})
            </span>
            {isExecutive && (
              <Link
                to="/executive"
                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Executive Demand Portal
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1 sm:gap-2">
        {/* Mobile Hamburger + Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 hover:bg-slate-100 shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <UnikaiLogo variant="desktop" />
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive
                    ? 'bg-unikai-blue/10 text-unikai-blue'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions: Search, Cart, Login/Profile */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Desktop inline search */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden xl:flex items-center bg-slate-100 rounded-xl px-3 py-1.5 border border-transparent focus-within:border-unikai-sky focus-within:bg-white transition w-56"
          >
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Lassi, Orange, SKU..."
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
            />
          </form>

          {/* Mobile/Tablet Search Toggle */}
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            className="xl:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 shrink-0"
            aria-label="Search products"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Cart Button */}
          <Link
            to="/cart"
            className="relative inline-flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition shrink-0"
            aria-label={`Cart (${totalQuantity} items)`}
          >
            <ShoppingCart className="w-5 h-5 text-unikai-blue" />
            <span className="hidden sm:inline text-xs sm:text-sm font-semibold ml-1.5">Cart</span>
            {totalQuantity > 0 ? (
              <span className="absolute -top-1 -right-1 sm:static sm:top-auto sm:right-auto sm:ml-1.5 min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-5 px-1 rounded-full bg-unikai-blue text-white text-[10px] sm:text-[11px] font-bold flex items-center justify-center">
                {totalQuantity}
              </span>
            ) : (
              <span className="hidden sm:flex min-w-[20px] h-5 px-1.5 rounded-full bg-slate-200 text-slate-600 text-[11px] font-bold items-center justify-center ml-1.5">
                0
              </span>
            )}
          </Link>

          {/* Login / Profile */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden md:inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </Link>
              )}
              <Link
                to="/profile"
                className="inline-flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl bg-unikai-navy text-white hover:bg-unikai-blue transition shrink-0"
                aria-label="Profile"
              >
                <User className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline max-w-[100px] truncate text-xs sm:text-sm font-semibold ml-1.5">
                  {user?.name?.split(' ')[0] || 'Profile'}
                </span>
              </Link>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center p-2 sm:px-3.5 sm:py-2 rounded-xl bg-unikai-navy text-white hover:bg-unikai-blue transition shrink-0"
              aria-label="Login"
            >
              <User className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-xs sm:text-sm font-semibold ml-1.5">Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* Expandable Search Bar for Mobile/Tablet */}
      {searchOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-3 sm:px-6 py-2.5">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-slate-100 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products, sizes, SKUs..."
                className="bg-transparent text-sm text-slate-800 focus:outline-none w-full"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-unikai-blue text-white text-sm font-semibold"
            >
              Search
            </button>
          </form>
        </div>
      )}

      </header>

      {/* Top spacing placeholder to guarantee page content is never covered by fixed header */}
      <div
        style={{ height: `${headerHeight}px` }}
        className="w-full pointer-events-none"
        aria-hidden="true"
      />

      {/* Mobile Navigation Drawer rendered via React Portal in document.body */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navLinks={navLinks}
        user={user}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        isExecutive={isExecutive}
        logout={logout}
        salesman={salesman}
        totalQuantity={totalQuantity}
      />
    </>
  );
};

export default Navbar;
