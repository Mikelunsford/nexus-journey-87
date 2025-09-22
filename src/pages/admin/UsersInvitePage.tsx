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
import { ArrowLeft, Mail, User, Shield } from 'lucide-react';
import { RoleGate } from '@/app/guards/RoleGate';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface InviteFormData {
  email: string;
  name: string;
  role_bucket: string;
}

export default function UsersInvitePage() {
  const navigate = useNavigate();
  const { inviteUser, invitations, loading, cancelInvitation } = useInvitations();
  const [submitting, setSubmitting] = useState(false);

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
      
      // Check if email was sent successfully
      if (result?.email_sent === false) {
        toast({
          title: "Invitation created",
          description: `Invitation created for ${data.email}, but email delivery failed. Please check your email configuration.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Invitation sent",
          description: `Invitation sent successfully to ${data.email}`,
        });
      }
      
      reset();
    } catch (error: any) {
      console.error('Invitation error:', error);
      toast({
        title: "Failed to send invitation",
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
                <Mail className="h-5 w-5" />
                Send Invitation
              </CardTitle>
              <CardDescription>
                The user will receive an email with instructions to complete their registration
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
                  {submitting ? 'Sending...' : 'Send Invitation'}
                </Button>
              </form>
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
                  {invitations.slice(0, 5).map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
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
                  ))}
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