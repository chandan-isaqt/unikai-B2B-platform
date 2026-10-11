import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, X } from 'lucide-react';
import api, { formatOMR, hasValidPrice, resolveImageUrl, getErrorMessage } from '../api/axiosClient';

const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [feedback, setFeedback] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders', {
        params: {
          search: search.trim() || undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
        },
      });
      setOrders(res.data?.orders || []);
    } catch (err) {
      setFeedback(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setFeedback(`Order status updated to ${newStatus}`);
      setTimeout(() => setFeedback(''), 3000);
      loadOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      setFeedback(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          B2B Orders Management ({orders.length})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Track and update order status across Web, WhatsApp, and Flutter orders
        </p>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
          {feedback}
        </div>
      )}

      {/* Search & Status Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center bg-slate-100 rounded-xl px-3 py-2 flex-1 min-w-0 sm:min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID, Customer Name, or Phone..."
            className="bg-transparent text-xs sm:text-sm focus:outline-none w-full"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-white"
        >
          <option value="All">All Statuses</option>
          {ORDER_STATUSES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile Order Cards (< 768px) */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            No orders found.
          </div>
        ) : (
          orders.map((ord) => (
            <div
              key={ord._id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono font-bold text-unikai-navy text-sm">
                    {ord.orderNumber}
                  </div>
                  <div className="font-bold text-slate-900 text-xs mt-0.5">{ord.customerName}</div>
                  <div className="text-[11px] text-slate-500">{ord.customerPhone}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">
                    {ord.orderChannel}
                  </span>
                  <div className="text-xs font-extrabold text-emerald-700 mt-1">
                    {hasValidPrice(ord.total) ? formatOMR(ord.total) : 'Request Price'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1 text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Items ({ord.totalQuantity} units)</span>
                  <span className="text-slate-400 text-[10px]">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-slate-800 font-medium truncate">
                  {ord.items?.map((i) => `${i.productName}${i.size ? ` (${i.size})` : ''}`).join(', ')}
                </div>
                {ord.address?.street && (
                  <div className="text-[11px] text-slate-500 truncate pt-0.5">
                    📍 {ord.address.street}, {ord.address.city}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <div className="flex-1">
                  <select
                    value={ord.status}
                    onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:outline-none"
                  >
                    {ORDER_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        Status: {st}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(ord)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition shrink-0"
                >
                  <Eye className="w-3.5 h-3.5 text-unikai-blue" />
                  <span>Details</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Orders Table (>= 768px) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Products</th>
                <th className="py-3.5 px-4">Quantity</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-500">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-unikai-navy">
                      {ord.orderNumber}
                      <span className="block text-[10px] font-sans text-slate-400">
                        {ord.orderChannel}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{ord.customerName}</td>
                    <td className="py-3 px-4 text-slate-700">{ord.customerPhone}</td>
                    <td className="py-3 px-4 text-xs text-slate-600 max-w-[180px] truncate">
                      {ord.items
                        ?.map((i) => `${i.productName}${i.size ? ` (${i.size})` : ''}`)
                        .join(', ')}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{ord.totalQuantity}</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-700">
                      {hasValidPrice(ord.total) ? formatOMR(ord.total) : '—'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 max-w-[160px] truncate">
                      {ord.address?.street}, {ord.address?.city}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-unikai-blue hover:bg-slate-100"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-sm font-extrabold text-unikai-navy">
                  {selectedOrder.orderNumber}
                </span>
                <p className="text-xs text-slate-500">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl text-xs">
              <div>
                <span className="text-slate-500 block">Customer:</span>
                <strong className="text-slate-900">{selectedOrder.customerName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Phone:</span>
                <strong className="text-slate-900">{selectedOrder.customerPhone}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Delivery Address:</span>
                <strong className="text-slate-900">
                  {selectedOrder.address?.street}, {selectedOrder.address?.city},{' '}
                  {selectedOrder.address?.country}
                </strong>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Order Items ({selectedOrder.totalQuantity} units)
              </h4>
              {selectedOrder.items?.map((item, idx) => {
                const itemPrice = item.sellingPrice ?? item.price;
                const itemImg = resolveImageUrl(item.image);
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      {itemImg && (
                        <img
                          src={itemImg}
                          alt={item.productName}
                          className="w-10 h-10 rounded-lg bg-slate-50 object-contain"
                        />
                      )}
                      <div>
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        <div className="text-slate-500">
                          {[
                            item.size ? `Size: ${item.size}` : null,
                            `Qty: ${item.quantity}${
                              hasValidPrice(itemPrice) ? ` × ${formatOMR(itemPrice)}` : ''
                            }`,
                          ]
                            .filter(Boolean)
                            .join(' • ')}
                        </div>
                      </div>
                    </div>
                    {hasValidPrice(item.subtotal) && (
                      <div className="font-extrabold text-unikai-navy">
                        {formatOMR(item.subtotal)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              {hasValidPrice(selectedOrder.total) ? (
                <div className="text-base font-extrabold text-emerald-700">
                  Total: {formatOMR(selectedOrder.total)}
                </div>
              ) : (
                <div className="text-xs font-semibold text-slate-500">B2B Catalogue Order</div>
              )}
              <select
                value={selectedOrder.status}
                onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold"
              >
                {ORDER_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
