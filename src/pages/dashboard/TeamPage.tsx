import React, { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Users, Mail, Phone, Filter, TestTube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type RoleBucket } from '@/lib/rbac/roleBuckets';

export default function TeamPage() {
  const { users, loading } = useUsers();
  const { profile } = useAuth();
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Filter users based on role and user's permissions
  const filteredUsers = users.filter(user => {
    // External users should only see themselves
    if (profile?.role_bucket === 'external') {
      return user.id === profile.id;
    }
    
    // Role filtering
    if (roleFilter === 'all') return true;
    return user.role_bucket === roleFilter;
  });

  const getRoleColor = (role: RoleBucket) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'management': return 'default';
      case 'operational': return 'secondary';
      case 'external': return 'outline';
      default: return 'secondary';
    }
  };

  const getRoleLabel = (role: RoleBucket) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const generateTestInvite = () => {
    // Mock test invite functionality
    console.log('Generating test invite...');
    // This would typically call the test data generation
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Team</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={generateTestInvite}>
              <TestTube className="h-4 w-4 mr-2" />
              Test Invite
            </Button>
            <Button asChild>
              <Link to="/dashboard/team/invite">
                <Plus className="h-4 w-4 mr-2" />
                Invite User
              </Link>
            </Button>
          </div>
        </div>
        <div className="text-center py-8">Loading team members...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-muted-foreground">
            Manage your team members and collaborators
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={generateTestInvite}>
            <TestTube className="h-4 w-4 mr-2" />
            Test Invite
          </Button>
          {profile?.role_bucket !== 'external' && (
            <Button asChild>
              <Link to="/dashboard/team/invite">
                <Plus className="h-4 w-4 mr-2" />
                Invite User
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Filters - Only show for non-external users */}
      {profile?.role_bucket !== 'external' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {['all', 'admin', 'management', 'operational', 'external'].map(role => (
                <Button
                  key={role}
                  variant={roleFilter === role ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setRoleFilter(role)}
                >
                  {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members Grid */}
      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <Users className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">No team members found</p>
                <p className="text-muted-foreground">
                  {roleFilter === 'all' 
                    ? "Invite your first team member to get started"
                    : `No team members with role "${roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}"`
                  }
                </p>
              </div>
              {profile?.role_bucket !== 'external' && (
                <div className="flex justify-center gap-2">
                  <Button variant="outline" onClick={generateTestInvite}>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Invite
                  </Button>
                  <Button asChild>
                    <Link to="/dashboard/team/invite">
                      <Plus className="h-4 w-4 mr-2" />
                      Invite User
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map(user => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user.avatar_url} alt={user.name} />
                    <AvatarFallback>
                      {user.name?.split(' ').map(n => n[0]).join('') || user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-lg">{user.name || 'Unnamed User'}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleColor(user.role_bucket as RoleBucket)}>
                        {getRoleLabel(user.role_bucket as RoleBucket)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}