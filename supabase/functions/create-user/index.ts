import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role_bucket: 'admin' | 'management' | 'operational' | 'external';
  department_id?: string;
  user_type: 'employee' | 'customer';
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify the caller is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !caller) {
      throw new Error('Unauthorized');
    }

    // Check if caller is admin
    const { data: membership } = await supabaseAdmin
      .from('memberships')
      .select('role_bucket, org_id')
      .eq('user_id', caller.id)
      .is('deleted_at', null)
      .single();

    if (!membership || membership.role_bucket !== 'admin') {
      throw new Error('Only admins can create users');
    }

    const requestData: CreateUserRequest = await req.json();
    const { email, password, name, phone, role_bucket, department_id, user_type } = requestData;

    console.log('Creating user:', { email, name, role_bucket, user_type });

    // Create auth user
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        phone,
      }
    });

    if (createError) {
      console.error('Error creating auth user:', createError);
      throw createError;
    }

    if (!authData.user) {
      throw new Error('Failed to create user');
    }

    console.log('Auth user created:', authData.user.id);

    // Create profile (should be auto-created by trigger, but we'll ensure it exists)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email,
        name,
        phone,
        org_id: membership.org_id,
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Don't throw, the trigger might have already created it
    }

    // Create membership with role
    const { error: membershipError } = await supabaseAdmin
      .from('memberships')
      .insert({
        user_id: authData.user.id,
        org_id: membership.org_id,
        role_bucket,
        department_id: department_id || null,
        assigned_by: caller.id,
      });

    if (membershipError) {
      console.error('Error creating membership:', membershipError);
      throw membershipError;
    }

    // If customer, create customer record
    if (user_type === 'customer') {
      const { error: customerError } = await supabaseAdmin
        .from('customers')
        .insert({
          org_id: membership.org_id,
          name,
          email,
          phone,
          owner_id: authData.user.id,
          created_by: caller.id,
        });

      if (customerError) {
        console.error('Error creating customer:', customerError);
        throw customerError;
      }
    }

    // Add user to the General chat room
    const { data: generalRoom } = await supabaseAdmin
      .from('chat_rooms')
      .select('id')
      .eq('org_id', membership.org_id)
      .eq('name', 'General')
      .single();

    if (generalRoom) {
      const { error: memberError } = await supabaseAdmin
        .from('chat_room_members')
        .insert({
          room_id: generalRoom.id,
          user_id: authData.user.id,
          role: 'member',
        });

      if (memberError) {
        console.error('Error adding user to General chat room:', memberError);
        // Don't throw, this is not critical
      }
    }

    console.log('User created successfully');

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in create-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
