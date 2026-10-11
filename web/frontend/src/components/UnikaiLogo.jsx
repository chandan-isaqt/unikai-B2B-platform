import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable official UNIKAI brand logo component.
 * Uses official transparent high-resolution logo asset with object-fit: contain.
 * Supports variants: 'desktop' | 'mobile' | 'footer' | 'login' | 'admin' | 'icon'
 */
const UnikaiLogo = ({
  variant = 'desktop',
  to = '/',
  className = '',
  showTagline = true,
  onClick,
}) => {
  const [imgError, setImgError] = useState(false);

  // Variant-specific styling rules
  const variantStyles = {
    desktop: {
      imgClass: 'h-8 sm:h-10 w-auto max-w-[120px] sm:max-w-[170px] object-contain',
      wrapperClass: 'flex items-center gap-2 sm:gap-2.5',
      titleClass: 'text-base sm:text-lg font-extrabold tracking-tight text-unikai-navy leading-none',
      taglineClass: 'text-[10px] font-semibold uppercase tracking-widest text-unikai-sky block mt-0.5',
      showFallbackBadge: true,
    },
    mobile: {
      imgClass: 'h-8 w-auto max-w-[120px] object-contain',
      wrapperClass: 'flex items-center gap-2',
      titleClass: 'text-base font-extrabold tracking-tight text-unikai-navy leading-none',
      taglineClass: 'text-[9px] font-semibold uppercase tracking-wider text-unikai-sky block mt-0.5',
      showFallbackBadge: true,
    },
    footer: {
      imgClass: 'h-9 sm:h-11 w-auto max-w-[150px] sm:max-w-[160px] object-contain brightness-0 invert opacity-95',
      wrapperClass: 'flex items-center gap-2.5',
      titleClass: 'text-lg font-extrabold text-white tracking-tight leading-none',
      taglineClass: 'text-[10px] font-semibold uppercase tracking-widest text-amber-400 block mt-0.5',
      showFallbackBadge: true,
    },
    login: {
      imgClass: 'h-14 sm:h-16 w-auto max-w-[200px] mx-auto object-contain',
      wrapperClass: 'flex flex-col items-center justify-center gap-2',
      titleClass: 'text-xl font-extrabold text-slate-900 tracking-tight text-center',
      taglineClass: 'text-[11px] font-bold uppercase tracking-widest text-unikai-sky text-center',
      showFallbackBadge: false,
    },
    admin: {
      imgClass: 'h-9 w-auto max-w-[130px] object-contain brightness-0 invert opacity-95',
      wrapperClass: 'flex items-center gap-2.5',
      titleClass: 'text-sm font-extrabold text-white tracking-tight leading-none',
      taglineClass: 'text-[10px] font-semibold uppercase tracking-wider text-amber-400 block mt-0.5',
      showFallbackBadge: true,
    },
    icon: {
      imgClass: 'h-8 w-8 object-contain',
      wrapperClass: 'inline-flex items-center justify-center',
      titleClass: 'hidden',
      taglineClass: 'hidden',
      showFallbackBadge: false,
    },
  };

  const style = variantStyles[variant] || variantStyles.desktop;

  const content = (
    <div className={`${style.wrapperClass} ${className}`}>
      {!imgError ? (
        <img
          src="/image/unikai-logo.png"
          alt="UNIKAI"
          className={style.imgClass}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-10 h-10 rounded-xl bg-unikai-navy text-amber-400 font-black text-xl flex items-center justify-center shrink-0 shadow-xs">
          U
        </div>
      )}

      {/* Render optional companion text only for non-login and non-icon variants */}
      {variant !== 'icon' && variant !== 'login' && showTagline && (
        <div
          className={`leading-tight shrink-0 ${
            variant === 'desktop' || variant === 'mobile' ? 'hidden sm:block' : ''
          }`}
        >
          <span className={style.titleClass}>UNIKAI</span>
          <span className={style.taglineClass}>
            {variant === 'admin'
              ? 'Admin Console'
              : variant === 'footer'
              ? 'Quality Since 1977'
              : 'B2B Catalogue'}
          </span>
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} onClick={onClick} className="inline-flex items-center shrink-0 focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};

export default UnikaiLogo;
