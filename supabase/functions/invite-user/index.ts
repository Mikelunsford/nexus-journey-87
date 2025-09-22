import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteUserRequest {
  email: string;
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

    const supabase = createClient(
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
    const { data: { user: currentUser }, error: currentUserError } = await supabase.auth.getUser();
    if (currentUserError || !currentUser) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { email, name, role_bucket, org_id, department_id }: InviteUserRequest = await req.json();

    console.log('Inviting user:', { email, name, role_bucket, org_id });

    // Validate required fields
    if (!email || !name || !role_bucket || !org_id) {
      return new Response(
        JSON.stringify({ error: 'Email, name, role_bucket, and org_id are required' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate secure invitation token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    // Check if user already has a pending invitation
    const { data: existingInvitation } = await supabase
      .from('user_invitations')
      .select('id, status')
      .eq('email', email)
      .eq('org_id', org_id)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingInvitation) {
      return new Response(
        JSON.stringify({ error: 'User already has a pending invitation' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create invitation record
    const { data: invitation, error: invitationError } = await supabase
      .from('user_invitations')
      .insert({
        email,
        name,
        role_bucket,
        org_id,
        department_id,
        token,
        expires_at: expiresAt.toISOString(),
        invited_by: currentUser.id,
        status: 'pending'
      })
      .select()
      .single();

    if (invitationError) {
      console.error('Invitation creation error:', invitationError);
      return new Response(
        JSON.stringify({ error: `Failed to create invitation: ${invitationError.message}` }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('Invitation created:', invitation.id);

    // Generate invitation URL
    const invitationUrl = `${req.headers.get('origin')}/auth/accept-invitation?token=${token}`;

    // Send invitation email
    console.log('Attempting to send email to:', email);
    const emailResponse = await resend.emails.send({
      from: "Team1 <noreply@resend.dev>",
      to: [email],
      subject: "You're invited to join Team1!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">You're Invited!</h1>
          <p>Hi ${name},</p>
          <p>You've been invited to join our organization with the role of <strong>${role_bucket}</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p>This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">Best regards,<br>The Team1 Team</p>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error('Email sending error:', emailResponse.error);
      console.error('Full Resend response:', emailResponse);
      // Don't fail the invitation if email fails, but log detailed error
      console.warn('Invitation created successfully but email failed to send');
    } else {
      console.log('Email sent successfully:', emailResponse);
      console.log('Email ID:', emailResponse.data?.id);
    }

    console.log('Invitation process completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitation_id: invitation.id,
        message: 'Invitation sent successfully',
        email_sent: !emailResponse.error
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in invite-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);