import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QuickActionsGrid, { type QAItem } from '@/components/ui/QuickActionsGrid';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function UsersPage() {
  const quickActions: QAItem[] = [
    {
      label: 'Invite User',
      to: '/dashboard/admin/users/invite',
      caption: 'Send user invitation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      label: 'Manage Roles',
      to: '/dashboard/admin/users/roles',
      caption: 'Configure user roles',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      label: 'User Reports',
      to: '/dashboard/admin/users/reports',
      caption: 'View user analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Deactivate Users',
      to: '/dashboard/admin/users/deactivate',
      caption: 'Manage inactive users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L12 12m6.364 6.364L12 12m0 0L5.636 5.636M12 12l6.364-6.364M12 12l-6.364 6.364" />
        </svg>
      ),
    },
  ];

  const users = [
    { 
      id: 'USR-001', 
      name: 'John Smith', 
      email: 'john.smith@company.com', 
      role: 'Admin', 
      status: 'Active', 
      lastLogin: '2024-01-15 10:30',
      avatar: ''
    },
    { 
      id: 'USR-002', 
      name: 'Sarah Johnson', 
      email: 'sarah.johnson@company.com', 
      role: 'Manager', 
      status: 'Active', 
      lastLogin: '2024-01-14 16:45',
      avatar: ''
    },
    { 
      id: 'USR-003', 
      name: 'Mike Chen', 
      email: 'mike.chen@company.com', 
      role: 'User', 
      status: 'Inactive', 
      lastLogin: '2024-01-10 09:15',
      avatar: ''
    },
  ];

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Active': return 'default';
      case 'Inactive': return 'outline';
      case 'Suspended': return 'destructive';
      default: return 'outline';
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'Admin': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Manager': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'User': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="t-primary text-2xl md:text-3xl font-semibold">Users</h1>
        <p className="t-dim mt-1">
          Manage user accounts, roles, and permissions for your organization.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="panel p-5">
        <h2 className="t-primary text-xl font-semibold mb-4">Quick Actions</h2>
        <QuickActionsGrid items={quickActions} />
      </div>

      {/* User KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="kpi-card">
          <div className="kpi-icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <div>
            <div className="kpi-value">247</div>
            <div className="kpi-label">Total Users</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="kpi-value">218</div>
            <div className="kpi-label">Active Users</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="kpi-value">156</div>
            <div className="kpi-label">Online Now</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div>
            <div className="kpi-value">12</div>
            <div className="kpi-label">Pending Invites</div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">User</th>
                  <th className="text-left p-4 font-semibold">Email</th>
                  <th className="text-left p-4 font-semibold">Role</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Last Login</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={getStatusVariant(user.status)}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">{user.lastLogin}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">View</Button>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}