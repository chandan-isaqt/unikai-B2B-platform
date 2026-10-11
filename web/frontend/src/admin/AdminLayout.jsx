import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Outlet, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Award,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Database,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppConfig } from '../context/AppConfigContext';
import UnikaiLogo from '../components/UnikaiLogo';

const AdminLayout = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { health } = useAppConfig();
  const navigate = useNavigate();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Auto-close drawer on route navigation
  useEffect(() => {
    if (drawerOpen) {
      setDrawerOpen(false);
    }
  }, [location.pathname]);

  // Lock body scroll and listen for Escape key when admin drawer is open
  useEffect(() => {
    if (drawerOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setDrawerOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [drawerOpen]);

  // If not logged in as ADMIN, redirect to dedicated /login/admin route
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login/admin" replace />;
  }

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/executive', label: 'Executive Demand Report', icon: BarChart3 },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/categories', label: 'Categories', icon: Layers },
    { to: '/admin/brands', label: 'Brands', icon: Award },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/settings', label: 'Salesman & Settings', icon: Settings },
  ];

  const SidebarContent = ({ onItemClick }) => (
    <div className="flex flex-col h-full bg-unikai-navy text-slate-200">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <UnikaiLogo variant="admin" to="/admin" onClick={onItemClick} />
        {onItemClick && (
          <button
            onClick={onItemClick}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onItemClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                isActive
                  ? 'bg-unikai-sky text-white shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Service Status Pill */}
      <div className="p-4 m-3 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${health.database === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            Service Status
          </span>
          <span
            className={`font-bold ${
              health.database === 'connected' ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {health.database === 'connected' ? 'Online' : 'Offline'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Environment</span>
          <span className="font-semibold text-slate-200">Production Mode</span>
        </div>
      </div>

      <div className="p-3 border-t border-slate-800 space-y-1">
        <Link
          to="/"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10"
        >
          <span>View Customer Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={async () => {
            await logout();
            navigate('/');
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout ({user?.email})</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Sidebar rendered via Portal to document.body */}
      {drawerOpen &&
        createPortal(
          <div
            className="fixed inset-0 lg:hidden"
            style={{ zIndex: 9999 }}
            role="dialog"
            aria-modal="true"
            aria-label="Admin Navigation Drawer"
          >
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setDrawerOpen(false)}
              onTouchMove={(e) => e.preventDefault()}
              aria-hidden="true"
            />
            <div
              className="fixed top-0 left-0 bg-unikai-navy shadow-2xl flex flex-col overflow-hidden box-border h-screen h-[100dvh]"
              style={{
                zIndex: 10000,
                position: 'fixed',
                top: 0,
                left: 0,
                width: 'min(88vw, 300px)',
                maxWidth: '100vw',
                boxSizing: 'border-box',
              }}
            >
              <SidebarContent onItemClick={() => setDrawerOpen(false)} />
            </div>
          </div>,
          document.body
        )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Admin Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                Unikai B2B Management Console
              </h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Enterprise Wholesale Distribution Console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <span>Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-unikai-navy">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>{user?.name}</span>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 flex-1 max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
