import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { hasValidPrice } from '../api/axiosClient';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const LOCAL_CART_KEY = 'unikai_b2b_guest_cart_v2';

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [whatsAppModalData, setWhatsAppModalData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // Save to localStorage for guest persistence
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota errors
    }
  }, [items]);

  // Sync with backend cart when user logs in
  useEffect(() => {
    const syncWithBackend = async () => {
      if (!isAuthenticated || !user) return;
      try {
        const localSaved = JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || '[]');
        if (localSaved.length > 0) {
          const res = await api.put('/cart/sync', { items: localSaved });
          if (res.data?.cart?.items) {
            setItems(res.data.cart.items);
          }
        } else {
          const res = await api.get('/cart');
          if (res.data?.cart?.items) {
            setItems(res.data.cart.items);
          }
        }
      } catch {
        // Fallback to local items if offline
      }
    };
    syncWithBackend();
  }, [isAuthenticated, user?._id]);

  const addToCart = async (product, size, quantity = 1) => {
    const selectedSize =
      size !== undefined && size !== null && String(size).trim() !== ''
        ? String(size).trim()
        : product.sizes?.[0] || '';
    const qty = Math.max(1, Number(quantity) || 1);
    const prodId = product._id || product.productId;

    const rawSelling =
      product.sellingPrice !== undefined && product.sellingPrice !== null
        ? product.sellingPrice
        : product.price;
    const unitPrice = hasValidPrice(rawSelling) ? Number(rawSelling) : null;
    const invoicePrice = hasValidPrice(product.invoicePrice)
      ? Number(product.invoicePrice)
      : null;

    setItems((prev) => {
      const idx = prev.findIndex(
        (i) =>
          String(i.productId || i.product?._id) === String(prodId) &&
          (i.size || '') === selectedSize
      );
      if (idx > -1) {
        const updated = [...prev];
        const newQty = updated[idx].quantity + qty;
        updated[idx] = {
          ...updated[idx],
          quantity: newQty,
          sellingPrice: unitPrice,
          price: unitPrice,
          invoicePrice,
          subtotal: unitPrice !== null ? Number((unitPrice * newQty).toFixed(3)) : null,
        };
        return updated;
      }
      return [
        ...prev,
        {
          productId: prodId,
          product,
          name: product.name,
          slug: product.slug,
          sku: product.sku || null,
          image: product.images?.[0] || product.sourceImageUrl || product.image || '',
          size: selectedSize,
          sellingPrice: unitPrice,
          price: unitPrice,
          invoicePrice,
          quantity: qty,
          subtotal: unitPrice !== null ? Number((unitPrice * qty).toFixed(3)) : null,
        },
      ];
    });

    const sizeNote = selectedSize ? ` (${selectedSize})` : '';
    showToast(`Added ${qty} × ${product.name}${sizeNote} to cart`);

    if (isAuthenticated) {
      try {
        const res = await api.post('/cart', {
          productId: prodId,
          size: selectedSize,
          quantity: qty,
          mode: 'add',
        });
        if (res.data?.cart?.items) {
          setItems(res.data.cart.items);
        }
      } catch {
        // Keep optimistic local update
      }
    }
  };

  const updateQuantity = async (productId, size = '', quantity) => {
    const qty = Number(quantity);
    if (qty <= 0) {
      return removeFromCart(productId, size);
    }

    setItems((prev) =>
      prev.map((i) => {
        if (
          String(i.productId || i.product?._id) === String(productId) &&
          (i.size || '') === (size || '')
        ) {
          const unitPrice = hasValidPrice(i.sellingPrice ?? i.price)
            ? Number(i.sellingPrice ?? i.price)
            : null;
          return {
            ...i,
            quantity: qty,
            subtotal: unitPrice !== null ? Number((unitPrice * qty).toFixed(3)) : null,
          };
        }
        return i;
      })
    );

    if (isAuthenticated) {
      try {
        const res = await api.post('/cart', {
          productId,
          size: size || '',
          quantity: qty,
          mode: 'set',
        });
        if (res.data?.cart?.items) {
          setItems(res.data.cart.items);
        }
      } catch {
        // Keep local update
      }
    }
  };

  const removeFromCart = async (productId, size = '') => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          !(
            String(i.productId || i.product?._id) === String(productId) &&
            (i.size || '') === (size || '')
          )
      )
    );

    if (isAuthenticated) {
      try {
        const res = await api.delete('/cart/item', {
          params: { productId, size: size || '' },
        });
        if (res.data?.cart?.items) {
          setItems(res.data.cart.items);
        }
      } catch {
        // Keep local update
      }
    }
  };

  const clearCart = async () => {
    setItems([]);
    localStorage.removeItem(LOCAL_CART_KEY);
    if (isAuthenticated) {
      try {
        await api.delete('/cart');
      } catch {
        // Ignore
      }
    }
  };

  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const hasPricedItems = items.some((item) => hasValidPrice(item.sellingPrice ?? item.price));
  const hasUnpricedItems = items.some((item) => !hasValidPrice(item.sellingPrice ?? item.price));
  const totalAmount = hasPricedItems
    ? Number(
        items
          .reduce((sum, item) => {
            const p = item.sellingPrice ?? item.price;
            return hasValidPrice(p) ? sum + Number(p) * Number(item.quantity || 0) : sum;
          }, 0)
          .toFixed(3)
      )
    : null;

  return (
    <CartContext.Provider
      value={{
        items,
        totalQuantity,
        hasPricedItems,
        hasUnpricedItems,
        totalAmount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        whatsAppModalData,
        setWhatsAppModalData,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
