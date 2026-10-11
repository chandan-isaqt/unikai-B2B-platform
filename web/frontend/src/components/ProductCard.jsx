import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Check, Package } from 'lucide-react';
import { resolveImageUrl, formatOMR, hasValidPrice } from '../api/axiosClient';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const sizes = Array.isArray(product.sizes)
    ? product.sizes.map((s) => String(s).trim()).filter(Boolean)
    : [];
  const [selectedSize, setSelectedSize] = useState(sizes[0] || '');
  const [justAdded, setJustAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imageUrl = resolveImageUrl(product.images?.[0] || product.sourceImageUrl);
  const showImage = Boolean(imageUrl && !imgError);

  const rawSellingPrice =
    product.sellingPrice !== undefined && product.sellingPrice !== null
      ? product.sellingPrice
      : product.price;
  const hasSellingPrice = hasValidPrice(rawSellingPrice);
  const hasInvoicePrice = hasValidPrice(product.invoicePrice);
  const showPriceSection = hasSellingPrice || hasInvoicePrice;

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(product, selectedSize, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-unikai-sky/60 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden">
      {/* Image Container — Graceful fallback when no image exists */}
      <Link
        to={`/products/${product.slug}`}
        className="relative block aspect-square bg-slate-50 overflow-hidden p-3 flex items-center justify-center"
      >
        {showImage ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
            <Package className="w-10 h-10 mb-2 stroke-1" />
            <span className="text-xs font-semibold text-slate-500 line-clamp-2">
              {product.name}
            </span>
          </div>
        )}

        {product.isFeatured && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
            Featured
          </span>
        )}
        {product.brand?.name && (
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur text-unikai-navy border border-slate-200 text-[10px] font-bold truncate max-w-[110px]">
            {product.brand.name}
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        {(product.category?.name || product.subCategory) && (
          <div className="text-[11px] font-semibold text-unikai-sky truncate mb-0.5">
            {[product.category?.name, product.subCategory].filter(Boolean).join(' • ')}
          </div>
        )}

        <Link
          to={`/products/${product.slug}`}
          className="text-sm sm:text-base font-bold text-slate-900 hover:text-unikai-blue line-clamp-1 mb-2"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Available Sizes — ONLY rendered if sizes or servingSize exist */}
        {sizes.length > 0 ? (
          <div className="mb-3">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Available Size ({sizes.length})
            </span>
            <div className="flex flex-wrap gap-1">
              {sizes.slice(0, 4).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition ${
                    selectedSize === sz
                      ? 'bg-unikai-navy text-white border-unikai-navy'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {sz}
                </button>
              ))}
              {sizes.length > 4 && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                  +{sizes.length - 4} more
                </span>
              )}
            </div>
          </div>
        ) : product.servingSize ? (
          <div className="mb-3">
            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold">
              Serving Size: {product.servingSize}
            </span>
          </div>
        ) : null}

        {/* Dynamic Price Section — Completely hidden if neither sellingPrice nor invoicePrice exists */}
        {showPriceSection && (
          <div
            className={`mt-auto pt-2.5 border-t border-slate-100 grid ${
              hasSellingPrice && hasInvoicePrice ? 'grid-cols-2' : 'grid-cols-1'
            } gap-1.5 bg-slate-50/70 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2`}
          >
            {hasSellingPrice && (
              <div>
                <span className="block text-[10px] text-slate-500 font-medium">Selling Price</span>
                <span className="text-xs sm:text-sm font-extrabold text-unikai-navy">
                  {formatOMR(rawSellingPrice)}
                </span>
              </div>
            )}
            {hasInvoicePrice && (
              <div className={hasSellingPrice ? 'text-right' : ''}>
                <span className="block text-[10px] text-slate-500 font-medium">Invoice Price</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-700">
                  {formatOMR(product.invoicePrice)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Actions: Add to Cart & View Details */}
        <div className={`${showPriceSection ? 'pt-2.5' : 'mt-auto pt-2'} flex items-center gap-1.5`}>
          <button
            type="button"
            onClick={handleAdd}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-unikai-blue hover:bg-unikai-navy text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <Link
            to={`/products/${product.slug}`}
            className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-unikai-navy transition"
            title="View Product Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
