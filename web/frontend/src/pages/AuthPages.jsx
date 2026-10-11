import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, User, Phone, Building2, MapPin, KeyRound, Eye, EyeOff } from 'lucide-react';
import api, { getErrorMessage } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import UnikaiLogo from '../components/UnikaiLogo';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(from === '/login' ? '/profile' : from);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto px-4 py-8 sm:py-12">
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-md space-y-5">
        <div className="text-center">
          <UnikaiLogo variant="login" to="/" className="mb-2" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            B2B Wholesale Portal Login
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sign in to manage orders, quotation inquiries, and delivery addresses
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="flex items-center border border-slate-300 rounded-xl px-3 py-2.5 focus-within:border-unikai-blue">
              <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="partner@company.com"
                className="w-full text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-unikai-blue hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="flex items-center border border-slate-300 rounded-xl px-3 py-2.5 focus-within:border-unikai-blue">
              <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm focus:outline-none"
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
            className="w-full py-3 rounded-xl bg-unikai-navy hover:bg-unikai-blue text-white font-bold text-sm transition shadow disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs sm:text-sm text-slate-600">
          New B2B retail or HORECA partner?{' '}
          <Link to="/register" className="font-bold text-unikai-blue hover:underline">
            Create B2B Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    password: '',
    street: '',
    city: 'Muscat',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register({
        name: form.name,
        companyName: form.companyName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        address: form.street
          ? {
              label: 'Primary Business Location',
              companyName: form.companyName,
              street: form.street,
              city: form.city || 'Muscat',
              country: 'Oman',
            }
          : undefined,
      });
      navigate('/profile');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-5">
        <div className="text-center">
          <UnikaiLogo variant="login" to="/" className="mb-2" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            Register B2B Customer Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create an official wholesale account for wholesale ordering across Oman & GCC
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <div className="flex items-center border border-slate-300 rounded-xl px-3 py-2 focus-within:border-unikai-blue">
                <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Tariq Al-Balushi"
                  className="w-full text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company / Store</label>
              <div className="flex items-center border border-slate-300 rounded-xl px-3 py-2 focus-within:border-unikai-blue">
                <Building2 className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="Al-Maha Hypermarket"
                  className="w-full text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <div className="flex items-center border border-slate-300 rounded-xl px-3 py-2 focus-within:border-unikai-blue">
                <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="buyer@company.om"
                  className="w-full text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <div className="flex items-center border border-slate-300 rounded-xl px-3 py-2 focus-within:border-unikai-blue">
                <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+968 9512 3456"
                  className="w-full text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password (min 6 chars) *
            </label>
            <div className="flex items-center border border-slate-300 rounded-xl px-3 py-2 focus-within:border-unikai-blue">
              <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full text-sm focus:outline-none"
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Delivery Address
              </label>
              <div className="flex items-center border border-slate-300 rounded-xl px-3 py-2">
                <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  placeholder="Ruwi Commercial District"
                  className="w-full text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Muscat"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-unikai-navy hover:bg-unikai-blue text-white font-bold text-sm transition shadow disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register B2B Account'}
          </button>
        </form>

        <p className="text-center text-xs sm:text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-unikai-blue hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setGeneratedCode(res.data.resetToken || '');
      setResetToken(res.data.resetToken || '');
      setStep(2);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/reset-password', {
        email,
        resetToken,
        newPassword,
      });
      setSuccessMsg(res.data.message);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-5">
        <div className="text-center">
          <UnikaiLogo variant="login" to="/" className="mb-2" />
          <h1 className="text-xl font-extrabold text-slate-900 mt-2">
            {step === 1 ? 'Forgot Password' : 'Reset Your Password'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {step === 1
              ? 'Enter your registered email to receive an account reset code.'
              : 'Enter the 6-digit reset code and choose a new password.'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
            {successMsg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Registered Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@unikai.local"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-unikai-navy text-white font-bold text-sm"
            >
              {loading ? 'Generating Reset Code...' : 'Get Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {generatedCode && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                Local Dev Reset Code: <strong className="font-mono text-sm">{generatedCode}</strong>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reset Code</label>
              <input
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Password (min 6 chars)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm"
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="text-center">
          <Link to="/login" className="text-xs font-bold text-unikai-blue hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
