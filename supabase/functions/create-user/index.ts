import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role_bucket: 'admin' | 'management' | 'operational' | 'external';
  org_id: string;
  department_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the current user from auth headers
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Also create a client with the user's token to get their info
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Get current user info
    const { data: { user: currentUser }, error: currentUserError } = await supabaseUser.auth.getUser();
    if (currentUserError || !currentUser) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { email, password, name, role_bucket, org_id, department_id }: CreateUserRequest = await req.json();

    console.log('Creating user:', { email, name, role_bucket, org_id });

    // Validate required fields
    if (!email || !password || !name || !role_bucket || !org_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, name, role_bucket, org_id' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabaseServiceRole.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true // Auto-confirm email for manually created users
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return new Response(
        JSON.stringify({ error: `Failed to create user: ${authError.message}` }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const userId = authData.user?.id;
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User created but no ID returned' }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('User created in auth:', userId);

    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify profile was created by trigger
    const { data: profile, error: profileCheckError } = await supabaseServiceRole
      .from('profiles')
      .select('id, org_id')
      .eq('id', userId)
      .single();

    if (profileCheckError || !profile) {
      console.error('Profile not found after creation:', profileCheckError);
      await supabaseServiceRole.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ error: 'Profile creation failed via trigger' }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('Profile verified:', profile);

    // Create membership with role
    const { error: membershipError } = await supabaseServiceRole
      .from('memberships')
      .insert({
        user_id: userId,
        org_id,
        department_id,
        role_bucket,
        assigned_by: currentUser.id, // Current admin user assigning the role
        created_by: currentUser.id   // Current admin user creating the membership
      });

    if (membershipError) {
      console.error('Membership creation error:', membershipError);
      // Clean up on failure
      await supabaseServiceRole.from('profiles').delete().eq('id', userId);
      await supabaseServiceRole.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ error: `Failed to create membership: ${membershipError.message}` }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('Membership created');

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: userId,
          email,
          name,
          role_bucket
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in create-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);