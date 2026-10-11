import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAppConfig } from '../context/AppConfigContext';
import UnikaiLogo from './UnikaiLogo';

const Footer = () => {
  const { salesman, settings } = useAppConfig();
  const cleanPhone = String(salesman.whatsappNumber || '').replace(/[^\d]/g, '');

  // Mobile accordion state (default first one open or all toggleable)
  const [openSections, setOpenSections] = useState({
    catalogue: false,
    lines: false,
    contact: true,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const catalogueLinks = [
    { to: '/products', label: 'All Wholesale Products' },
    { to: '/categories', label: 'Product Categories' },
    { to: '/brands', label: 'Our Official Brands' },
    { to: '/cart', label: 'Order Cart & Inquiries' },
    { to: '/executive', label: 'Executive Demand Portal', highlight: true },
  ];

  const productLineLinks = [
    { to: '/products?line=lassi-yoghurt', label: 'Meethi Lassi, Yoghurt & Laban' },
    { to: '/products?category=juice', label: '100% Pure Juices & Nectars' },
    { to: '/products?line=milk', label: 'Fresh & Long-Life UHT Milk' },
    { to: '/products?category=ice-cream', label: 'Unikai Silk Ice Cream & Areej' },
    { to: '/products?category=foods', label: 'Pure Cow Ghee, Butter & Cheese' },
  ];

  return (
    <footer className="bg-unikai-navy text-slate-300 border-t border-slate-800 mt-12 sm:mt-16">
      {/* Desktop Layout (md and up) */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand Info */}
          <div>
            <div className="mb-4">
              <UnikaiLogo variant="footer" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
              Unikai Foods PJSC is one of the region’s premier FMCG & Dairy manufacturers, supplying
              hypermarkets, grocers, and HORECA partners across Oman, UAE, and the GCC since 1977.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>ISO 22000 & HACCP Certified</span>
            </div>
          </div>

          {/* Column 2: Quick Catalogue Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              B2B Catalogue
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {catalogueLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`transition ${
                      link.highlight
                        ? 'text-emerald-400 hover:text-emerald-300 font-semibold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/login/admin" className="text-amber-400 hover:text-amber-300 transition font-medium">
                  Admin Management Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Core Categories */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Key Product Lines
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {productLineLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-slate-300 hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Dedicated Sales Desk */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              B2B Sales Desk ({salesman.name})
            </h4>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="break-words">{settings.headOfficeAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${salesman.phone}`} className="hover:text-white transition">
                  {salesman.name}: <strong className="text-white">{salesman.phone}</strong>
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${salesman.email}`} className="hover:text-white transition break-all">
                  {salesman.email}
                </a>
              </div>
              <div className="pt-2">
                <a
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `Hello ${salesman.name}, I would like to inquire about Unikai B2B wholesale ordering.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp {salesman.name}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-First Layout (< md): Compact, Collapsible & Tap-Friendly */}
      <div className="md:hidden px-4 py-8 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-start gap-3">
          <UnikaiLogo variant="footer" />
          <p className="text-xs text-slate-400 leading-relaxed">
            Official FMCG & Dairy Wholesale Catalogue for Oman and the GCC. Quality since 1977.
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>ISO 22000 & HACCP Certified</span>
          </div>
        </div>

        {/* Quick Contact Action Bar for Mobile */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <a
            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `Hello ${salesman.name}, I would like to inquire about Unikai wholesale products.`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-600 active:bg-emerald-700 text-white text-xs font-bold shadow"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>WhatsApp</span>
          </a>
          <a
            href={`tel:${salesman.phone}`}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800 active:bg-slate-700 text-white text-xs font-bold border border-slate-700"
          >
            <Phone className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Call Salesman</span>
          </a>
        </div>

        {/* Accordion 1: B2B Catalogue */}
        <div className="border-t border-slate-800 pt-3">
          <button
            type="button"
            onClick={() => toggleSection('catalogue')}
            className="w-full flex items-center justify-between py-2 text-left text-sm font-bold text-white focus:outline-none"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-unikai-sky" />
              <span>B2B Catalogue Navigation</span>
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openSections.catalogue ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openSections.catalogue && (
            <div className="pt-2 pb-3 pl-6 space-y-2.5 text-xs text-slate-300">
              {catalogueLinks.map((link) => (
                <div key={link.to}>
                  <Link
                    to={link.to}
                    className={`block py-1 hover:text-white transition ${
                      link.highlight ? 'text-emerald-400 font-semibold' : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                </div>
              ))}
              <div>
                <Link to="/login/admin" className="block py-1 text-amber-400 font-medium">
                  Admin Management Portal
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Accordion 2: Key Product Lines */}
        <div className="border-t border-slate-800 pt-3">
          <button
            type="button"
            onClick={() => toggleSection('lines')}
            className="w-full flex items-center justify-between py-2 text-left text-sm font-bold text-white focus:outline-none"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Key Product Lines</span>
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openSections.lines ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openSections.lines && (
            <div className="pt-2 pb-3 pl-6 space-y-2.5 text-xs text-slate-300">
              {productLineLinks.map((link) => (
                <div key={link.to}>
                  <Link to={link.to} className="block py-1 hover:text-white transition">
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accordion 3: B2B Sales Desk */}
        <div className="border-t border-slate-800 pt-3">
          <button
            type="button"
            onClick={() => toggleSection('contact')}
            className="w-full flex items-center justify-between py-2 text-left text-sm font-bold text-white focus:outline-none"
          >
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>B2B Sales Desk ({salesman.name})</span>
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openSections.contact ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openSections.contact && (
            <div className="pt-2 pb-3 pl-6 space-y-2 text-xs text-slate-300">
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="break-words">{settings.headOfficeAddress}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a href={`tel:${salesman.phone}`} className="hover:text-white transition">
                  {salesman.name}: <strong className="text-white">{salesman.phone}</strong>
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a href={`mailto:${salesman.email}`} className="hover:text-white transition break-all">
                  {salesman.email}
                </a>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sub-Footer Copyright Bar */}
      <div className="border-t border-slate-800/80 py-4 px-4 sm:px-6 text-center text-[11px] sm:text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Unikai Foods PJSC. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span>Prices in Omani Rial (OMR)</span>
            <Link to="/login/admin" className="text-slate-500 hover:text-amber-400 transition">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
