import { useAuth } from '../hooks/useAuth';
import { LogOut, User, Building2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            Laden...
          </h2>
          <p className="text-slate-600">
            Je gegevens worden geladen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-slate-800">
                  Voicelink Dashboard
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">
                  {user.name}
                </span>
              </div>
              <button
                onClick={signOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Uitloggen
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-slate-900 mb-4">
                Welkom bij Voicelink!
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Info Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-slate-900">
                        Gebruikersinformatie
                      </h3>
                      <p className="text-sm text-slate-600">
                        Je bent succesvol verbonden met {user.platform}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-slate-500">
                          Naam
                        </dt>
                        <dd className="mt-1 text-sm text-slate-900">
                          {user.name}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-slate-500">
                          E-mail
                        </dt>
                        <dd className="mt-1 text-sm text-slate-900">
                          {user.email}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-slate-500">
                          Platform
                        </dt>
                        <dd className="mt-1 text-sm text-slate-900 capitalize">
                          {user.platform}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Platform Info Card */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Building2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-slate-900">
                        CRM Verbinding
                      </h3>
                      <p className="text-sm text-slate-600">
                        Je CRM-platform is actief
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          Verbonden met {user.platform}
                        </p>
                        <p className="text-xs text-green-600">
                          Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="mt-8 bg-slate-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4">
                  Volgende stappen
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">1</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-slate-700">
                        Je CRM-platform is succesvol verbonden
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-slate-500">2</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-slate-500">
                        Configureer je Voicelink instellingen
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-slate-500">3</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-slate-500">
                        Start met het gebruik van Voicelink
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
