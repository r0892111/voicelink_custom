import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, AlertCircle, Zap, Building2, Phone, CheckCircle } from 'lucide-react';

type CRMProvider = 'pipedrive' | 'odoo' | 'teamleader';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCRM, setSelectedCRM] = useState<CRMProvider | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const crmOptions = [
    {
      id: 'pipedrive' as CRMProvider,
      name: 'Pipedrive',
      color: 'from-emerald-500 to-teal-600',
      enabled: true,
    },
    {
      id: 'odoo' as CRMProvider,
      name: 'Odoo',
      color: 'from-orange-500 to-red-600',
      enabled: false,
    },
    {
      id: 'teamleader' as CRMProvider,
      name: 'Teamleader',
      color: 'from-blue-500 to-cyan-600',
      enabled: true,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCRM) {
      setError('Selecteer eerst een CRM-platform');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/register-custom-user`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          phoneNumber: phone,
          userType: selectedCRM,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registratie mislukt');
      }

      if (data.success) {
        setIsRegistered(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registratie mislukt');
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full blur-xl opacity-30"></div>
                <div className="relative bg-white p-6 rounded-full shadow-lg">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Registratie succesvol!
            </h1>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <p className="text-lg text-slate-700 mb-4">
                Je account is aangemaakt voor <span className="font-semibold text-blue-600">{selectedCRM}</span>.
              </p>
              <p className="text-slate-600 mb-6">
                We hebben je registratie ontvangen. Ons team zal je account activeren en je zult binnenkort toegang krijgen tot Voicelink.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Let op:</span> Je ontvangt een bevestigingsmail op <span className="font-medium">{email}</span> zodra je account is geactiveerd.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-30"></div>
              <div className="relative bg-white p-4 rounded-2xl shadow-lg">
                <Zap className="w-10 h-10 text-blue-600" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Welkom bij Voicelink
          </h1>
          <p className="text-slate-600">
            Registreer je om te beginnen
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Selecteer je CRM-platform
            </label>
            <div className="grid grid-cols-3 gap-3">
              {crmOptions.map((crm) => (
                <button
                  key={crm.id}
                  type="button"
                  onClick={() => crm.enabled && setSelectedCRM(crm.id)}
                  disabled={!crm.enabled}
                  className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedCRM === crm.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  } ${
                    !crm.enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {!crm.enabled && (
                    <div className="absolute -top-2 -right-2 bg-slate-600 text-white text-xs px-2 py-0.5 rounded-full">
                      Soon
                    </div>
                  )}
                  <div className={`w-12 h-12 mx-auto mb-2 bg-gradient-to-br ${crm.color} rounded-lg flex items-center justify-center`}>
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-xs font-semibold text-slate-700 text-center">
                    {crm.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-800 font-semibold mb-1">Fout</h4>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                E-mailadres
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="jouw@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                Telefoonnummer
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="+32 123 456 789"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Wachtwoord
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !selectedCRM}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Registreren...
                </div>
              ) : (
                'Registreren'
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            Beveiligde verbinding met Supabase
          </p>
        </div>
      </div>
    </div>
  );
};
