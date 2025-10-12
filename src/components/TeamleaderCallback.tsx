import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface CallbackProps {
  onAuthSuccess?: () => void;
  onAuthError?: (error: string) => void;
}

export const TeamleaderCallback: React.FC<CallbackProps> = ({
  onAuthSuccess,
  onAuthError
}) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        const storedState = localStorage.getItem('teamleader_oauth_state');
        if (!storedState || storedState !== state) {
          throw new Error('Invalid state parameter');
        }

        const redirectUri = 'https://voicelink.me/auth/teamleader/callback';

        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/teamleader-auth`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            code,
            redirect_uri: redirectUri,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Authentication failed');
        }

        if (result.session) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token,
          });

          if (sessionError) {
            throw new Error(`Session error: ${sessionError.message}`);
          }
        }

        localStorage.removeItem('teamleader_oauth_state');
        localStorage.setItem('userPlatform', 'teamleader');
        localStorage.setItem('auth_provider', 'teamleader');

        setStatus('success');
        onAuthSuccess?.();

        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
        setStatus('error');
        onAuthError?.(errorMessage);

        localStorage.removeItem('teamleader_oauth_state');
        localStorage.removeItem('userPlatform');
        localStorage.removeItem('auth_provider');
      }
    };

    handleCallback();
  }, [navigate, onAuthSuccess, onAuthError]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            Verbinden met Teamleader...
          </h2>
          <p className="text-slate-600">
            Even geduld, we verwerken je authenticatie.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            Authenticatie mislukt
          </h2>
          <p className="text-slate-600 mb-6">
            {error || 'Er is een fout opgetreden tijdens het verbinden met Teamleader.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Terug naar startpagina
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">
          Succesvol verbonden!
        </h2>
        <p className="text-slate-600 mb-6">
          Je bent succesvol verbonden met Teamleader. Je wordt doorgestuurd naar je dashboard.
        </p>
        <div className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  );
};
