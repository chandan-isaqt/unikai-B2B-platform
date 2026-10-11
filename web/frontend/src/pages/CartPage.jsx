import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  Package,
} from 'lucide-react';
import api, { resolveImageUrl, formatOMR, hasValidPrice, getErrorMessage } from '../api/axiosClient';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import WhatsAppOrderModal from '../components/WhatsAppOrderModal';

const CartPage = () => {
  const {
    items,
    totalQuantity,
    hasPricedItems,
    totalAmount,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Muscat');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState('');
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setCustomerName(user.name || '');
      setCustomerPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    const loadAddresses = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await api.get('/users/addresses');
        const list = res.data?.addresses || [];
        setAddresses(list);
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) {
          setSelectedAddressId(def._id);
          setStreet(def.street);
          setCity(def.city || 'Muscat');
          if (def.phone) setCustomerPhone(def.phone);
        }
      } catch {
        // Ignore
      }
    };
    loadAddresses();
  }, [isAuthenticated]);

  const handleSelectSavedAddress = (addrId) => {
    setSelectedAddressId(addrId);
    const found = addresses.find((a) => a._id === addrId);
    if (found) {
      setStreet(found.street);
      setCity(found.city || 'Muscat');
      if (found.phone) setCustomerPhone(found.phone);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!customerName.trim() || !customerPhone.trim() || !street.trim()) {
      setError('Please enter your Name, Phone Number, and Delivery Address.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/orders', {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: user?.email || '',
        address: {
          fullName: customerName.trim(),
          phone: customerPhone.trim(),
          street: street.trim(),
          city: city.trim() || 'Muscat',
          country: 'Oman',
          notes: notes.trim(),
        },
        orderChannel: 'WEB',
        notes: notes.trim(),
        items: items.map((i) => ({
          productId: i.productId || i.product?._id,
          size: i.size || '',
          quantity: i.quantity,
        })),
      });

      setOrderSuccess(res.data.order);
      await clearCart();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-10 text-center shadow-lg space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
            Order Confirmed • Wholesale Processing
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Thank You for Your B2B Order!
          </h1>
          <p className="text-sm text-slate-600">
            Order Reference:{' '}
            <strong className="font-mono text-unikai-navy">{orderSuccess.orderNumber}</strong>
          </p>
          <div className="bg-slate-50 rounded-2xl p-4 text-left text-xs sm:text-sm space-y-1.5 border border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-bold text-slate-900">{orderSuccess.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phone:</span>
              <span className="font-bold text-slate-900">{orderSuccess.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Quantity:</span>
              <span className="font-bold text-slate-900">{orderSuccess.totalQuantity}</span>
            </div>
            {hasValidPrice(orderSuccess.total) && (
              <div className="flex justify-between">
                <span className="text-slate-500">Total Amount:</span>
                <span className="font-extrabold text-emerald-700">
                  {formatOMR(orderSuccess.total)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-bold text-amber-600">{orderSuccess.status}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            {isAuthenticated && (
              <button
                onClick={() => navigate('/profile')}
                className="px-6 py-3 rounded-xl bg-unikai-navy text-white text-sm font-bold hover:bg-unikai-blue transition"
              >
                View in My Orders
              </button>
            )}
            <Link
              to="/products"
              className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-100 transition"
            >
              Continue Browsing Catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-unikai-sky">
            Wholesale Order Sheet
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Your B2B Order Cart ({totalQuantity} Items)
          </h1>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 text-center w-full max-w-lg mx-auto my-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Your Order Cart is Empty</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Browse our official Unikai B2B product catalogue across Dairy, Juice / Beverages,
            Foods, and Ice Cream.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-unikai-blue text-white text-sm font-bold hover:bg-unikai-navy transition shadow-md"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Cart Items List */}
          <div className="lg:col-span-7 space-y-3">
            {items.map((item) => {
              const prodId = item.productId || item.product?._id;
              const unitPrice = item.sellingPrice ?? item.price;
              const itemHasPrice = hasValidPrice(unitPrice);
              const itemHasInvoice = hasValidPrice(item.invoicePrice);
              const subtotal = itemHasPrice
                ? Number((Number(unitPrice) * item.quantity).toFixed(3))
                : null;
              const imgUrl = resolveImageUrl(
                item.image || item.product?.images?.[0] || item.product?.sourceImageUrl
              );

              return (
                <div
                  key={`${prodId}-${item.size || 'nosize'}`}
                  className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 flex items-center gap-3.5 shadow-xs"
                >
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-50 border border-slate-100 object-contain p-1 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <Package className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.slug || item.product?.slug || prodId}`}
                      className="text-sm sm:text-base font-bold text-slate-900 hover:text-unikai-blue truncate block"
                    >
                      {item.name}
                    </Link>

                    {(item.size || itemHasPrice || itemHasInvoice) && (
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                        {item.size && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                            Size: {item.size}
                          </span>
                        )}
                        {itemHasPrice && (
                          <span className="text-slate-500">
                            Selling:{' '}
                            <strong className="text-slate-800">{formatOMR(unitPrice)}</strong>
                          </span>
                        )}
                        {itemHasInvoice && (
                          <span className="text-emerald-700 font-medium">
                            Invoice: {formatOMR(item.invoicePrice)}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      {/* Quantity Controls */}
                      <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(prodId, item.size || '', item.quantity - 1)}
                          className="p-1.5 text-slate-600 hover:text-slate-900"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(prodId, item.size || '', item.quantity + 1)}
                          className="p-1.5 text-slate-600 hover:text-slate-900"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        {subtotal !== null && (
                          <span className="text-xs sm:text-sm font-extrabold text-unikai-navy">
                            {formatOMR(subtotal)}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFromCart(prodId, item.size || '')}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Order Summary + Delivery Details + Proceed / WhatsApp Buttons */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Delivery & Order Checkout
            </h2>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            {/* Saved Address Selector if Logged In */}
            {addresses.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Saved B2B Delivery Address
                </label>
                <select
                  value={selectedAddressId}
                  onChange={(e) => handleSelectSavedAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800"
                >
                  {addresses.map((addr) => (
                    <option key={addr._id} value={addr._id}>
                      {addr.label} — {addr.street}, {addr.city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer / Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Al-Maha Hypermarket"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-unikai-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+968 9512 3456"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-unikai-blue"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Street / Warehouse Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Way 3109, Ruwi Commercial District"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-unikai-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Muscat"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-unikai-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Delivery Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Preferred delivery window or dock number..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-unikai-blue"
                />
              </div>

              {/* Order Summary — Hides Order Total if no items have commercial prices */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Total Items / Units:</span>
                  <span className="font-bold text-slate-900">{totalQuantity}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cold-Chain Delivery (Oman):</span>
                  <span className="font-bold text-emerald-600">Standard B2B Route</span>
                </div>
                {hasPricedItems && hasValidPrice(totalAmount) && (
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-extrabold text-unikai-navy">
                    <span>Order Total:</span>
                    <span>{formatOMR(totalAmount)}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Proceed to Order & Order via WhatsApp */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-5 rounded-xl bg-unikai-navy hover:bg-unikai-blue text-white font-bold text-sm shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting Order...' : 'Proceed to Order'}
                </button>

                <button
                  type="button"
                  onClick={() => setWhatsAppOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order via WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Order Modal */}
      <WhatsAppOrderModal
        isOpen={whatsAppOpen}
        onClose={() => setWhatsAppOpen(false)}
        items={items}
        defaultCustomer={{
          name: customerName,
          phone: customerPhone,
          address: street ? `${street}, ${city}, Oman` : 'Muscat, Oman',
        }}
      />
    </div>
  );
};

export default CartPage;
