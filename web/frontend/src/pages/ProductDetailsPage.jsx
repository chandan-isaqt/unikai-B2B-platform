import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingCart,
  MessageCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Plus,
  Minus,
  Activity,
  Tag,
  Layers,
  Package,
  Info,
  FileText,
} from 'lucide-react';
import api, { resolveImageUrl, formatOMR, hasValidPrice, getErrorMessage } from '../api/axiosClient';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import WhatsAppOrderModal from '../components/WhatsAppOrderModal';
import { ErrorState } from '../components/Skeletons';

const ProductDetailsPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const fetchProductDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    setImgError(false);
    try {
      const res = await api.get(`/products/${slug}`);
      const prod = res.data.product;
      setProduct(prod);
      setRelatedProducts(res.data.relatedProducts || []);
      setSelectedImage(0);
      const validSizes = Array.isArray(prod.sizes)
        ? prod.sizes.map((s) => String(s).trim()).filter(Boolean)
        : [];
      setSelectedSize(validSizes[0] || '');
      setQuantity(1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
          <div className="lg:col-span-5 aspect-square bg-slate-200 rounded-2xl" />
          <div className="lg:col-span-7 space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-8 bg-slate-200 rounded w-2/3" />
            <div className="h-20 bg-slate-200 rounded w-full" />
            <div className="h-12 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <ErrorState message={error || 'Product not found.'} onRetry={fetchProductDetails} />
      </div>
    );
  }

  // Gather official/uploaded images without inventing any fake fallback image
  const rawImages = [
    ...(Array.isArray(product.images) ? product.images : []),
    product.sourceImageUrl,
  ]
    .map((img) => resolveImageUrl(img))
    .filter(Boolean);
  const images = Array.from(new Set(rawImages));
  const activeImageUrl = images[selectedImage] || images[0] || null;

  const sizes = Array.isArray(product.sizes)
    ? product.sizes.map((s) => String(s).trim()).filter(Boolean)
    : [];

  // Dynamic Nutrition Rows (supports array of { name, value } or legacy object)
  let nutritionRows = [];
  if (Array.isArray(product.nutrition)) {
    nutritionRows = product.nutrition.filter(
      (n) => n && n.name && n.value !== undefined && String(n.value).trim() !== ''
    );
  } else if (product.nutrition && typeof product.nutrition === 'object') {
    nutritionRows = Object.entries(product.nutrition)
      .filter(([, val]) => val !== undefined && val !== null && String(val).trim() !== '')
      .map(([key, val]) => ({ name: key, value: String(val) }));
  }

  const additionalInfoRows = Array.isArray(product.additionalInformation)
    ? product.additionalInformation.filter(
        (item) => item && item.label && item.value && String(item.value).trim() !== ''
      )
    : [];

  const rawSellingPrice =
    product.sellingPrice !== undefined && product.sellingPrice !== null
      ? product.sellingPrice
      : product.price;
  const hasSellingPrice = hasValidPrice(rawSellingPrice);
  const hasInvoicePrice = hasValidPrice(product.invoicePrice);
  const showPriceSection = hasSellingPrice || hasInvoicePrice;

  const hasStock =
    product.stock !== null &&
    product.stock !== undefined &&
    product.stock !== '' &&
    !Number.isNaN(Number(product.stock));

  const hasDescription = Boolean(product.description && String(product.description).trim());
  const hasIngredients = Boolean(product.ingredients && String(product.ingredients).trim());
  const hasServingSize = Boolean(product.servingSize && String(product.servingSize).trim());

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-12">
      {/* Breadcrumb Back */}
      <div className="flex items-center justify-between">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-unikai-navy"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product Catalogue</span>
        </Link>
        {product.sku && (
          <span className="text-xs font-mono text-slate-500">SKU: {product.sku}</span>
        )}
      </div>

      {/* Main Product Details Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 1. Image Gallery */}
        <div className="lg:col-span-5 space-y-3">
          <div className="aspect-square rounded-2xl bg-slate-50 border border-slate-200/80 p-4 flex items-center justify-center overflow-hidden">
            {activeImageUrl && !imgError ? (
              <img
                src={activeImageUrl}
                alt={product.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                <Package className="w-16 h-16 mb-3 stroke-1" />
                <span className="text-sm font-bold text-slate-600">{product.name}</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedImage(idx);
                    setImgError(false);
                  }}
                  className={`w-16 h-16 rounded-xl border-2 p-1 bg-slate-50 shrink-0 ${
                    selectedImage === idx ? 'border-unikai-blue' : 'border-slate-200'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Data-Driven Product Details */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* 2. Product Name & 3. Brand / Category / Subcategory */}
            <div className="space-y-2.5">
              {(product.brand?.name || product.category?.name || product.subCategory) && (
                <div className="flex flex-wrap items-center gap-2">
                  {product.brand?.name && (
                    <Link
                      to={`/products?brand=${product.brand.slug}`}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-unikai-navy text-white text-xs font-bold"
                    >
                      <Tag className="w-3 h-3" />
                      {product.brand.name}
                    </Link>
                  )}
                  {product.category?.name && (
                    <Link
                      to={`/products?category=${product.category.slug}`}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-unikai-blue/10 text-unikai-blue text-xs font-bold"
                    >
                      <Layers className="w-3 h-3" />
                      {product.category.name}
                    </Link>
                  )}
                  {product.subCategory && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                      {product.subCategory}
                    </span>
                  )}
                </div>
              )}

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {product.name}
                </h1>
                {product.sku && (
                  <p className="text-xs font-mono text-slate-500 mt-1">SKU: {product.sku}</p>
                )}
              </div>
            </div>

            {/* 4. Available Sizes (if exists) */}
            {sizes.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Available Sizes ({sizes.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition ${
                        selectedSize === sz
                          ? 'bg-unikai-navy text-white border-unikai-navy shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-unikai-blue'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Serving Size (if exists) */}
            {hasServingSize && (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs sm:text-sm font-bold">
                <span>Serving Size:</span>
                <span className="text-unikai-navy">{product.servingSize}</span>
              </div>
            )}

            {/* 5. Description (if exists) */}
            {hasDescription && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Description
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* 6. Nutrition (if exists) */}
            {nutritionRows.length > 0 && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 flex items-center gap-2 border-b border-slate-200">
                  <Activity className="w-4 h-4 text-unikai-blue" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Nutrition Information
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-slate-200 text-xs">
                  {nutritionRows.map((row, idx) => (
                    <div key={`${row.name}-${idx}`} className="p-3 bg-white">
                      <span className="block text-slate-500 font-medium">{row.name}</span>
                      <span className="font-extrabold text-slate-900 mt-0.5 block">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Ingredients (if exists) */}
            {hasIngredients && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-unikai-blue" />
                  Ingredients
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {product.ingredients}
                </p>
              </div>
            )}

            {/* 8. Additional Information (if exists) */}
            {additionalInfoRows.length > 0 && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 flex items-center gap-2 border-b border-slate-200">
                  <Info className="w-4 h-4 text-unikai-blue" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Additional Information
                  </h3>
                </div>
                <div className="divide-y divide-slate-200 text-xs sm:text-sm">
                  {additionalInfoRows.map((info, idx) => (
                    <div
                      key={`${info.label}-${idx}`}
                      className="px-4 py-2.5 bg-white flex items-center justify-between gap-4"
                    >
                      <span className="font-semibold text-slate-600">{info.label}</span>
                      <span className="font-bold text-slate-900">{info.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. Price (ONLY if sellingPrice or invoicePrice exists) */}
            {showPriceSection && (
              <div
                className={`grid ${
                  hasSellingPrice && hasInvoicePrice ? 'grid-cols-2' : 'grid-cols-1'
                } gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200`}
              >
                {hasSellingPrice && (
                  <div>
                    <span className="block text-xs font-semibold text-slate-500">
                      Selling Price
                    </span>
                    <span className="text-xl sm:text-2xl font-extrabold text-unikai-navy">
                      {formatOMR(rawSellingPrice)}
                    </span>
                  </div>
                )}
                {hasInvoicePrice && (
                  <div className={hasSellingPrice ? 'border-l border-slate-200 pl-4' : ''}>
                    <span className="block text-xs font-semibold text-slate-500">
                      Invoice Price
                    </span>
                    <span className="text-xl sm:text-2xl font-extrabold text-emerald-700">
                      {formatOMR(product.invoicePrice)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 10. Availability / Stock (ONLY if stock exists) */}
            {hasStock && (
              <div>
                {Number(product.stock) > 0 && product.isActive ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    In Stock ({product.stock} Available)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
                    <XCircle className="w-4 h-4" />
                    Out of Stock
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 11. Quantity + Add to Cart & 12. WhatsApp Order */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Quantity:
                </span>
                <div className="inline-flex items-center rounded-xl border border-slate-300 bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 text-slate-600 hover:text-slate-900"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-14 text-center text-sm font-bold text-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2.5 text-slate-600 hover:text-slate-900"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subtotal shown ONLY when sellingPrice exists */}
              {hasSellingPrice && (
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Subtotal</span>
                  <span className="text-lg font-extrabold text-unikai-navy">
                    {formatOMR(Number(rawSellingPrice) * quantity)}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => addToCart(product, selectedSize, quantity)}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-unikai-blue hover:bg-unikai-navy text-white font-bold text-sm shadow-md transition"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>
                  Add to Cart{selectedSize ? ` (${selectedSize})` : ''}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setWhatsAppOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-4">
            Related Products in {product.category?.name || 'Catalogue'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* WhatsApp Direct Order Modal for this Product */}
      <WhatsAppOrderModal
        isOpen={whatsAppOpen}
        onClose={() => setWhatsAppOpen(false)}
        items={[
          {
            productId: product._id,
            name: product.name,
            size: selectedSize,
            quantity,
            sellingPrice: hasSellingPrice ? Number(rawSellingPrice) : null,
            invoicePrice: hasInvoicePrice ? Number(product.invoicePrice) : null,
          },
        ]}
      />
    </div>
  );
};

export default ProductDetailsPage;
