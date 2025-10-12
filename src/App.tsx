import { Building2, Zap, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthService } from './services/auth.service';
import { PipedriveCallback } from './components/PipedriveCallback';
import { TeamleaderCallback } from './components/TeamleaderCallback';
import { Dashboard } from './components/Dashboard';

type CRMProvider = 'pipedrive' | 'odoo' | 'teamleader';

function App() {
  const [selectedCRM, setSelectedCRM] = useState<CRMProvider | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crmOptions = [
    {
      id: 'pipedrive' as CRMProvider,
      name: 'Pipedrive',
      description: 'Powerful sales CRM',
      color: 'from-emerald-500 to-teal-600',
      hoverColor: 'hover:from-emerald-600 hover:to-teal-700',
      enabled: true,
    },
    {
      id: 'odoo' as CRMProvider,
      name: 'Odoo',
      description: 'Complete business suite',
      color: 'from-purple-500 to-pink-600',
      hoverColor: 'hover:from-purple-600 hover:to-pink-700',
      enabled: false,
    },
    {
      id: 'teamleader' as CRMProvider,
      name: 'Teamleader',
      description: 'All-in-one work management',
      color: 'from-blue-500 to-indigo-600',
      hoverColor: 'hover:from-blue-600 hover:to-indigo-700',
      enabled: true,
    },
  ];

  const handleCRMSelect = async (crm: CRMProvider) => {
    if (!crmOptions.find(option => option.id === crm)?.enabled) {
      return;
    }

    setSelectedCRM(crm);
    setIsLoading(true);
    setError(null);

    try {
      let authService;

      switch (crm) {
        case 'pipedrive':
          authService = AuthService.createPipedriveAuth();
          break;
        case 'teamleader':
          authService = AuthService.createTeamleaderAuth();
          break;
        case 'odoo':
          authService = AuthService.createOdooAuth();
          break;
        default:
          throw new Error('Unknown CRM provider');
      }

      const result = await authService.initiateAuth();

      if (!result.success && result.error) {
        setError(result.error);
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    console.log('Authentication successful');
    // Additional success handling can be added here
  };

  const handleAuthError = (error: string) => {
    console.error('Authentication error:', error);
    setError(error);
  };

  return (
    <Routes>
      <Route path="/auth/pipedrive/callback" element={
        <PipedriveCallback
          onAuthSuccess={handleAuthSuccess}
          onAuthError={handleAuthError}
        />
      } />
      <Route path="/auth/teamleader/callback" element={
        <TeamleaderCallback
          onAuthSuccess={handleAuthSuccess}
          onAuthError={handleAuthError}
        />
      } />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/" element={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl">
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-30"></div>
                  <div className="relative bg-white p-4 rounded-2xl shadow-lg">
                    <Zap className="w-10 h-10 text-blue-600" />
                  </div>
                </div>
              </div>
              <h1 className="text-5xl font-bold text-slate-800 mb-4">
                Voicelink, op jouw maat
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Kies je CRM-platform om te beginnen met Voicelink
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-800 font-semibold mb-1">Authenticatie mislukt</h4>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {crmOptions.map((crm, index) => (
                <button
                  key={crm.id}
                  onClick={() => handleCRMSelect(crm.id)}
                  disabled={isLoading || !crm.enabled}
                  className={`group relative bg-white rounded-2xl p-8 shadow-lg transition-all duration-300 ${
                    crm.enabled
                      ? 'hover:shadow-2xl transform hover:-translate-y-2 cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                  } ${
                    isLoading && selectedCRM === crm.id ? 'opacity-75' : ''
                  } ${
                    selectedCRM === crm.id ? 'ring-4 ring-blue-500 ring-offset-2' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'slideUp 0.6s ease-out forwards',
                    opacity: 0,
                  }}
                >
                  {!crm.enabled && (
                    <div className="absolute top-4 right-4 bg-slate-200 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">
                      Binnenkort
                    </div>
                  )}

                  <div className={`absolute inset-0 bg-gradient-to-br ${crm.color} opacity-0 ${crm.enabled ? 'group-hover:opacity-10' : ''} rounded-2xl transition-opacity duration-300`}></div>

                  <div className="relative z-10">
                    <div className={`w-16 h-16 bg-gradient-to-br ${crm.color} rounded-xl flex items-center justify-center mb-6 mx-auto transform ${crm.enabled ? 'group-hover:scale-110' : ''} transition-transform duration-300`}>
                      <Building2 className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                      {crm.name}
                    </h3>
                    <p className="text-slate-600 mb-6">
                      {crm.description}
                    </p>

                    <div className={`inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r ${crm.color} ${crm.enabled ? crm.hoverColor : ''} text-white font-semibold rounded-lg transition-all duration-300 transform ${crm.enabled ? 'group-hover:scale-105' : ''}`}>
                      {isLoading && selectedCRM === crm.id ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Verbinden...
                        </>
                      ) : (
                        'Verbinden'
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-500">
                Veilige authenticatie via OAuth 2.0
              </p>
            </div>
          </div>

          <style>{`
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes fade-in {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }

            .animate-fade-in {
              animation: fade-in 0.8s ease-out;
            }
          `}</style>
        </div>
      } />
    </Routes>
  );
}

export default App;
