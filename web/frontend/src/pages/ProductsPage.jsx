import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import api, { getErrorMessage } from '../api/axiosClient';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton, ErrorState, EmptyState } from '../components/Skeletons';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Lock body scroll and handle Escape key when mobile filters drawer is open
  useEffect(() => {
    if (mobileFiltersOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setMobileFiltersOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = orig;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [mobileFiltersOpen]);

  // Controlled filter states synced with URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [subCategory, setSubCategory] = useState(searchParams.get('subCategory') || '');
  const [line, setLine] = useState(searchParams.get('line') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [size, setSize] = useState(searchParams.get('size') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [isFeatured, setIsFeatured] = useState(searchParams.get('isFeatured') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Sync local state when URL changes externally (e.g. navbar search or category links)
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || '');
    setSubCategory(searchParams.get('subCategory') || '');
    setLine(searchParams.get('line') || '');
    setBrand(searchParams.get('brand') || '');
    setSize(searchParams.get('size') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setIsFeatured(searchParams.get('isFeatured') === 'true');
    setSort(searchParams.get('sort') || 'newest');
    setPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  // Load filter metadata (categories, brands, sizes)
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catRes, brandRes, sizeRes] = await Promise.all([
          api.get('/categories'),
          api.get('/brands'),
          api.get('/products/sizes'),
        ]);
        setCategories(catRes.data?.categories || []);
        setBrands(brandRes.data?.brands || []);
        setAvailableSizes(sizeRes.data?.sizes || []);
      } catch {
        // Handled by main products fetch error
      }
    };
    fetchMeta();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 12,
        sort,
      };
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (subCategory) params.subCategory = subCategory;
      if (line) params.line = line;
      if (brand) params.brand = brand;
      if (size) params.size = size;
      if (minPrice !== '') params.minPrice = minPrice;
      if (maxPrice !== '') params.maxPrice = maxPrice;
      if (isFeatured) params.isFeatured = 'true';

      const res = await api.get('/products', { params });
      setProducts(res.data?.products || []);
      setPagination(
        res.data?.pagination || { total: 0, page: 1, limit: 12, pages: 1 }
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, category, subCategory, line, brand, size, minPrice, maxPrice, isFeatured, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const applyParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined || v === false) {
        next.delete(k);
      } else {
        next.set(k, String(v));
      }
    });
    if (!('page' in updates)) {
      next.set('page', '1');
    }
    setSearchParams(next);
  };

  const resetAllFilters = () => {
    setSearchParams({});
  };

  const FilterControls = () => (
    <div className="space-y-5">
      {/* Featured Only Toggle */}
      <label className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 cursor-pointer">
        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Featured Products Only
        </span>
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => applyParams({ isFeatured: e.target.checked ? 'true' : '' })}
          className="rounded text-unikai-blue focus:ring-unikai-blue"
        />
      </label>

      {/* Category Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => applyParams({ category: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-unikai-blue bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c.slug}>
              {c.name} ({c.productCount || 0})
            </option>
          ))}
        </select>
      </div>

      {/* Brand Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Brand
        </label>
        <select
          value={brand}
          onChange={(e) => applyParams({ brand: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-unikai-blue bg-white"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b._id} value={b.slug}>
              {b.name} ({b.productCount || 0})
            </option>
          ))}
        </select>
      </div>

      {/* Pack Size Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Available Size / Pack
        </label>
        <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => applyParams({ size: '' })}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              !size
                ? 'bg-unikai-navy text-white border-unikai-navy'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Sizes
          </button>
          {availableSizes.map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => applyParams({ size: size === sz ? '' : sz })}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                size === sz
                  ? 'bg-unikai-blue text-white border-unikai-blue'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter (OMR) */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Selling Price Range (OMR)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Min OMR"
            value={minPrice}
            onChange={(e) => applyParams({ minPrice: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-unikai-blue bg-white"
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Max OMR"
            value={maxPrice}
            onChange={(e) => applyParams({ maxPrice: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-unikai-blue bg-white"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-unikai-sky">
            Official UNIKAI Catalogue
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Unikai Wholesale Product Catalogue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Showing {products.length} of {pagination.total} official Unikai products
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-100 rounded-xl px-3 py-2 flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                applyParams({ search: e.target.value });
              }}
              placeholder="Search name, SKU, size..."
              className="bg-transparent text-xs sm:text-sm text-slate-800 focus:outline-none w-full"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => applyParams({ sort: e.target.value })}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:border-unikai-blue"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="popular">Sort: Popular</option>
            <option value="featured">Sort: Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-unikai-navy text-white text-xs font-bold"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom-Sheet Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col z-10 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-unikai-blue" />
                <h3 className="font-extrabold text-base text-slate-900">Filter Catalogue</h3>
              </div>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <FilterControls />
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  resetAllFilters();
                  setMobileFiltersOpen(false);
                }}
                className="flex-1 py-3 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 bg-white hover:bg-slate-100"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-3 rounded-xl bg-unikai-navy hover:bg-unikai-blue font-bold text-xs text-white shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-unikai-blue" />
                Filter Catalogue
              </h2>
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-unikai-blue hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
            <FilterControls />
          </div>
        </aside>

        {/* Product Grid Area (Desktop 4 cols, Tablet 3 cols, Mobile 2 cols) */}
        <div className="lg:col-span-9">
          {/* Active Filter Chips */}
          {(search || category || subCategory || line || brand || size || isFeatured) && (
            <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-slate-100 rounded-xl text-xs">
              <span className="font-bold text-slate-700">Active Filters:</span>
              {line && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold">
                  <span>Line: {line === 'lassi-yoghurt' ? 'Meethi Lassi, Yoghurt & Laban' : line === 'milk' ? 'Fresh & UHT Milk' : line}</span>
                  <button
                    type="button"
                    onClick={() => applyParams({ line: '' })}
                    className="hover:text-red-600 focus:outline-none"
                    aria-label="Remove line filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {category && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 font-bold">
                  <span>Category: {categories.find((c) => c.slug === category)?.name || category}</span>
                  <button
                    type="button"
                    onClick={() => applyParams({ category: '' })}
                    className="hover:text-red-600 focus:outline-none"
                    aria-label="Remove category filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {subCategory && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 font-bold">
                  <span>Subcategory: {subCategory}</span>
                  <button
                    type="button"
                    onClick={() => applyParams({ subCategory: '' })}
                    className="hover:text-red-600 focus:outline-none"
                    aria-label="Remove subcategory filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {brand && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold">
                  <span>Brand: {brands.find((b) => b.slug === brand)?.name || brand}</span>
                  <button
                    type="button"
                    onClick={() => applyParams({ brand: '' })}
                    className="hover:text-red-600 focus:outline-none"
                    aria-label="Remove brand filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200 text-slate-900 font-bold">
                  <span>Search: "{search}"</span>
                  <button
                    type="button"
                    onClick={() => applyParams({ search: '' })}
                    className="hover:text-red-600 focus:outline-none"
                    aria-label="Remove search filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {size && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 font-semibold">
                  <span>Size: {size}</span>
                  <button
                    type="button"
                    onClick={() => applyParams({ size: '' })}
                    className="hover:text-red-600 focus:outline-none"
                    aria-label="Remove size filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs font-bold text-unikai-blue hover:underline ml-auto"
              >
                Clear All
              </button>
            </div>
          )}

          {error ? (
            <ErrorState message={error} onRetry={fetchProducts} />
          ) : loading ? (
            <ProductGridSkeleton count={8} />
          ) : products.length === 0 ? (
            <EmptyState
              title="No matching products found"
              description="We couldn't find any products matching your current filters."
              actionLabel="Reset All Filters"
              onAction={resetAllFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => applyParams({ page: pagination.page - 1 })}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>

                  {Array.from({ length: pagination.pages }).map((_, idx) => {
                    const pNum = idx + 1;
                    return (
                      <button
                        key={pNum}
                        type="button"
                        onClick={() => applyParams({ page: pNum })}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                          pagination.page === pNum
                            ? 'bg-unikai-navy text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => applyParams({ page: pagination.page + 1 })}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
