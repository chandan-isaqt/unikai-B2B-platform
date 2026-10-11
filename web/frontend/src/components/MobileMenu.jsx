import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  X,
  ChevronRight,
  ShoppingCart,
  User,
  ShieldCheck,
  TrendingUp,
  LogOut,
  PhoneCall,
  MessageCircle,
  Package,
} from 'lucide-react';
import UnikaiLogo from './UnikaiLogo';

/**
 * Mobile Navigation Drawer component.
 * Renders via React Portal directly into document.body to escape any
 * containing block or filter/backdrop-filter stacking context of ancestor elements.
 */
const MobileMenu = ({
  isOpen,
  onClose,
  navLinks = [],
  user,
  isAuthenticated,
  isAdmin,
  isExecutive,
  logout,
  salesman = {},
  totalQuantity = 0,
}) => {
  const location = useLocation();

  // Close drawer on any route change (clicks, back/forward history navigation)
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname, location.search]);

  // Lock body scroll and listen for Escape key while drawer is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanPhone = String(salesman.whatsappNumber || salesman.phone || '').replace(/[^\d]/g, '');

  const drawerContent = (
    <div
      className="fixed inset-0 lg:hidden"
      style={{ zIndex: 9999 }}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Drawer"
    >
      {/* 1. Dark Fixed Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        style={{ zIndex: 9999 }}
        onClick={onClose}
        onTouchMove={(e) => e.preventDefault()}
        aria-hidden="true"
      />

      {/* 2. Fixed-position Drawer (Opens from left, fits viewport) */}
      <div
        className="fixed top-0 left-0 bg-white shadow-2xl flex flex-col overflow-hidden box-border h-screen h-[100dvh]"
        style={{
          zIndex: 10000,
          position: 'fixed',
          top: 0,
          left: 0,
          width: 'min(88vw, 340px)',
          maxWidth: '100vw',
          boxSizing: 'border-box',
        }}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <UnikaiLogo variant="mobile" onClick={onClose} />
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition shrink-0"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="p-3 space-y-1 flex-1 overflow-y-auto min-w-0 overscroll-contain">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-unikai-blue text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              <span className="truncate">{item.label}</span>
              <ChevronRight className="w-4 h-4 opacity-60 shrink-0 ml-2" />
            </NavLink>
          ))}

          {/* Cart Link with Badge in Drawer */}
          <NavLink
            to="/cart"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive
                  ? 'bg-unikai-blue text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            <div className="flex items-center gap-2.5 truncate">
              <ShoppingCart className="w-4 h-4 text-unikai-blue shrink-0" />
              <span className="truncate">Order Cart</span>
            </div>
            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-unikai-navy text-white text-[11px] font-bold flex items-center justify-center shrink-0">
              {totalQuantity}
            </span>
          </NavLink>

          {/* User Account Controls */}
          <div className="pt-3 mt-3 border-t border-slate-200 space-y-1">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/profile"
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition truncate"
                >
                  <User className="w-4 h-4 text-unikai-blue shrink-0" />
                  <span className="truncate">My B2B Profile ({user?.name || 'Customer'})</span>
                </NavLink>
                {isExecutive && (
                  <NavLink
                    to="/executive"
                    onClick={onClose}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold text-emerald-700 bg-emerald-50 transition"
                  >
                    <TrendingUp className="w-4 h-4 shrink-0" />
                    <span className="truncate">Executive Demand Portal</span>
                  </NavLink>
                )}
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    onClick={onClose}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold text-amber-700 bg-amber-50 transition"
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span className="truncate">Admin Panel</span>
                  </NavLink>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold bg-unikai-navy hover:bg-unikai-blue text-white transition shadow-sm"
              >
                <User className="w-4 h-4 shrink-0" />
                <span>Login / Register B2B Account</span>
              </NavLink>
            )}
          </div>
        </div>

        {/* Salesman Quick Info & Contact Hub */}
        <div className="p-3 m-3 rounded-2xl bg-slate-50 border border-slate-200 shrink-0 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">B2B Sales Representative:</span>
            <span className="font-extrabold text-slate-800 truncate ml-1">{salesman.name}</span>
          </div>
          <p className="text-xs text-slate-600 font-semibold">{salesman.phone}</p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {cleanPhone && (
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  `Hello ${salesman.name}, I would like to inquire about Unikai wholesale ordering.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                <span>WhatsApp</span>
              </a>
            )}
            <Link
              to="/contact"
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition"
            >
              <PhoneCall className="w-3.5 h-3.5 shrink-0" />
              <span>Contact Desk</span>
            </Link>
          </div>
        </div>

        {/* Drawer Footer Bar */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>Unikai Foods PJSC • 1977</span>
          <Link
            to="/login/admin"
            onClick={onClose}
            className="text-slate-400 hover:text-amber-600 font-semibold transition"
          >
            Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
};

export default MobileMenu;
