import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageCircle, Copy, Check, ExternalLink, Send } from 'lucide-react';
import api, { formatOMR, hasValidPrice, getErrorMessage } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useAppConfig } from '../context/AppConfigContext';

const WhatsAppOrderModal = ({ isOpen, onClose, items = [], defaultCustomer = {} }) => {
  const { user } = useAuth();
  const { salesman } = useAppConfig();

  const primaryAddr =
    user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0] || null;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [orderSaved, setOrderSaved] = useState(false);
  const [error, setError] = useState('');

  // Lock body scroll and close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = orig;
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    setCustomerName(defaultCustomer.name || user?.name || 'B2B Partner');
    setCustomerPhone(defaultCustomer.phone || user?.phone || '+968 9512 3456');
    setCustomerAddress(
      defaultCustomer.address ||
        (primaryAddr
          ? `${primaryAddr.street}, ${primaryAddr.city}, ${primaryAddr.country}`
          : 'Muscat, Oman')
    );
    setOrderSaved(false);
    setError('');
  }, [isOpen, user, defaultCustomer]);

  useEffect(() => {
    if (!isOpen || items.length === 0) return;

    const generateMessage = async () => {
      setLoading(true);
      try {
        const res = await api.post('/orders/whatsapp-preview', {
          items: items.map((i) => ({
            productId: i.productId || i.product?._id || i._id,
            name: i.name || i.productName,
            size: i.size || '',
            quantity: i.quantity,
            sellingPrice: i.sellingPrice ?? i.price ?? null,
            invoicePrice: i.invoicePrice ?? null,
          })),
          customer: {
            name: customerName || 'Customer',
            phone: customerPhone || '+968 XXXXXXXX',
            address: customerAddress || 'Muscat, Oman',
          },
        });
        setPreview(res.data.whatsapp);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(generateMessage, 200);
    return () => clearTimeout(timer);
  }, [isOpen, items, customerName, customerPhone, customerAddress]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!preview?.message) return;
    navigator.clipboard.writeText(preview.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsAppAndRecord = async () => {
    try {
      if (!orderSaved && customerName && customerPhone) {
        await api.post('/orders', {
          customerName,
          customerPhone,
          address: {
            street: customerAddress || 'Muscat, Oman',
            city: 'Muscat',
            country: 'Oman',
          },
          orderChannel: 'WHATSAPP',
          clearCart: false,
          items: items.map((i) => ({
            productId: i.productId || i.product?._id || i._id,
            size: i.size || '',
            quantity: i.quantity,
          })),
        });
        setOrderSaved(true);
      }
    } catch {
      // Still open WhatsApp even if order logging fails
    }

    if (preview?.whatsappUrl) {
      window.open(preview.whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-emerald-600 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center shrink-0 border border-emerald-300/40 relative shadow-2xs">
              <span className="select-none">{salesman.name?.[0] || 'S'}</span>
              <img
                src={salesman.photoUrl || '/image/Sachin.jpeg'}
                alt={salesman.name || 'Salesman Sachin'}
                className="absolute inset-0 w-full h-full object-cover object-top"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg truncate">
                Order via WhatsApp ({salesman.name})
              </h3>
              <p className="text-xs text-emerald-100 truncate">
                Direct WhatsApp Number: {preview?.whatsappNumber || salesman.whatsappNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-emerald-700 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Customer Details Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600"
                placeholder="Your Name / Company"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600"
                placeholder="+968 XXXXXXXX"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Delivery Address (Oman / GCC)
              </label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600"
                placeholder="Muscat, Oman"
              />
            </div>
          </div>

          {/* Generated WhatsApp Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Auto-Generated WhatsApp Message
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs font-semibold text-unikai-blue hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Message'}
              </button>
            </div>
            <pre className="bg-slate-900 text-emerald-300 p-4 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed border border-slate-800 max-h-60 overflow-y-auto">
              {loading ? 'Generating official Unikai WhatsApp order...' : preview?.message}
            </pre>
          </div>

          {orderSaved && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
              Order logged in Unikai B2B database and opened in WhatsApp!
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            {hasValidPrice(preview?.total) ? (
              <div className="text-sm font-bold text-slate-800">
                Total: <span className="text-emerald-700">{formatOMR(preview.total)}</span>
              </div>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-100"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleOpenWhatsAppAndRecord}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md transition"
              >
                <Send className="w-4 h-4" />
                <span>Send to {salesman.name} on WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WhatsAppOrderModal;
