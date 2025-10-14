import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RegisterRequest {
  email: string;
  phoneNumber?: string;
  userType: 'pipedrive' | 'teamleader' | 'odoo';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { email, phoneNumber, userType }: RegisterRequest = await req.json();

    if (!email || !userType) {
      return new Response(
        JSON.stringify({ error: 'Email and userType are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (userType !== 'pipedrive' && userType !== 'teamleader' && userType !== 'odoo') {
      return new Response(
        JSON.stringify({ error: 'userType must be either "pipedrive", "teamleader", or "odoo"' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const tempPassword = crypto.randomUUID();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: tempPassword,
    });

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const tableName = userType === 'pipedrive' 
      ? 'pipedrive_users' 
      : userType === 'teamleader' 
      ? 'teamleader_users' 
      : 'odoo_users';
    
    const { data: userData, error: userError } = await supabase
      .from(tableName)
      .insert({
        id: authData.user.id,
        email: email,
        whatsapp_number: phoneNumber || null,
        whatsapp_status: 'active',
      })
      .select()
      .single();

    if (userError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return new Response(
        JSON.stringify({ error: `Failed to create user profile: ${userError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          userType,
          whatsappNumber: userData.whatsapp_number,
          whatsappStatus: userData.whatsapp_status,
        },
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});