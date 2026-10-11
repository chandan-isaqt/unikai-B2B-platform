import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Power,
  X,
  Upload,
  ChevronLeft,
  ChevronRight,
  Package,
  Star,
  AlertTriangle,
} from 'lucide-react';
import api, {
  resolveImageUrl,
  formatOMR,
  hasValidPrice,
  getErrorMessage,
} from '../api/axiosClient';

const emptyProductForm = {
  name: '',
  slug: '',
  sku: '',
  category: '',
  brand: '',
  subCategory: '',
  description: '',
  sizes: '',
  servingSize: '',
  sellingPrice: '',
  invoicePrice: '',
  images: '',
  sourceImageUrl: '',
  stock: '',
  ingredients: '',
  nutrition: [],
  additionalInformation: [],
  isFeatured: false,
  isPopular: false,
  isActive: true,
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProductForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const notify = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback({ type: '', text: '' }), 4000);
  };

  const loadMeta = useCallback(async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        api.get('/categories?includeInactive=true'),
        api.get('/brands?includeInactive=true'),
      ]);
      setCategories(catRes.data?.categories || []);
      setBrands(brandRes.data?.brands || []);
    } catch {
      // Ignore
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        includeInactive: 'true',
        page,
        limit: 15,
        sort: 'updated',
      };
      if (search.trim()) params.search = search.trim();
      if (categoryFilter) params.category = categoryFilter;
      if (brandFilter) params.brand = brandFilter;
      if (statusFilter !== '') params.isActive = statusFilter;

      const res = await api.get('/products', { params });
      setProducts(res.data?.products || []);
      setPagination(res.data?.pagination || { total: 0, page: 1, limit: 15, pages: 1 });
    } catch (err) {
      notify('error', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, brandFilter, statusFilter, page]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      ...emptyProductForm,
      category: categories[0]?._id || '',
      brand: brands[0]?._id || '',
      nutrition: [],
      additionalInformation: [],
    });
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product._id);

    let normalizedNutrition = [];
    if (Array.isArray(product.nutrition)) {
      normalizedNutrition = product.nutrition.map((n) => ({
        name: n.name || '',
        value: n.value || '',
      }));
    } else if (product.nutrition && typeof product.nutrition === 'object') {
      normalizedNutrition = Object.entries(product.nutrition)
        .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
        .map(([k, v]) => ({ name: k, value: String(v) }));
    }

    const normalizedAdditional = Array.isArray(product.additionalInformation)
      ? product.additionalInformation.map((info) => ({
          label: info.label || '',
          value: info.value || '',
        }))
      : [];

    const rawSelling =
      product.sellingPrice !== undefined && product.sellingPrice !== null
        ? product.sellingPrice
        : product.price;

    setForm({
      name: product.name || '',
      slug: product.slug || '',
      sku: product.sku || '',
      category: product.category?._id || product.category || '',
      brand: product.brand?._id || product.brand || '',
      subCategory: product.subCategory || '',
      description: product.description || '',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
      servingSize: product.servingSize || '',
      sellingPrice: hasValidPrice(rawSelling) ? String(rawSelling) : '',
      invoicePrice: hasValidPrice(product.invoicePrice) ? String(product.invoicePrice) : '',
      images: Array.isArray(product.images) ? product.images.join(', ') : '',
      sourceImageUrl: product.sourceImageUrl || '',
      stock:
        product.stock !== null && product.stock !== undefined && product.stock !== ''
          ? String(product.stock)
          : '',
      ingredients: product.ingredients || '',
      nutrition: normalizedNutrition,
      additionalInformation: normalizedAdditional,
      isFeatured: Boolean(product.isFeatured),
      isPopular: Boolean(product.isPopular),
      isActive: product.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.imageUrl) {
        setForm((prev) => ({
          ...prev,
          images: prev.images ? `${res.data.imageUrl}, ${prev.images}` : res.data.imageUrl,
          sourceImageUrl: prev.sourceImageUrl || res.data.imageUrl,
        }));
        notify('success', 'Image uploaded successfully.');
      }
    } catch (err) {
      notify('error', getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  // Dynamic Nutrition Row Helpers
  const addNutritionRow = () => {
    setForm((prev) => ({
      ...prev,
      nutrition: [...prev.nutrition, { name: '', value: '' }],
    }));
  };

  const updateNutritionRow = (index, field, val) => {
    setForm((prev) => {
      const copy = [...prev.nutrition];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, nutrition: copy };
    });
  };

  const removeNutritionRow = (index) => {
    setForm((prev) => ({
      ...prev,
      nutrition: prev.nutrition.filter((_, i) => i !== index),
    }));
  };

  // Dynamic Additional Info Row Helpers
  const addAdditionalInfoRow = () => {
    setForm((prev) => ({
      ...prev,
      additionalInformation: [...prev.additionalInformation, { label: '', value: '' }],
    }));
  };

  const updateAdditionalInfoRow = (index, field, val) => {
    setForm((prev) => {
      const copy = [...prev.additionalInformation];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, additionalInformation: copy };
    });
  };

  const removeAdditionalInfoRow = (index) => {
    setForm((prev) => ({
      ...prev,
      additionalInformation: prev.additionalInformation.filter((_, i) => i !== index),
    }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      notify('error', 'Product name is required.');
      return;
    }

    setSaving(true);
    try {
      const parsedSellingPrice =
        form.sellingPrice !== '' &&
        form.sellingPrice !== null &&
        Number(form.sellingPrice) > 0
          ? Number(form.sellingPrice)
          : null;

      const parsedInvoicePrice =
        form.invoicePrice !== '' &&
        form.invoicePrice !== null &&
        Number(form.invoicePrice) > 0
          ? Number(form.invoicePrice)
          : null;

      const parsedStock =
        form.stock !== '' && form.stock !== null && !Number.isNaN(Number(form.stock))
          ? Number(form.stock)
          : null;

      const parsedSizes = form.sizes
        ? form.sizes
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const parsedImages = form.images
        ? form.images
            .split(',')
            .map((img) => img.trim())
            .filter(Boolean)
        : [];

      const validNutrition = form.nutrition
        .filter((r) => r.name && r.name.trim() && r.value && r.value.trim())
        .map((r) => ({ name: r.name.trim(), value: r.value.trim() }));

      const validAdditionalInfo = form.additionalInformation
        .filter((r) => r.label && r.label.trim() && r.value && r.value.trim())
        .map((r) => ({ label: r.label.trim(), value: r.value.trim() }));

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        sku: form.sku.trim() || null,
        category: form.category || null,
        brand: form.brand || null,
        subCategory: form.subCategory.trim() || null,
        description: form.description.trim(),
        sizes: parsedSizes,
        servingSize: form.servingSize.trim(),
        sellingPrice: parsedSellingPrice,
        invoicePrice: parsedInvoicePrice,
        stock: parsedStock,
        images: parsedImages,
        sourceImageUrl: form.sourceImageUrl.trim() || parsedImages[0] || null,
        ingredients: form.ingredients.trim(),
        nutrition: validNutrition,
        additionalInformation: validAdditionalInfo,
        isFeatured: Boolean(form.isFeatured),
        isPopular: Boolean(form.isPopular),
        isActive: Boolean(form.isActive),
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        notify('success', 'Product updated successfully!');
      } else {
        await api.post('/products', payload);
        notify('success', 'New product created successfully!');
      }
      setModalOpen(false);
      await loadProducts();
    } catch (err) {
      notify('error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      await api.patch(`/products/${product._id}/toggle-status`);
      notify(
        'success',
        `${product.name} ${product.isActive ? 'deactivated' : 'activated'}.`
      );
      await loadProducts();
    } catch (err) {
      notify('error', getErrorMessage(err));
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteTarget._id}`);
      notify('success', `"${deleteTarget.name}" deleted permanently.`);
      if (viewProduct && viewProduct._id === deleteTarget._id) {
        setViewProduct(null);
      }
      setDeleteTarget(null);
      await loadProducts();
    } catch (err) {
      notify('error', getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const renderPriceColumn = (prod) => {
    const rawSelling =
      prod.sellingPrice !== undefined && prod.sellingPrice !== null
        ? prod.sellingPrice
        : prod.price;
    if (hasValidPrice(rawSelling)) {
      return (
        <div>
          <span className="font-extrabold text-unikai-navy block">{formatOMR(rawSelling)}</span>
          {hasValidPrice(prod.invoicePrice) && (
            <span className="text-[11px] font-semibold text-emerald-700 block">
              Inv: {formatOMR(prod.invoicePrice)}
            </span>
          )}
        </div>
      );
    }
    if (hasValidPrice(prod.invoicePrice)) {
      return (
        <span className="font-bold text-emerald-700">
          {formatOMR(prod.invoicePrice)} (Inv)
        </span>
      );
    }
    return <span className="text-slate-400 font-bold">—</span>;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Products Management ({pagination.total})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Official Unikai B2B Catalogue • Full CRUD with dynamic nutrition & optional OMR pricing
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-unikai-navy hover:bg-unikai-blue text-white text-xs sm:text-sm font-bold shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {feedback.text && (
        <div
          className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold border ${
            feedback.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center bg-slate-100 rounded-xl px-3 py-2 flex-1 min-w-0 sm:min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by product name, subcategory, size, or SKU..."
            className="bg-transparent text-xs sm:text-sm focus:outline-none w-full"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={brandFilter}
          onChange={(e) => {
            setBrandFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-white"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-white"
        >
          <option value="">All Status</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
      </div>

      {/* Products Container */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Mobile Product Cards (< 768px) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No products found.
            </div>
          ) : (
            products.map((prod) => {
              const imgUrl = resolveImageUrl(prod.images?.[0] || prod.sourceImageUrl);
              return (
                <div key={prod._id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={prod.name}
                        className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 object-contain p-1 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-slate-900 text-sm leading-snug">{prod.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-1">
                        {prod.brand?.name && (
                          <span className="font-semibold text-unikai-blue">{prod.brand.name}</span>
                        )}
                        {prod.category?.name && (
                          <span>• {prod.category.name}</span>
                        )}
                      </div>
                      {prod.sku && (
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">SKU: {prod.sku}</div>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        prod.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {prod.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Price</span>
                      {renderPriceColumn(prod)}
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Stock</span>
                      <span className="font-semibold text-slate-800">
                        {prod.stock !== null && prod.stock !== undefined ? prod.stock : '—'}
                      </span>
                    </div>
                    {Array.isArray(prod.sizes) && prod.sizes.length > 0 && (
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Sizes</span>
                        <div className="flex flex-wrap gap-1">
                          {prod.sizes.map((sz) => (
                            <span
                              key={sz}
                              className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px] font-bold"
                            >
                              {sz}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setViewProduct(prod)}
                      className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-unikai-blue" />
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(prod)}
                      className="flex-1 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center justify-center gap-1 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(prod)}
                      className={`p-2 rounded-xl border text-xs font-bold transition ${
                        prod.isActive
                          ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          : 'border-slate-200 text-slate-400 hover:bg-slate-100'
                      }`}
                      title={prod.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(prod)}
                      className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Products Table (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                <th className="py-3.5 px-3.5">Image</th>
                <th className="py-3.5 px-3.5">Product Name</th>
                <th className="py-3.5 px-3.5">Brand</th>
                <th className="py-3.5 px-3.5">Category</th>
                <th className="py-3.5 px-3.5">Sizes</th>
                <th className="py-3.5 px-3.5">Price</th>
                <th className="py-3.5 px-3.5">Stock</th>
                <th className="py-3.5 px-3.5">Status</th>
                <th className="py-3.5 px-3.5">Featured</th>
                <th className="py-3.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-500">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const imgUrl = resolveImageUrl(prod.images?.[0] || prod.sourceImageUrl);
                  return (
                    <tr key={prod._id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3.5">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 object-contain p-1"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900">{prod.name}</div>
                        {(prod.sku || prod.subCategory) && (
                          <div className="text-[11px] text-slate-500">
                            {[prod.sku, prod.subCategory].filter(Boolean).join(' • ')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 font-semibold">
                        {prod.brand?.name || '—'}
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 font-medium">
                        {prod.category?.name || '—'}
                      </td>
                      <td className="py-3 px-3.5">
                        {Array.isArray(prod.sizes) && prod.sizes.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {prod.sizes.slice(0, 3).map((sz) => (
                              <span
                                key={sz}
                                className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold"
                              >
                                {sz}
                              </span>
                            ))}
                            {prod.sizes.length > 3 && (
                              <span className="text-[11px] text-slate-400">
                                +{prod.sizes.length - 3}
                              </span>
                            )}
                          </div>
                        ) : prod.servingSize ? (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-semibold">
                            {prod.servingSize}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5">{renderPriceColumn(prod)}</td>
                      <td className="py-3 px-3.5 text-slate-700 font-semibold">
                        {prod.stock !== null && prod.stock !== undefined ? prod.stock : '—'}
                      </td>
                      <td className="py-3 px-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            prod.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {prod.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        {prod.isFeatured ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            Yes
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">No</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setViewProduct(prod)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-unikai-blue hover:bg-slate-100"
                            title="View Complete Product Data"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(prod)}
                            className={`p-1.5 rounded-lg ${
                              prod.isActive
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-slate-400 hover:bg-slate-100'
                            }`}
                            title={prod.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(prod)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Page {pagination.page} of {pagination.pages} ({pagination.total} items)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Product Modal — Shows ONLY existing fields (Section 6 & 9) */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">{viewProduct.name}</h3>
                <span className="text-xs text-slate-500 font-mono">Slug: {viewProduct.slug}</span>
              </div>
              <button
                onClick={() => setViewProduct(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-4 items-start">
              {resolveImageUrl(viewProduct.images?.[0] || viewProduct.sourceImageUrl) && (
                <img
                  src={resolveImageUrl(viewProduct.images?.[0] || viewProduct.sourceImageUrl)}
                  alt={viewProduct.name}
                  className="w-28 h-28 rounded-2xl bg-slate-50 border border-slate-200 object-contain p-2 shrink-0"
                />
              )}
              <div className="text-xs space-y-1.5 flex-1">
                {viewProduct.brand?.name && (
                  <div>
                    <strong className="text-slate-600">Brand:</strong> {viewProduct.brand.name}
                  </div>
                )}
                {viewProduct.category?.name && (
                  <div>
                    <strong className="text-slate-600">Category:</strong>{' '}
                    {viewProduct.category.name}
                  </div>
                )}
                {viewProduct.subCategory && (
                  <div>
                    <strong className="text-slate-600">Subcategory:</strong>{' '}
                    {viewProduct.subCategory}
                  </div>
                )}
                {viewProduct.sku && (
                  <div>
                    <strong className="text-slate-600">SKU:</strong> {viewProduct.sku}
                  </div>
                )}
                {hasValidPrice(viewProduct.sellingPrice ?? viewProduct.price) && (
                  <div>
                    <strong className="text-slate-600">Selling Price:</strong>{' '}
                    <span className="font-bold text-unikai-navy">
                      {formatOMR(viewProduct.sellingPrice ?? viewProduct.price)}
                    </span>
                  </div>
                )}
                {hasValidPrice(viewProduct.invoicePrice) && (
                  <div>
                    <strong className="text-slate-600">Invoice Price:</strong>{' '}
                    <span className="font-bold text-emerald-700">
                      {formatOMR(viewProduct.invoicePrice)}
                    </span>
                  </div>
                )}
                {viewProduct.stock !== null && viewProduct.stock !== undefined && (
                  <div>
                    <strong className="text-slate-600">Stock:</strong> {viewProduct.stock}
                  </div>
                )}
              </div>
            </div>

            {Array.isArray(viewProduct.sizes) && viewProduct.sizes.length > 0 && (
              <div className="text-xs">
                <strong className="text-slate-700 block mb-1">Available Sizes:</strong>
                <div className="flex flex-wrap gap-1.5">
                  {viewProduct.sizes.map((sz) => (
                    <span
                      key={sz}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold"
                    >
                      {sz}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {viewProduct.servingSize && (
              <div className="text-xs">
                <strong className="text-slate-700">Serving Size:</strong> {viewProduct.servingSize}
              </div>
            )}

            {viewProduct.description && (
              <div className="text-xs">
                <strong className="text-slate-700 block mb-1">Description:</strong>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {viewProduct.description}
                </p>
              </div>
            )}

            {Array.isArray(viewProduct.nutrition) && viewProduct.nutrition.length > 0 && (
              <div className="text-xs">
                <strong className="text-slate-700 block mb-1.5">Nutrition Information:</strong>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  {viewProduct.nutrition.map((n, i) => (
                    <div key={`${n.name}-${i}`}>
                      <span className="text-slate-500 block">{n.name}</span>
                      <span className="font-bold text-slate-900">{n.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewProduct.ingredients && (
              <div className="text-xs">
                <strong className="text-slate-700 block mb-1">Ingredients:</strong>
                <p className="text-slate-600">{viewProduct.ingredients}</p>
              </div>
            )}

            {Array.isArray(viewProduct.additionalInformation) &&
              viewProduct.additionalInformation.length > 0 && (
                <div className="text-xs">
                  <strong className="text-slate-700 block mb-1">Additional Information:</strong>
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                    {viewProduct.additionalInformation.map((info, i) => (
                      <div key={i} className="px-3 py-2 flex justify-between">
                        <span className="text-slate-600">{info.label}</span>
                        <span className="font-bold text-slate-900">{info.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewProduct(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = viewProduct;
                  setViewProduct(null);
                  openEditModal(p);
                }}
                className="px-4 py-2 rounded-xl bg-unikai-navy text-white text-xs font-bold"
              >
                Edit Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Section 9 DELETE) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Delete Product</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900">"{deleteTarget.name}"</strong>?
              It will immediately be removed from the customer website and Flutter app.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteProduct}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal (Sections 9 & 10) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h2 className="text-lg font-extrabold text-slate-900">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs sm:text-sm">
              {/* Name, SKU, Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Fresh Milk"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SKU [optional]
                  </label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="Optional SKU"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              {/* Category, Brand, Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">None / Unassigned</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand</label>
                  <select
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">None / Unassigned</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subcategory [optional]
                  </label>
                  <input
                    type="text"
                    value={form.subCategory}
                    onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                    placeholder="e.g. UHT Milk, Sparkling Drink"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Optional Prices & Stock (Section 10 — Save as null when left empty) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Selling Price (OMR) <span className="text-slate-400 font-normal">[optional]</span>
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={form.sellingPrice}
                    onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                    placeholder="Leave empty if unavailable"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Invoice Price (OMR) <span className="text-slate-400 font-normal">[optional]</span>
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={form.invoicePrice}
                    onChange={(e) => setForm({ ...form, invoicePrice: e.target.value })}
                    placeholder="Leave empty if unavailable"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stock <span className="text-slate-400 font-normal">[optional]</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="Leave empty if N/A"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              {/* Sizes & Serving Size */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Available Sizes (comma-separated) [optional]
                  </label>
                  <input
                    type="text"
                    value={form.sizes}
                    onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                    placeholder="e.g. 250ml, 500ml, 1L, 2L"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Serving Size [optional]
                  </label>
                  <input
                    type="text"
                    value={form.servingSize}
                    onChange={(e) => setForm({ ...form, servingSize: e.target.value })}
                    placeholder="e.g. 120 ml"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Description & Ingredients */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Description [optional]
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Official product description..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ingredients [optional]
                  </label>
                  <textarea
                    rows={3}
                    value={form.ingredients}
                    onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                    placeholder="Optional ingredients list..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Official Image URL(s) & Local File Upload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Official Image URL(s) (comma-separated) [optional]
                  </label>
                  <label className="inline-flex items-center gap-1 text-xs font-bold text-unikai-blue cursor-pointer hover:underline">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? 'Uploading...' : 'Upload Image File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                  placeholder="https://www.unikai.com/wp-content/uploads/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              {/* Dynamic Nutrition Rows Editor (Section 7 & Section 9) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    Dynamic Nutrition Rows ({form.nutrition.length})
                  </span>
                  <button
                    type="button"
                    onClick={addNutritionRow}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-unikai-blue text-white text-xs font-bold hover:bg-unikai-navy"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Nutrition Row
                  </button>
                </div>

                {form.nutrition.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No nutrition rows added. Nutrition section will be hidden on the product page.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {form.nutrition.map((row, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => updateNutritionRow(idx, 'name', e.target.value)}
                          placeholder="Nutrient (e.g. Energy, Protein, Calcium)"
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                        <input
                          type="text"
                          value={row.value}
                          onChange={(e) => updateNutritionRow(idx, 'value', e.target.value)}
                          placeholder="Value (e.g. 85 kcal, 3.4 gm)"
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeNutritionRow(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Remove row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Additional Information Rows Editor */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    Additional Information Rows ({form.additionalInformation.length})
                  </span>
                  <button
                    type="button"
                    onClick={addAdditionalInfoRow}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700 text-white text-xs font-bold hover:bg-slate-900"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Info Row
                  </button>
                </div>

                {form.additionalInformation.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No additional info rows added. Section will be hidden on the product page.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {form.additionalInformation.map((row, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={row.label}
                          onChange={(e) => updateAdditionalInfoRow(idx, 'label', e.target.value)}
                          placeholder="Label (e.g. Storage, Shelf Life)"
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                        <input
                          type="text"
                          value={row.value}
                          onChange={(e) => updateAdditionalInfoRow(idx, 'value', e.target.value)}
                          placeholder="Value (e.g. Keep Refrigerated)"
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeAdditionalInfoRow(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Remove row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap items-center gap-5 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  />
                  Featured Product
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPopular}
                    onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                  />
                  Popular Product
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-emerald-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  Active (Visible on Storefront & Flutter)
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-unikai-navy hover:bg-unikai-blue text-white text-xs font-bold shadow"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
