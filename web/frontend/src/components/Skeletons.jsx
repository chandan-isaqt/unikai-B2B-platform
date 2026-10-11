import React from 'react';
import { AlertTriangle, RefreshCw, PackageOpen, CheckCircle2, WifiOff, Database } from 'lucide-react';

export const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 animate-pulse flex flex-col"
        >
          <div className="w-full aspect-square bg-slate-200 rounded-xl mb-3" />
          <div className="h-3 bg-slate-200 rounded w-1/3 mb-2" />
          <div className="h-5 bg-slate-200 rounded w-3/4 mb-3" />
          <div className="flex gap-1.5 mb-3">
            <div className="h-6 bg-slate-200 rounded-full w-14" />
            <div className="h-6 bg-slate-200 rounded-full w-14" />
          </div>
          <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center">
            <div className="h-5 bg-slate-200 rounded w-20" />
            <div className="h-8 bg-slate-200 rounded-lg w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ErrorState = ({ message, onRetry }) => {
  const isDbError = String(message || '').includes('Database connection unavailable');
  const isServerError = String(message || '').includes('Unable to connect to server');

  return (
    <div className="bg-red-50/90 border border-red-200 rounded-2xl p-6 sm:p-8 text-center max-w-xl mx-auto my-6">
      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
        {isDbError ? (
          <Database className="w-6 h-6" />
        ) : isServerError ? (
          <WifiOff className="w-6 h-6" />
        ) : (
          <AlertTriangle className="w-6 h-6" />
        )}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">
        {isDbError
          ? 'Database Connection Unavailable'
          : isServerError
          ? 'Server Offline'
          : 'Something Went Wrong'}
      </h3>
      <p className="text-sm text-red-700 font-medium mb-5">
        {message || 'Unable to connect to server.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-unikai-navy text-white text-sm font-semibold hover:bg-unikai-blue transition"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

export const EmptyState = ({
  title = 'No Products Found',
  description = 'Try adjusting your search or filter criteria.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto my-6">
      <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
        <PackageOpen className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 mb-5">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-unikai-blue text-white text-sm font-semibold hover:bg-unikai-navy transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export const ToastNotification = ({ message }) => {
  if (!message) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce">
      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      <span className="text-xs sm:text-sm font-medium">{message}</span>
    </div>
  );
};
