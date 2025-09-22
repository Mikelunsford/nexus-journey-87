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

    // Create profile
    const { error: profileError } = await supabaseServiceRole
      .from('profiles')
      .insert({
        id: userId,
        email,
        name,
        org_id
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Try to clean up the auth user if profile creation fails
      await supabaseServiceRole.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ error: `Failed to create profile: ${profileError.message}` }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('Profile created');

    // Create membership with role
    const { error: membershipError } = await supabaseServiceRole
      .from('memberships')
      .insert({
        user_id: userId,
        org_id,
        department_id,
        role_bucket,
        assigned_by: userId, // For now, self-assigned
        created_by: userId
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