import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  MapPin,
  User,
  KeyRound,
  PhoneCall,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  MessageCircle,
  Clock,
} from 'lucide-react';
import api, { formatOMR, hasValidPrice, resolveImageUrl, getErrorMessage } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useAppConfig } from '../context/AppConfigContext';

const ProfilePage = () => {
  const { user, logout, refreshUser } = useAuth();
  const { salesman } = useAppConfig();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Account Form
  const [accountForm, setAccountForm] = useState({
    name: user?.name || '',
    companyName: user?.companyName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // New Address Form
  const [addrForm, setAddrForm] = useState({
    label: 'Branch Warehouse',
    companyName: user?.companyName || '',
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    area: '',
    city: 'Muscat',
    country: 'Oman',
    isDefault: false,
  });

  // Password Form
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const loadData = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const [ordRes, addrRes] = await Promise.all([
        api.get('/orders/my-orders'),
        api.get('/users/addresses'),
      ]);
      setOrders(ordRes.data?.orders || []);
      setAddresses(addrRes.data?.addresses || []);
    } catch {
      // Ignore
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (user) {
      setAccountForm({
        name: user.name || '',
        companyName: user.companyName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const showNotice = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback({ type: '', text: '' }), 4000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', accountForm);
      await refreshUser();
      showNotice('success', 'Account details updated successfully.');
    } catch (err) {
      showNotice('error', getErrorMessage(err));
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/addresses', addrForm);
      setAddresses(res.data?.addresses || []);
      setAddrForm({
        ...addrForm,
        street: '',
        area: '',
        isDefault: false,
      });
      await refreshUser();
      showNotice('success', 'New B2B delivery address added.');
    } catch (err) {
      showNotice('error', getErrorMessage(err));
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await api.delete(`/users/addresses/${id}`);
      setAddresses(res.data?.addresses || []);
      await refreshUser();
      showNotice('success', 'Address removed.');
    } catch (err) {
      showNotice('error', getErrorMessage(err));
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const res = await api.patch(`/users/addresses/${id}/default`);
      setAddresses(res.data?.addresses || []);
      await refreshUser();
      showNotice('success', 'Default delivery address updated.');
    } catch (err) {
      showNotice('error', getErrorMessage(err));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/change-password', pwdForm);
      setPwdForm({ currentPassword: '', newPassword: '' });
      showNotice('success', res.data.message || 'Password changed successfully.');
    } catch (err) {
      showNotice('error', getErrorMessage(err));
    }
  };

  const cleanWhatsApp = String(salesman.whatsappNumber || '').replace(/[^\d]/g, '');

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'account', label: 'Account Details', icon: User },
    { id: 'password', label: 'Change Password', icon: KeyRound },
    { id: 'salesman', label: 'Contact Salesman', icon: PhoneCall },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
      {/* Top Profile Banner */}
      <div className="bg-gradient-to-r from-unikai-navy to-unikai-blue text-white rounded-3xl p-5 sm:p-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 font-extrabold text-2xl flex items-center justify-center shrink-0">
            {user?.name?.[0] || 'U'}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              {user?.role || 'CUSTOMER'} ACCOUNT
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold">{user?.name}</h1>
            <p className="text-xs sm:text-sm text-slate-200">
              {user?.email} {user?.phone ? `• ${user.phone}` : ''}
            </p>
            {user?.lastLoginAt && (
              <p className="text-[11px] text-emerald-300 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last Login: {new Date(user.lastLoginAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-red-600 text-white text-xs sm:text-sm font-bold transition self-start sm:self-center"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {feedback.text && (
        <div
          className={`mb-5 p-3.5 rounded-2xl text-xs sm:text-sm font-bold border ${
            feedback.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-2.5 flex lg:flex-col gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-unikai-navy text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Panel */}
        <div className="lg:col-span-9">
          {/* 1. MY ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900">
                My B2B Orders ({orders.length})
              </h2>

              {loadingOrders ? (
                <p className="text-sm text-slate-500 py-8 text-center">Loading your orders...</p>
              ) : orders.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <p className="text-sm text-slate-500">You have not placed any orders yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="rounded-2xl border border-slate-200 p-4 space-y-3 hover:border-slate-300 transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <span className="font-mono text-xs sm:text-sm font-extrabold text-unikai-navy">
                            {order.orderNumber}
                          </span>
                          <span className="block text-[11px] text-slate-500">
                            Placed on {new Date(order.createdAt).toLocaleString()} • Via{' '}
                            {order.orderChannel}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-unikai-blue/10 text-unikai-blue text-xs font-bold">
                            {order.status}
                          </span>
                          {hasValidPrice(order.total) && (
                            <span className="text-sm font-extrabold text-emerald-700">
                              {formatOMR(order.total)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {order.items?.map((item, idx) => {
                          const itemPrice = item.sellingPrice ?? item.price;
                          const itemImg = resolveImageUrl(item.image);
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs sm:text-sm gap-2"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {itemImg ? (
                                  <img
                                    src={itemImg}
                                    alt={item.productName}
                                    className="w-10 h-10 rounded-lg bg-slate-50 object-contain p-0.5 border border-slate-200 shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                    <Package className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="truncate">
                                  <span className="font-bold text-slate-800 block truncate">
                                    {item.productName}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {[
                                      item.size ? `Size: ${item.size}` : null,
                                      `Qty: ${item.quantity}${
                                        hasValidPrice(itemPrice)
                                          ? ` × ${formatOMR(itemPrice)}`
                                          : ''
                                      }`,
                                    ]
                                      .filter(Boolean)
                                      .join(' • ')}
                                  </span>
                                </div>
                              </div>
                              {hasValidPrice(item.subtotal) && (
                                <span className="font-bold text-slate-900 shrink-0">
                                  {formatOMR(item.subtotal)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex flex-wrap justify-between gap-2">
                        <span>
                          Delivery: {order.address?.street}, {order.address?.city}
                        </span>
                        <span>Total Units: {order.totalQuantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. SAVED ADDRESSES (Multiple Supported) */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4">
                <h2 className="text-lg font-extrabold text-slate-900">
                  Saved Delivery Addresses ({addresses.length})
                </h2>

                {addresses.length === 0 ? (
                  <p className="text-sm text-slate-500">No saved addresses yet. Add one below.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr._id}
                        className={`rounded-2xl border p-4 flex flex-col justify-between ${
                          addr.isDefault
                            ? 'border-unikai-blue bg-blue-50/30'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-unikai-navy">
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span className="px-2 py-0.5 rounded-full bg-unikai-blue text-white text-[10px] font-bold">
                                Default
                              </span>
                            )}
                          </div>
                          {addr.companyName && (
                            <p className="text-xs font-bold text-slate-800">{addr.companyName}</p>
                          )}
                          <p className="text-xs text-slate-600 mt-1">
                            {addr.street}
                            {addr.area ? `, ${addr.area}` : ''}, {addr.city}, {addr.country}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Contact: {addr.fullName} ({addr.phone})
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                          {!addr.isDefault ? (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr._id)}
                              className="font-bold text-unikai-blue hover:underline flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Set as Default
                            </button>
                          ) : (
                            <span className="text-emerald-700 font-bold">Primary Delivery</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr._id)}
                            className="text-red-600 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Address Form */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
                <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-unikai-blue" />
                  Add New Warehouse / Store Address
                </h3>
                <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Location Label *
                    </label>
                    <input
                      type="text"
                      required
                      value={addrForm.label}
                      onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}
                      placeholder="e.g. Ruwi Branch / Central Cold Store"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={addrForm.companyName}
                      onChange={(e) => setAddrForm({ ...addrForm, companyName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      value={addrForm.fullName}
                      onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="text"
                      required
                      value={addrForm.phone}
                      onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Street / Building / Way Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={addrForm.street}
                      onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })}
                      placeholder="Building 42, Way 3109, Commercial District"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={addrForm.city}
                      onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={addrForm.country}
                      onChange={(e) => setAddrForm({ ...addrForm, country: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-unikai-navy text-white text-xs sm:text-sm font-bold hover:bg-unikai-blue transition"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 3. ACCOUNT DETAILS */}
          {activeTab === 'account' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
              <h2 className="text-lg font-extrabold text-slate-900 mb-4">Account Details</h2>
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={accountForm.companyName}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, companyName: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={accountForm.email}
                    onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={accountForm.phone}
                    onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-unikai-navy text-white text-sm font-bold hover:bg-unikai-blue transition"
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* 4. CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
              <h2 className="text-lg font-extrabold text-slate-900 mb-4">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={pwdForm.currentPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password (min 6 characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={pwdForm.newPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-unikai-navy text-white text-sm font-bold hover:bg-unikai-blue transition"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}

          {/* 5. CONTACT SALESMAN */}
          {activeTab === 'salesman' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-unikai-sky">
                  Your Assigned Account Executive
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">{salesman.name}</h2>
                <p className="text-xs sm:text-sm text-slate-500">{salesman.title}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-500 block">Direct Phone:</span>
                  <strong className="text-slate-900">{salesman.phone}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">WhatsApp Number:</span>
                  <strong className="text-emerald-700">{salesman.whatsappNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Email:</span>
                  <strong className="text-slate-900">{salesman.email}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Region & Hours:</span>
                  <strong className="text-slate-900">{salesman.workingHours}</strong>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                    `Hello ${salesman.name}, this is ${user?.name || 'a B2B customer'}. I need assistance with my Unikai wholesale account.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition shadow"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat with {salesman.name} on WhatsApp</span>
                </a>
                <a
                  href={`tel:${salesman.phone}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-unikai-navy text-white text-xs sm:text-sm font-bold hover:bg-unikai-blue transition"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call {salesman.phone}</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
