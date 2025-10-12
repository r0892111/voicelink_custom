import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[REQUEST] Incoming request at', new Date().toISOString());

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { code, redirect_uri } = await req.json();

    if (!code) throw new Error('Authorization code is required');

    const tokenResponse = await fetch('https://oauth.pipedrive.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        client_id: Deno.env.get('VITE_PIPEDRIVE_CLIENT_ID') ?? '',
        client_secret: Deno.env.get('VITE_PIPEDRIVE_CLIENT_SECRET') ?? ''
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokens = await tokenResponse.json();

    const userResponse = await fetch(`${tokens.api_domain}/api/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    });

    if (!userResponse.ok) throw new Error('Failed to fetch user info');

    const userInfo = await userResponse.json();
    if (!userInfo.success) throw new Error('Failed to get user data from Pipedrive');

    const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw new Error(`Failed to list users: ${listError.message}`);

    let userId;
    const existingUser = userList.users.find((u) => u.email === userInfo.data.email);

    const passwordSecret = Deno.env.get('PASSWORD_GENERATION_SECRET') || 'default-secret-key';
    const passwordData = `${userInfo.data.id}:${passwordSecret}:finit-platform`;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(passwordData));
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const generatedPassword = `pd_${hashHex.substring(0, 32)}`;

    if (existingUser) {
      userId = existingUser.id;
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: generatedPassword
      });
      if (updateError) throw new Error(`Failed to update user password: ${updateError.message}`);
    } else {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userInfo.data.email,
        password: generatedPassword,
        email_confirm: true,
        user_metadata: {
          name: userInfo.data.name,
          pipedrive_id: userInfo.data.id.toString()
        }
      });

      if (authError) throw new Error(`Failed to create user: ${authError.message}`);
      userId = authData.user.id;
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: userInfo.data.email,
      password: generatedPassword
    });

    if (signInError || !signInData?.session) {
      throw new Error(`Failed to create session: ${signInError?.message || 'No session returned'}`);
    }

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    const { error: upsertError } = await supabase.from('pipedrive_users').upsert(
      {
        user_id: userId,
        pipedrive_id: userInfo.data.id.toString(),
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt.toISOString(),
        api_domain: tokens.api_domain,
        user_info: userInfo.data,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'pipedrive_id' }
    );

    if (upsertError) throw new Error(`Failed to store user data: ${upsertError.message}`);

    return new Response(
      JSON.stringify({
        success: true,
        user: userInfo.data,
        tokens: {
          access_token: tokens.access_token,
          expires_at: expiresAt.toISOString()
        },
        session: {
          access_token: signInData.session.access_token,
          refresh_token: signInData.session.refresh_token
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('[AUTH ERROR]', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
