import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Server,
  Database,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import api, { formatOMR, getErrorMessage } from '../api/axiosClient';
import { ErrorState } from '../components/Skeletons';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      fetchDashboard();
    } catch {
      // Ignore
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboard} />;
  }

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
        <div className="h-64 bg-white rounded-2xl border border-slate-200" />
      </div>
    );
  }

  const { stats, recentOrders = [], recentlyLoggedInUsers = [], systemHealth } = data;

  const kpiCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      sub: `${stats.recentlyLoggedInCount} logged in (7d)`,
      icon: Users,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Total Products',
      value: stats.totalProducts,
      sub: `${stats.totalCategories} Categories • ${stats.totalBrands} Brands`,
      icon: Package,
      color: 'bg-indigo-50 text-indigo-700',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      sub: stats.totalRevenue > 0 ? `Revenue: ${formatOMR(stats.totalRevenue)}` : 'B2B Wholesale Orders',
      icon: ShoppingBag,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Pending Orders',
      value: stats.pendingOrders,
      sub: 'Awaiting confirmation',
      icon: Clock,
      color: 'bg-amber-50 text-amber-700',
    },
    {
      label: "Today's Orders",
      value: stats.todaysOrders,
      sub: 'Placed today',
      icon: Calendar,
      color: 'bg-sky-50 text-sky-700',
    },
    {
      label: 'Active Products',
      value: stats.activeProducts,
      sub: 'Visible on Web & Flutter',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Inactive Products',
      value: stats.inactiveProducts,
      sub: 'Hidden from catalogue',
      icon: XCircle,
      color: 'bg-rose-50 text-rose-700',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Admin Overview & System Health
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time operations & distribution metrics
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Data
        </button>
      </div>

      {/* System & Database Health Banner (Section 35 — never exposes MONGODB_URI) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Backend</span>
            <span className="text-sm font-extrabold text-emerald-700">
              {systemHealth?.backend || 'Connected'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Database</span>
            <span className="text-sm font-extrabold text-emerald-700">
              {systemHealth?.database || 'Connected'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Environment</span>
            <span className="text-sm font-extrabold text-slate-900">
              {systemHealth?.environment || 'Development'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-slate-500">{card.label}</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{card.value}</div>
              <div className="text-[11px] text-slate-500 mt-0.5 truncate">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Recent Orders Table */}
        <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Recent B2B Orders</h2>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-unikai-blue hover:underline inline-flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-unikai-navy">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{ord.customerName}</div>
                      <div className="text-[11px] text-slate-500">{ord.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-emerald-700">
                      {formatOMR(ord.total) || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                      >
                        {[
                          'Pending',
                          'Confirmed',
                          'Processing',
                          'Shipped',
                          'Delivered',
                          'Cancelled',
                        ].map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Login Tracking Table (Section 18) */}
        <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Customer Login Tracking
              </h2>
              <p className="text-[11px] text-slate-500">
                Customer account activity and session timestamps
              </p>
            </div>
            <Link
              to="/admin/customers"
              className="text-xs font-bold text-unikai-blue hover:underline inline-flex items-center gap-1"
            >
              All Users <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentlyLoggedInUsers.map((u) => (
              <div key={u._id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                    {u.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{u.email}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Registered: {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {u.isActive ? 'Active Account' : 'Deactivated'}
                  </span>
                  <div className="text-[11px] font-semibold text-slate-700 mt-1">
                    Last Login:{' '}
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
