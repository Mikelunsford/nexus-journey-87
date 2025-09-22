import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Calendar, Shield, Clock } from 'lucide-react';
import { User as UserType } from '@/hooks/useUsers';

interface UserDetailModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailModal({ user, isOpen, onClose }: UserDetailModalProps) {
  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    const roleColors = {
      admin: 'bg-red-500/10 text-red-700 dark:text-red-300',
      management: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
      operational: 'bg-green-500/10 text-green-700 dark:text-green-300',
      external: 'bg-gray-500/10 text-gray-700 dark:text-gray-300'
    };
    return roleColors[role as keyof typeof roleColors] || roleColors.external;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Header */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="text-lg">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold truncate">{user.name}</h3>
              <p className="text-muted-foreground truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getRoleColor(user.role_bucket)}>
                  <Shield className="w-3 h-3 mr-1" />
                  {user.role_bucket}
                </Badge>
              </div>
            </div>
          </div>

          {/* User Information Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">User ID</span>
                  <span className="text-sm font-mono">{user.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Role</span>
                  <span className="text-sm capitalize">{user.role_bucket}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm">{formatDate(user.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Login</span>
                  <span className="text-sm">
                    {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Permissions & Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">Role Permissions</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.role_bucket === 'admin' && (
                      <>
                        <Badge variant="outline" className="text-xs">User Management</Badge>
                        <Badge variant="outline" className="text-xs">System Settings</Badge>
                        <Badge variant="outline" className="text-xs">Full Access</Badge>
                      </>
                    )}
                    {user.role_bucket === 'management' && (
                      <>
                        <Badge variant="outline" className="text-xs">Team Management</Badge>
                        <Badge variant="outline" className="text-xs">Reports</Badge>
                        <Badge variant="outline" className="text-xs">Analytics</Badge>
                      </>
                    )}
                    {user.role_bucket === 'operational' && (
                      <>
                        <Badge variant="outline" className="text-xs">Operations</Badge>
                        <Badge variant="outline" className="text-xs">Task Management</Badge>
                      </>
                    )}
                    {user.role_bucket === 'external' && (
                      <Badge variant="outline" className="text-xs">Limited Access</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}