import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useInvitations } from '@/hooks/useInvitations';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link2, User, Shield, Copy, Check } from 'lucide-react';
import { RoleGate } from '@/app/guards/RoleGate';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InviteFormData {
  email: string;
  name: string;
  role_bucket: string;
}

export default function UsersInvitePage() {
  const navigate = useNavigate();
  const { inviteUser, invitations, loading, cancelInvitation } = useInvitations();
  const [submitting, setSubmitting] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<InviteFormData>();

  const onSubmit = async (data: InviteFormData) => {
    setSubmitting(true);
    try {
      const result = await inviteUser(data);
      
      if (result?.invitation_url) {
        setGeneratedUrl(result.invitation_url);
        toast({
          title: "Invitation created!",
          description: `Invitation URL generated for ${data.email}. Share the link below to complete their registration.`,
        });
      } else {
        toast({
          title: "Invitation created",
          description: `Invitation created for ${data.email}`,
        });
      }
      
      reset();
    } catch (error: any) {
      console.error('Invitation error:', error);
      toast({
        title: "Failed to create invitation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await cancelInvitation(invitationId);
      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled",
      });
    } catch (error: any) {
      toast({
        title: "Failed to cancel invitation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'accepted': return 'outline';
      case 'cancelled': return 'secondary';
      case 'expired': return 'destructive';
      default: return 'default';
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
      toast({
        title: "Copied!",
        description: "Invitation URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  const generateInvitationUrl = (token: string) => {
    return `${window.location.origin}/auth/accept-invitation?token=${token}`;
  };

  return (
    <RoleGate>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard/admin/users')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invite User</h1>
            <p className="text-muted-foreground">
              Send an invitation to join your organization
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Create Invitation
              </CardTitle>
              <CardDescription>
                Generate an invitation URL that you can share with the user to complete their registration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@company.com"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select onValueChange={(value) => setValue('role_bucket', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="external">External</SelectItem>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role_bucket && (
                    <p className="text-sm text-destructive">Role is required</p>
                  )}
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Creating...' : 'Create Invitation'}
                </Button>
              </form>

              {generatedUrl && (
                <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                  <Label className="text-sm font-medium">Invitation URL</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      value={generatedUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(generatedUrl, 'generated')}
                    >
                      {copiedStates['generated'] ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Alert className="mt-3">
                    <AlertDescription className="text-sm">
                      Share this URL with the user via your preferred communication method (email, Slack, Teams, etc.)
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Pending Invitations
              </CardTitle>
              <CardDescription>
                View and manage pending invitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : invitations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No pending invitations</p>
              ) : (
                <div className="space-y-2">
                  {invitations.slice(0, 5).map((invitation) => {
                    const invitationUrl = generateInvitationUrl(invitation.token || '');
                    const copyId = `invitation-${invitation.id}`;
                    
                    return (
                      <div key={invitation.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{invitation.name}</p>
                              <Badge variant={getStatusVariant(invitation.status)}>
                                {invitation.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{invitation.email}</p>
                            <p className="text-xs text-muted-foreground">Role: {invitation.role_bucket}</p>
                          </div>
                          {invitation.status === 'pending' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCancelInvitation(invitation.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                        {invitation.status === 'pending' && invitation.token && (
                          <div className="flex items-center gap-2">
                            <Input
                              value={invitationUrl}
                              readOnly
                              className="font-mono text-xs"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => copyToClipboard(invitationUrl, copyId)}
                            >
                              {copiedStates[copyId] ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {invitations.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      And {invitations.length - 5} more...
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGate>
  );
}