import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Award,
  Clock,
  MessageCircle,
  Phone,
  Mail,
  Search,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import api, { resolveImageUrl, getErrorMessage } from '../api/axiosClient';
import { useAppConfig } from '../context/AppConfigContext';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton, ErrorState, EmptyState } from '../components/Skeletons';

const HomePage = () => {
  const { salesman } = useAppConfig();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heroSearch, setHeroSearch] = useState('');

  const loadHomeData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [catRes, featRes, popRes, brandRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products?isFeatured=true&limit=8'),
        api.get('/products?isPopular=true&limit=8'),
        api.get('/brands'),
      ]);

      setCategories(catRes.data?.categories || []);
      setFeaturedProducts(featRes.data?.products || []);
      setPopularProducts(popRes.data?.products || []);
      setBrands(brandRes.data?.brands || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const cleanWhatsApp = String(salesman.whatsappNumber || '').replace(/[^\d]/g, '');

  return (
    <div className="space-y-12 sm:space-y-16 pb-8">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-br from-unikai-navy via-unikai-blue to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>UNIKAI FOODS PJSC • OFFICIAL B2B PRODUCT CATALOGUE</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Official Dairy, Juice, Foods & Ice Cream Catalogue Across{' '}
              <span className="text-amber-400">Oman & the GCC</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed">
              Browse the authoritative Unikai B2B product catalogue across Dairy, Juice / Beverages,
              Foods, and Ice Cream. Place wholesale orders directly or connect with our B2B sales
              team via WhatsApp.
            </p>

            {/* Quick Catalogue Search */}
            <form
              onSubmit={handleHeroSearch}
              className="flex flex-col sm:flex-row gap-2 max-w-xl pt-1"
            >
              <div className="flex-1 flex items-center bg-white rounded-xl px-3.5 py-3 shadow-lg">
                <Search className="w-5 h-5 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Search Fresh Milk, Yoghurt, U Lightning, Mumtaz Rice, Royal Treat..."
                  className="w-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm transition shadow-lg shrink-0"
              >
                Search Catalogue
              </button>
            </form>

            {/* Quick CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-unikai-navy font-bold text-xs sm:text-sm hover:bg-slate-100 transition shadow"
              >
                <span>Browse All Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                  `Hello ${salesman.name}, I would like to place a B2B wholesale order with Unikai.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition shadow"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order via WhatsApp ({salesman.name})</span>
              </a>
            </div>
          </div>

          {/* Dynamic Category Highlights from MongoDB (Zero Hardcoded Products/Prices) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat.slug}`}
                className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 transition flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                    Official Line
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-200 mt-1">
                    {cat.productCount || 0} Products Available
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/10 inline-flex items-center gap-1 text-xs font-bold text-emerald-300">
                  <span>Explore {cat.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ErrorState message={error} onRetry={loadHomeData} />
        </div>
      )}

      {/* 2. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-unikai-sky">
              Explore by Line
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Official Product Categories
            </h2>
          </div>
          <Link
            to="/categories"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-unikai-blue hover:text-unikai-navy"
          >
            <span>All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const catImg = resolveImageUrl(cat.image);
            return (
              <Link
                key={cat._id}
                to={`/products?category=${cat.slug}`}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-unikai-sky p-4 text-center shadow-xs hover:shadow-md transition flex flex-col items-center justify-between"
              >
                {catImg ? (
                  <div className="w-full h-28 rounded-xl bg-slate-50 p-2 mb-3 flex items-center justify-center overflow-hidden">
                    <img
                      src={catImg}
                      alt={cat.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-unikai-blue/10 text-unikai-blue group-hover:bg-unikai-blue group-hover:text-white flex items-center justify-center mb-3 transition">
                    <Layers className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-unikai-blue line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{cat.productCount || 0} Products</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Official Unikai Range
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Featured Products
            </h2>
          </div>
          <Link
            to="/products?isFeatured=true"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-unikai-blue hover:text-unikai-navy"
          >
            <span>View All Featured</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : featuredProducts.length === 0 ? (
          <EmptyState title="No Featured Products" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. POPULAR PRODUCTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              High Turnover Retail & HORECA
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Popular Products
            </h2>
          </div>
          <Link
            to="/products?sort=popular"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-unikai-blue hover:text-unikai-navy"
          >
            <span>Explore Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : popularProducts.length === 0 ? (
          <EmptyState title="No Popular Products" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {popularProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. BRANDS SECTION */}
      <section className="bg-white border-y border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-unikai-sky">
                Official Portfolio
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Our Unikai Brands
              </h2>
            </div>
            <Link
              to="/brands"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-unikai-blue hover:text-unikai-navy"
            >
              <span>All Brands</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map((brand) => (
              <Link
                key={brand._id}
                to={`/products?brand=${brand.slug}`}
                className="p-5 rounded-2xl border border-slate-200 hover:border-unikai-blue bg-slate-50/60 hover:bg-white transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-lg bg-unikai-navy text-white text-xs font-extrabold">
                      {brand.name}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {brand.productCount || 0} Products
                    </span>
                  </div>
                  {brand.tagline && (
                    <p className="text-xs font-bold text-unikai-blue mb-1">{brand.tagline}</p>
                  )}
                  {brand.description && (
                    <p className="text-xs text-slate-600 line-clamp-2">{brand.description}</p>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs font-bold text-unikai-navy">
                  <span>Origin: {brand.origin || 'GCC'}</span>
                  <span className="inline-flex items-center gap-1 text-unikai-blue">
                    Browse Products <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. WHY CHOOSE US SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-unikai-sky">
            B2B Advantage
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Why Partner With Unikai B2B
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Established in 1977, Unikai Foods PJSC operates one of the largest temperature-controlled
            distribution fleets serving Oman and the UAE.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Truck,
              title: 'Daily Cold-Chain Fleet',
              desc: 'Chilled & frozen GPS-monitored trucks delivering fresh dairy and ice cream across Muscat, Sohar, Salalah & GCC.',
            },
            {
              icon: ShieldCheck,
              title: 'Authoritative Product Data',
              desc: 'Official Unikai product specifications, pack sizes, and nutritional facts directly from the Unikai catalogue.',
            },
            {
              icon: Award,
              title: 'Heritage Since 1977',
              desc: 'Over four decades of ISO & HACCP certified dairy, juice, and food manufacturing excellence.',
            },
            {
              icon: Clock,
              title: '1-Click WhatsApp Ordering',
              desc: 'Place orders directly on the portal or send structured WhatsApp order sheets to your dedicated salesman.',
            },
          ].map((feat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col"
            >
              <div className="w-11 h-11 rounded-xl bg-unikai-blue/10 text-unikai-blue flex items-center justify-center mb-3.5">
                <feat.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5">{feat.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. EXECUTIVE LEADERSHIP SECTION */}
      <section className="bg-slate-900 text-white py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              Corporate Governance
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Unikai Executive Leadership
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Guiding Unikai Foods PJSC’s dairy, beverage, and cold-chain FMCG distribution across
              the Sultanate of Oman and the GCC with four decades of manufacturing heritage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* CEO */}
            <div className="bg-slate-800/80 rounded-3xl border border-slate-700/80 overflow-hidden flex flex-col group hover:border-amber-400/50 transition duration-300">
              <div className="h-64 sm:h-72 w-full overflow-hidden bg-slate-950 flex items-center justify-center relative">
                <img
                  src="/image/CEO.jpeg"
                  alt="Chief Executive Officer"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                <span className="absolute bottom-3 left-4 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-extrabold tracking-wider uppercase">
                  Executive Suite
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white">
                    Chief Executive Officer
                  </h3>
                  <p className="text-xs font-bold text-amber-400 mt-0.5">Unikai Foods PJSC</p>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Directing corporate vision, long-term capital allocation, brand expansion, and
                    GCC manufacturing infrastructure.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span>Executive Member</span>
                  <span className="text-emerald-400">Governance & Strategy</span>
                </div>
              </div>
            </div>

            {/* General Manager */}
            <div className="bg-slate-800/80 rounded-3xl border border-slate-700/80 overflow-hidden flex flex-col group hover:border-amber-400/50 transition duration-300">
              <div className="h-64 sm:h-72 w-full overflow-hidden bg-slate-950 flex items-center justify-center relative">
                <img
                  src="/image/GM.jpeg"
                  alt="General Manager"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                <span className="absolute bottom-3 left-4 px-2.5 py-1 rounded-lg bg-unikai-sky text-white text-[11px] font-extrabold tracking-wider uppercase">
                  Operations Suite
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white">
                    General Manager
                  </h3>
                  <p className="text-xs font-bold text-sky-400 mt-0.5">Operations & Production</p>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Orchestrating processing plants, cold-chain fulfillment, multi-line quality
                    assurance, and operational agility.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span>Operational Leadership</span>
                  <span className="text-emerald-400">Cold-Chain Network</span>
                </div>
              </div>
            </div>

            {/* Country Manager */}
            <div className="bg-slate-800/80 rounded-3xl border border-slate-700/80 overflow-hidden flex flex-col group hover:border-amber-400/50 transition duration-300">
              <div className="h-64 sm:h-72 w-full overflow-hidden bg-slate-950 flex items-center justify-center relative">
                <img
                  src="/image/country manager.jpeg"
                  alt="Country Manager - Oman"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                <span className="absolute bottom-3 left-4 px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[11px] font-extrabold tracking-wider uppercase">
                  Oman Distribution
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white">
                    Country Manager
                  </h3>
                  <p className="text-xs font-bold text-emerald-400 mt-0.5">Sultanate of Oman</p>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Leading wholesale trade channels, hypermarket key accounts, branch depots, and
                    field sales teams across Oman.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span>Regional Branch Head</span>
                  <span className="text-emerald-400">Muscat & Nationwide</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/executive"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs sm:text-sm font-bold text-white transition"
            >
              <span>Access Executive Demand & Performance Portal</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. CONTACT SALESMAN & WHATSAPP CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-unikai-navy to-unikai-blue rounded-3xl p-6 sm:p-10 text-white shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Dedicated Key Account Manager</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold">
              Need Bulk Quotations or Scheduled Store Deliveries?
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
              Connect directly with our B2B Sales Executive{' '}
              <strong className="text-amber-300">{salesman.name}</strong> for hypermarket supply,
              HORECA contracts, or instant WhatsApp order fulfillment.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs sm:text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>{salesman.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>{salesman.email}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-300 font-bold">
                  Assigned Salesman
                </p>
                <h3 className="text-lg font-extrabold text-white">{salesman.name}</h3>
                <p className="text-xs text-slate-300">{salesman.title}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 font-extrabold text-xl flex items-center justify-center">
                {salesman.name?.[0] || 'S'}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <a
                href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                  `Hello ${salesman.name},\n\nI would like to place a B2B order from the Unikai Catalogue.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp {salesman.name}</span>
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center py-3 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm transition"
              >
                Contact Desk
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
