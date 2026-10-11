import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Users,
  Package,
  Layers,
  Award,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  ShieldCheck,
  Building,
  AlertCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import api, { formatOMR, getErrorMessage } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { ErrorState } from '../components/Skeletons';

const ExecutiveDashboard = () => {
  const { user } = useAuth();
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/executive-report', {
        params: { range },
      });
      setData(res.data?.report);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePrint = () => {
    window.print();
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <ErrorState message={error} onRetry={fetchReport} />
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
        <div className="h-20 bg-white rounded-2xl border border-slate-200" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-white rounded-2xl border border-slate-200" />
          <div className="h-72 bg-white rounded-2xl border border-slate-200" />
        </div>
      </div>
    );
  }

  const {
    ordersSummary = {},
    customersSummary = {},
    catalogueSummary = {},
    topOrderedProducts = [],
    recentOrders = [],
    executiveRole,
    executiveName,
    generatedAt,
  } = data;

  const roleLabelMap = {
    CEO: 'Chief Executive Officer',
    GM: 'General Manager',
    COUNTRY_MANAGER: 'Country Manager - Oman & GCC',
    ADMIN: 'Executive System Administrator',
  };

  const formattedDate = new Date(generatedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 print:py-0 print:px-0">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-unikai-navy via-unikai-blue to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
              {roleLabelMap[executiveRole] || executiveRole}
            </span>
            <span className="text-slate-300 text-xs hidden sm:inline">• Official Governance Report</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Executive Performance & Demand Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time business analytics derived from verified commerce transactions • Generated {formattedDate}
          </p>
        </div>

        {/* Range Controls & Print */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <div className="bg-white/10 p-1 rounded-xl flex items-center gap-1 border border-white/15 text-xs font-bold">
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: 'all', label: 'All Time' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRange(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  range === tab.id
                    ? 'bg-white text-unikai-navy shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchReport}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 2. Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total B2B Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {ordersSummary.totalOrders || 0}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
            {ordersSummary.totalUnitsOrdered || 0} total units in period
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Enquiries
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
            {ordersSummary.pending || 0}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
            {ordersSummary.confirmed || 0} confirmed • {ordersSummary.delivered || 0} delivered
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Catalogue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {catalogueSummary.activeProducts || 0}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
            Across {catalogueSummary.totalCategories || 0} categories & {catalogueSummary.totalBrands || 0} brands
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              B2B Customer Base
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {customersSummary.totalCustomers || 0}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
            +{customersSummary.newInPeriod || 0} new accounts in period
          </p>
        </div>
      </div>

      {/* Commercial Revenue Integrity Alert (Never invent revenue) */}
      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-start gap-3 text-xs sm:text-sm text-slate-700">
        <AlertCircle className="w-5 h-5 text-unikai-sky shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 font-bold block mb-0.5">
            Wholesale Commercial Pricing Note
          </strong>
          {ordersSummary.hasPricedOrders ? (
            <span>
              Verified commercial order revenue in selected range: <strong>{formatOMR(ordersSummary.verifiedRevenue)}</strong>.
              Unpriced catalogue order requests are treated as formal B2B enquiries awaiting salesman quotation.
            </span>
          ) : (
            <span>
              All active catalogue items in this reporting period were ordered under official B2B wholesale enquiries (quote-on-demand).
              No artificial commercial revenue figures are generated to guarantee 100% financial audit integrity.
            </span>
          )}
        </div>
      </div>

      {/* 3. Two Column Performance Grid: Category Breakdown + Top Ordered Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Share & Brand Performance */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Category Distribution & Product Lines
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official SKU distribution across primary FMCG categories
              </p>
            </div>
            <Layers className="w-5 h-5 text-unikai-blue" />
          </div>

          <div className="space-y-3.5">
            {catalogueSummary.categories?.map((cat) => {
              const total = catalogueSummary.totalProducts || 1;
              const pct = Math.round(((cat.productCount || 0) / total) * 100);
              return (
                <div key={cat.slug} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>{cat.name}</span>
                    <span className="text-slate-500">
                      {cat.productCount} SKUs ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-unikai-blue h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
              Official Brands Represented
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {catalogueSummary.brands?.map((brand) => (
                <span
                  key={brand.slug}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  {brand.name} ({brand.productCount})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Top Ordered Products */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Top Products by Order Demand
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Highest quantity requested across B2B customer orders
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>

          {topOrderedProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No product order activity recorded for the selected time range.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {topOrderedProducts.map((p, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                        {p.name}
                      </span>
                      {p.size && (
                        <span className="text-[10px] text-slate-500 font-medium block">
                          Size: {p.size}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-extrabold text-unikai-navy">
                      {p.totalQuantity} units
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      in {p.orderCount} order{p.orderCount > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Recent Business Activity / Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Recent Business Orders & Enquiries
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Audit log of recent submissions from the Web Storefront & Flutter mobile app
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-unikai-blue hover:underline inline-flex items-center gap-1 print:hidden"
          >
            <span>Manage All Orders</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No recent orders available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Order Ref</th>
                  <th className="py-2.5 px-3">Customer / Company</th>
                  <th className="py-2.5 px-3">Units</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Commercial Total</th>
                  <th className="py-2.5 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {recentOrders.map((ord) => {
                  const statusColors = {
                    Pending: 'bg-amber-100 text-amber-800',
                    Confirmed: 'bg-emerald-100 text-emerald-800',
                    Processing: 'bg-blue-100 text-blue-800',
                    Delivered: 'bg-teal-100 text-teal-800',
                    Cancelled: 'bg-rose-100 text-rose-800',
                  };
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {ord.orderNumber}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {ord.customerName}
                      </td>
                      <td className="py-2.5 px-3 font-semibold">
                        {ord.totalQuantity} units
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            statusColors[ord.status] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {ord.total !== null && ord.total !== undefined
                          ? formatOMR(ord.total)
                          : 'Price on request'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500">
                        {new Date(ord.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
