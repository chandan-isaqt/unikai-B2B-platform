import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Award,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Clock,
  Truck,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import api, { getErrorMessage } from '../api/axiosClient';
import { useAppConfig } from '../context/AppConfigContext';
import { ErrorState } from '../components/Skeletons';

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data?.categories || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-unikai-sky">
          Official Product Lines
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Unikai Product Categories
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select a category to browse wholesale SKUs, pack sizes, and OMR invoice pricing.
        </p>
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.slug}`}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-unikai-blue p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-unikai-blue/10 text-unikai-blue group-hover:bg-unikai-blue group-hover:text-white flex items-center justify-center transition">
                    <Layers className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    {cat.productCount || 0} Products
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 group-hover:text-unikai-blue">
                  {cat.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 inline-flex items-center gap-1.5 text-xs font-bold text-unikai-blue">
                <span>View {cat.name} Catalogue</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/brands')
      .then((res) => setBrands(res.data?.brands || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-unikai-sky">
          Unikai Foods PJSC Portfolio
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Our Official Brands
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Discover the flagship brands manufactured and distributed by Unikai across Oman & the GCC.
        </p>
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {brands.map((brand) => (
            <Link
              key={brand._id}
              to={`/products?brand=${brand.slug}`}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-unikai-blue p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-xl bg-unikai-navy text-white text-xs font-extrabold">
                    {brand.name}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {brand.productCount || 0} SKUs
                  </span>
                </div>
                {brand.tagline && (
                  <p className="text-xs font-bold text-unikai-blue mb-1.5">{brand.tagline}</p>
                )}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {brand.description}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-unikai-navy">
                <span>Origin: {brand.origin || 'GCC'}</span>
                <span className="inline-flex items-center gap-1 text-unikai-blue">
                  Explore Brand <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div className="bg-gradient-to-br from-unikai-navy to-unikai-blue text-white rounded-3xl p-6 sm:p-10 space-y-4">
        <span className="px-3 py-1 rounded-full bg-white/15 text-amber-300 text-xs font-bold">
          ESTABLISHED 1977 • DUBAI & MUSCAT
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold">
          About Unikai Foods PJSC — B2B Wholesale Division
        </h1>
        <p className="text-xs sm:text-base text-slate-200 leading-relaxed">
          Founded in 1977, Unikai Foods PJSC is a publicly listed FMCG leader manufacturing and
          distributing an extensive portfolio of dairy, yoghurt, Meethi Lassi, 100% pure fruit
          juices, ice cream, cheese, butter, ghee, and dry food staples across the UAE, Sultanate of
          Oman, and the wider MENA region.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
          <Award className="w-8 h-8 text-unikai-blue" />
          <h3 className="text-base font-extrabold text-slate-900">45+ Years of Heritage</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Generations of families and businesses across Oman and the UAE trust Unikai for pure,
            nutritious dairy and beverage products.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
          <Truck className="w-8 h-8 text-unikai-blue" />
          <h3 className="text-base font-extrabold text-slate-900">Direct Cold-Chain Network</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Dedicated chilled and frozen distribution depots in Muscat, Sohar, Salalah, and Dubai
            serving over 15,000 retail & HORECA outlets.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
          <ShieldCheck className="w-8 h-8 text-unikai-blue" />
          <h3 className="text-base font-extrabold text-slate-900">Certified Food Safety</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Every batch undergoes rigorous laboratory testing under ISO 22000, HACCP, and GCC Halal
            Municipality standards.
          </p>
        </div>
      </div>
    </div>
  );
};

export const ContactPage = () => {
  const { salesman, settings } = useAppConfig();
  const [sent, setSent] = useState(false);

  const cleanWhatsApp = String(salesman.whatsappNumber || '').replace(/[^\d]/g, '');

  const handleInquiry = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Salesman & Regional Office Info */}
        <div className="lg:col-span-5 space-y-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-unikai-sky">
              Direct B2B Sales Desk
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Contact Salesman & Distribution Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Reach out to your dedicated account executive for wholesale price lists, credit
              accounts, or immediate WhatsApp order dispatch.
            </p>
          </div>

          {/* Dynamic Salesman Card from /api/salesman */}
          <div className="bg-unikai-navy text-white rounded-3xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Active B2B Salesman
                </span>
                <h2 className="text-xl font-extrabold mt-0.5 truncate">{salesman.name}</h2>
                <p className="text-xs text-slate-300">{salesman.title}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-amber-400 text-slate-950 font-extrabold text-xl flex items-center justify-center shrink-0 border-2 border-amber-400/40 shadow-sm relative">
                <span className="select-none">{salesman.name?.[0] || 'S'}</span>
                <img
                  src={salesman.photoUrl || '/image/Sachin.jpeg'}
                  alt={salesman.name || 'Sachin - B2B Sales Executive'}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm pt-2 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Phone: {salesman.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WhatsApp: {salesman.whatsappNumber}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Email: {salesman.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{salesman.workingHours}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{settings.headOfficeAddress}</span>
              </div>
            </div>

            <a
              href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                `Hello ${salesman.name}, I would like to discuss B2B wholesale supply with Unikai.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat with {salesman.name} on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Right: B2B Trade Inquiry Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-4">
            Send a Trade / Distribution Inquiry
          </h2>

          {sent ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-extrabold text-slate-900">Inquiry Received!</h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Our B2B Sales Executive <strong>{salesman.name}</strong> will contact you shortly.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="px-4 py-2 rounded-xl bg-unikai-navy text-white text-xs font-bold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleInquiry} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Company / Supermarket *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Business Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+968 XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City / Area</label>
                  <input
                    type="text"
                    placeholder="Muscat, Oman"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Order or Trade Requirements *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Specify products of interest (e.g., Meethi Lassi 12x10ml, Fresh Yoghurt 10Kg buckets, Orange 1L)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-unikai-navy hover:bg-unikai-blue text-white font-bold text-sm transition"
              >
                Submit B2B Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
