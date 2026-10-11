import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/axiosClient';
import UnikaiLogo from '../components/UnikaiLogo';

const AdminLoginPage = () => {
  const { login, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated as ADMIN, allow direct skip to /admin
  React.useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loggedUser = await login(email.trim(), password);
      if (loggedUser.role !== 'ADMIN') {
        // Customer account tried logging in via admin route -> reject immediately
        logout();
        setError(
          'Access Denied: This portal requires Administrator privileges. Customer accounts cannot access the management console.'
        );
      } else {
        navigate('/admin', { replace: true });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-5 sm:px-10 shadow-2xl rounded-3xl border border-slate-200">
          <div className="text-center mb-6">
            <UnikaiLogo variant="login" to="/" className="mb-2" />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>UNIKAI Administration Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
              Admin Login
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Authorized management console for catalogue, orders, and sales distribution
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Email Address
              </label>
              <div className="flex items-center border border-slate-300 rounded-xl px-3 py-2.5 focus-within:border-unikai-blue focus-within:ring-1 focus-within:ring-unikai-blue transition">
                <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@unikai.local"
                  className="w-full text-sm focus:outline-none bg-transparent"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="flex items-center border border-slate-300 rounded-xl px-3 py-2.5 focus-within:border-unikai-blue focus-within:ring-1 focus-within:ring-unikai-blue transition">
                <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm focus:outline-none bg-transparent"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none shrink-0"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-unikai-navy hover:bg-unikai-blue text-white font-bold text-sm transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In to Admin Panel'}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center gap-2 text-xs">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-unikai-navy font-semibold transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Wholesale Storefront</span>
            </Link>
            <Link
              to="/login"
              className="text-unikai-blue hover:underline font-medium"
            >
              Customer Wholesale Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
