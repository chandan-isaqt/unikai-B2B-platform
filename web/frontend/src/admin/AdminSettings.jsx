import React, { useState, useEffect } from 'react';
import { Save, PhoneCall, Building2 } from 'lucide-react';
import api, { getErrorMessage } from '../api/axiosClient';
import { useAppConfig } from '../context/AppConfigContext';

const AdminSettings = () => {
  const { refreshConfig } = useAppConfig();

  const [salesmanForm, setSalesmanForm] = useState({
    name: 'Sachin',
    title: 'Senior B2B Key Account Executive - Oman & GCC',
    phone: '+96891234567',
    whatsappNumber: '+96891234567',
    email: 'sachin.sales@unikai.local',
    region: 'Muscat, Oman & GCC Wholesale Distribution',
    workingHours: 'Sun - Thu: 7:30 AM - 6:30 PM (Oman Time)',
    isActive: true,
  });

  const [settingsForm, setSettingsForm] = useState({
    companyName: 'Unikai Foods PJSC - B2B Wholesale Portal',
    currency: 'OMR',
    supportEmail: 'b2b.oman@unikai.com',
    supportPhone: '+968 2450 1234',
    headOfficeAddress: 'Ghala Industrial Estate, Muscat, Sultanate of Oman',
    whatsappOrderEnabled: true,
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => {
        if (res.data?.salesman) setSalesmanForm(res.data.salesman);
        if (res.data?.settings) setSettingsForm(res.data.settings);
      })
      .catch(() => {});
  }, []);

  const handleSaveAll = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', text: '' });
    try {
      await Promise.all([
        api.put('/salesman', salesmanForm),
        api.put('/settings', { ...settingsForm, salesman: salesmanForm }),
      ]);
      await refreshConfig();
      setFeedback({
        type: 'success',
        text: 'Salesman & Platform Settings saved successfully. Changes are live across all storefronts.',
      });
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Salesman & Platform Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure Salesman Sachin’s WhatsApp contact, phone, and wholesale ordering routing
        </p>
      </div>

      {feedback.text && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-bold border ${
            feedback.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Salesman Configuration Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <PhoneCall className="w-5 h-5 text-unikai-blue" />
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Salesman Contact & Order Routing
                </h2>
                <p className="text-xs text-slate-500">
                  Direct contact details for key account management and WhatsApp orders
                </p>
              </div>
            </div>
            <div
              className="w-12 h-12 rounded-xl overflow-hidden bg-amber-400 text-slate-950 font-bold text-base flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs relative"
              title="Salesman Sachin Photo Preview"
            >
              <span className="select-none">{salesmanForm.name?.[0] || 'S'}</span>
              <img
                src="/image/Sachin.jpeg"
                alt={salesmanForm.name || 'Salesman Sachin'}
                className="absolute inset-0 w-full h-full object-cover object-top"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Salesman Name *
              </label>
              <input
                type="text"
                required
                value={salesmanForm.name || ''}
                onChange={(e) => setSalesmanForm({ ...salesmanForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Title / Role</label>
              <input
                type="text"
                value={salesmanForm.title || ''}
                onChange={(e) => setSalesmanForm({ ...salesmanForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={salesmanForm.phone || ''}
                onChange={(e) => setSalesmanForm({ ...salesmanForm, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-700 mb-1">
                WhatsApp Number (used for WhatsApp Orders) *
              </label>
              <input
                type="text"
                required
                value={salesmanForm.whatsappNumber || ''}
                onChange={(e) =>
                  setSalesmanForm({ ...salesmanForm, whatsappNumber: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={salesmanForm.email || ''}
                onChange={(e) => setSalesmanForm({ ...salesmanForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Working Hours</label>
              <input
                type="text"
                value={salesmanForm.workingHours || ''}
                onChange={(e) =>
                  setSalesmanForm({ ...salesmanForm, workingHours: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-emerald-700 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={salesmanForm.isActive !== false}
              onChange={(e) => setSalesmanForm({ ...salesmanForm, isActive: e.target.checked })}
            />
            Salesman Active
          </label>
        </div>

        {/* General B2B Portal Settings */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-unikai-blue" />
            <h2 className="text-base font-extrabold text-slate-900">
              Company & Distribution Office Info
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={settingsForm.companyName || ''}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, companyName: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Support Phone</label>
              <input
                type="text"
                value={settingsForm.supportPhone || ''}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, supportPhone: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Head Office / Warehouse Address
              </label>
              <input
                type="text"
                value={settingsForm.headOfficeAddress || ''}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, headOfficeAddress: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-unikai-navy hover:bg-unikai-blue text-white font-bold text-sm shadow-lg transition"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Settings...' : 'Save Settings'}</span>
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;
