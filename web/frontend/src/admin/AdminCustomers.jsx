import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Power, X } from 'lucide-react';
import api, { formatOMR, getErrorMessage } from '../api/axiosClient';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [feedback, setFeedback] = useState('');

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/customers', {
        params: {
          search: search.trim() || undefined,
          status: statusFilter || undefined,
        },
      });
      setCustomers(res.data?.customers || []);
    } catch (err) {
      setFeedback(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleViewCustomer = async (customerId) => {
    try {
      const res = await api.get(`/admin/customers/${customerId}`);
      setSelectedCustomer(res.data.customer);
    } catch (err) {
      setFeedback(getErrorMessage(err));
    }
  };

  const handleToggleStatus = async (customer) => {
    try {
      await api.patch(`/admin/customers/${customer._id}/toggle-status`);
      setFeedback(
        `Customer ${customer.name} ${customer.isActive ? 'deactivated' : 'activated'}.`
      );
      setTimeout(() => setFeedback(''), 3000);
      loadCustomers();
    } catch (err) {
      setFeedback(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Customers & Login Tracking ({customers.length})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Monitor customer registration dates, exact last login timestamps (`lastLoginAt`), order
          counts, and account status
        </p>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
          {feedback}
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center bg-slate-100 rounded-xl px-3 py-2 flex-1 min-w-0 sm:min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Name, Email, Phone, or Company..."
            className="bg-transparent text-xs sm:text-sm focus:outline-none w-full"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-white"
        >
          <option value="">All Accounts</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Mobile Card List (< 768px) */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            No customers found.
          </div>
        ) : (
          customers.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">{c.name}</div>
                  {c.companyName && (
                    <div className="text-xs font-semibold text-unikai-blue">{c.companyName}</div>
                  )}
                  <div className="text-xs text-slate-500 mt-0.5">{c.email}</div>
                  {c.phone && <div className="text-xs text-slate-600">{c.phone}</div>}
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                    c.isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {c.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Orders</span>
                  <span className="font-extrabold text-unikai-navy">{c.orderCount || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Registered</span>
                  <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Last Login</span>
                  <span className="font-semibold text-slate-700">
                    {c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleString() : 'Never'}
                  </span>
                </div>
                {c.primaryAddress && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Primary Address</span>
                    <span className="truncate block">{c.primaryAddress}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleViewCustomer(c._id)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5 text-unikai-blue" />
                  <span>Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(c)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    c.isActive
                      ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{c.isActive ? 'Deactivate' : 'Activate'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Customers Table (>= 768px) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4">Registration Date</th>
                <th className="py-3.5 px-4">Last Login</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Order Count</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500">
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      {c.companyName && (
                        <div className="text-[11px] text-slate-500">{c.companyName}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{c.email}</td>
                    <td className="py-3 px-4 text-slate-700">{c.phone || '-'}</td>
                    <td className="py-3 px-4 text-xs text-slate-600 max-w-[180px] truncate">
                      {c.primaryAddress}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-700">
                      {c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-unikai-blue">{c.orderCount}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleViewCustomer(c._id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-unikai-blue hover:bg-slate-100"
                          title="View Customer Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(c)}
                          className={`p-1.5 rounded-lg ${
                            c.isActive
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-slate-400 hover:bg-slate-100'
                          }`}
                          title={c.isActive ? 'Deactivate Customer' : 'Activate Customer'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">{selectedCustomer.name}</h3>
                <p className="text-xs text-slate-500">{selectedCustomer.email}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl text-xs">
              <div>
                <span className="text-slate-500 block">Phone:</span>
                <strong>{selectedCustomer.phone || '-'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Status:</span>
                <strong>{selectedCustomer.isActive ? 'Active' : 'Inactive'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Registration Date:</span>
                <strong>{new Date(selectedCustomer.createdAt).toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Last Login:</span>
                <strong>
                  {selectedCustomer.lastLoginAt
                    ? new Date(selectedCustomer.lastLoginAt).toLocaleString()
                    : 'Never'}
                </strong>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                Saved Addresses ({selectedCustomer.addresses?.length || 0})
              </h4>
              {selectedCustomer.addresses?.length === 0 ? (
                <p className="text-xs text-slate-400">No addresses saved.</p>
              ) : (
                <div className="space-y-2">
                  {selectedCustomer.addresses?.map((a) => (
                    <div key={a._id} className="p-2.5 rounded-xl border border-slate-200 text-xs">
                      <strong>{a.label}:</strong> {a.street}, {a.city}, {a.country}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                Order History ({selectedCustomer.orders?.length || 0})
              </h4>
              {selectedCustomer.orders?.length === 0 ? (
                <p className="text-xs text-slate-400">No orders placed yet.</p>
              ) : (
                <div className="space-y-2">
                  {selectedCustomer.orders?.map((o) => (
                    <div
                      key={o._id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 text-xs"
                    >
                      <span className="font-mono font-bold text-unikai-navy">{o.orderNumber}</span>
                      <span>{o.status}</span>
                      <span className="font-bold text-emerald-700">{formatOMR(o.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
