import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AcceptFormData {
  password: string;
  confirmPassword: string;
}

export default function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<AcceptFormData>();

  const password = watch('password');

  useEffect(() => {
    const validateInvitation = async () => {
      if (!token) {
        toast({
          title: "Invalid invitation",
          description: "No invitation token provided",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      try {
        // Check if invitation exists and is valid
        const { data, error } = await supabase
          .from('user_invitations')
          .select('*')
          .eq('token', token)
          .eq('status', 'pending')
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();

        if (error) {
          console.error('Error fetching invitation:', error);
          toast({
            title: "Error validating invitation",
            description: error.message,
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        if (!data) {
          toast({
            title: "Invalid or expired invitation",
            description: "This invitation is no longer valid",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        setInvitation(data);
      } catch (error: any) {
        console.error('Error validating invitation:', error);
        toast({
          title: "Error",
          description: "Failed to validate invitation",
          variant: "destructive",
        });
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    validateInvitation();
  }, [token, navigate]);

  const onSubmit = async (data: AcceptFormData) => {
    if (!invitation) return;

    setSubmitting(true);
    try {
      // Create the user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password: data.password,
        options: {
          data: {
            name: invitation.name
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      // Update the invitation status to accepted
      const { error: invitationUpdateError } = await supabase
        .from('user_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      if (invitationUpdateError) {
        console.error('Error updating invitation status:', invitationUpdateError);
        // Don't fail the process if this fails, just log it
      }

      toast({
        title: "Account created successfully!",
        description: "Welcome to the team! You can now sign in with your credentials.",
      });

      // Redirect to sign in page
      navigate('/auth?message=account-created');
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Failed to create account",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return null; // This shouldn't be reached due to navigation in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">You have been invited to join the Team1 Dashboard!</CardTitle>
          <CardDescription>
            Complete your registration to join as a <strong>{invitation.role_bucket}</strong>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <Alert className="border-primary/20 bg-primary/5">
              <UserPlus className="h-4 w-4 text-primary" />
              <AlertDescription>
                <strong>Welcome {invitation.name}!</strong><br />
                Setting up your account for {invitation.email}
              </AlertDescription>
            </Alert>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a secure password"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    }
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match'
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" disabled={submitting} className="w-full mt-6">
              {submitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth')}>
                Sign in instead
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}