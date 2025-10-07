import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  platform: 'teamleader' | 'pipedrive' | 'odoo';
  user_info: any;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isCheckingAuthRef = useRef(false);

  const setUserPlatformStorage = (platform: string | null) => {
    if (platform) {
      localStorage.setItem('userPlatform', platform);
      localStorage.setItem('auth_provider', platform);
    } else {
      localStorage.removeItem('userPlatform');
      localStorage.removeItem('auth_provider');
    }
  };

  const checkAuth = useCallback(async () => {
    if (isCheckingAuthRef.current) {
      return;
    }
    isCheckingAuthRef.current = true;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setUser(null);
        setUserPlatformStorage(null);
        return;
      }

      const userId = session.user.id;

      let platform = localStorage.getItem('userPlatform') || localStorage.getItem('auth_provider');

      if (platform && ['teamleader', 'pipedrive', 'odoo'].includes(platform)) {
        const { data: userData } = await supabase
          .from(`${platform}_users`)
          .select('id, user_info')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .single();

        if (userData) {
          setUserPlatformStorage(platform);

          const userName = getUserName(platform as AuthUser['platform'], userData.user_info);
          setUser({
            id: userId,
            email: session.user.email || '',
            name: userName,
            platform: platform as AuthUser['platform'],
            user_info: userData,
          });

          setLoading(false);
          return;
        }
      }

      const platforms: AuthUser['platform'][] = ['teamleader', 'pipedrive', 'odoo'];

      for (const platformName of platforms) {
        const { data: userData } = await supabase
          .from(`${platformName}_users`)
          .select('id, user_info')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .single();

        if (userData) {
          setUserPlatformStorage(platformName);

          const userName = getUserName(platformName, userData.user_info);
          setUser({
            id: userId,
            email: session.user.email || '',
            name: userName,
            platform: platformName,
            user_info: userData.user_info,
          });

          setLoading(false);
          return;
        }
      }

      setUser(null);
      setUserPlatformStorage(null);
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setUserPlatformStorage(null);
    } finally {
      setLoading(false);
      isCheckingAuthRef.current = false;
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          checkAuth();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [checkAuth]);



  const getUserName = (platform: AuthUser['platform'], userInfo: any) => {
    console.log(userInfo);
    switch (platform) {
      case 'teamleader':
        return userInfo?.first_name && userInfo?.last_name
          ? `${userInfo.first_name} ${userInfo.last_name}`
          : userInfo?.email || 'TeamLeader User';
      case 'pipedrive':
        return userInfo?.name || userInfo?.email || 'Pipedrive User';
      case 'odoo':
        return userInfo?.name || 'Odoo User';
      default:
        return 'User';
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();

      localStorage.removeItem('userPlatform');
      localStorage.removeItem('auth_provider');
      localStorage.removeItem('teamleader_oauth_state');
      localStorage.removeItem('pipedrive_oauth_state');
      localStorage.removeItem('odoo_oauth_state');

      setUser(null);
      setUserPlatformStorage(null);

      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      localStorage.clear();
      setUser(null);
      setUserPlatformStorage(null);
      window.location.href = '/';
    }
  };

  return { user, loading, signOut };
};
