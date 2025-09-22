import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/state/useAuth';
import { getDefaultRoute } from '@/lib/rbac';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { PathCard } from '@/components/ui/PathCard';
import team1Logo from '@/assets/team1-logo.png';
import type { Role } from '@/lib/types';

const roleTiles: Array<{ role: Role; title: string; description: string }> = [
  { role: 'admin', title: 'Admin Portal', description: 'Full system administration access' },
  { role: 'manager', title: 'Manager Dashboard', description: 'Management and oversight tools' },
  { role: 'developer', title: 'Developer Console', description: 'Development and technical tools' },
  { role: 'internal', title: 'Internal Hub', description: 'Internal team collaboration' },
  { role: 'employee', title: 'Employee Portal', description: 'General employee access' },
  { role: 'production', title: 'Production Floor', description: 'Manufacturing and production' },
  { role: 'shipping_receiving', title: 'Shipping & Receiving', description: 'Logistics and fulfillment' },
  { role: 'customer', title: 'Customer Portal', description: 'Customer project access' },
];

export default function AuthPage() {
  const { isAuthenticated, login, loginWithRole } = useAuth();
  const [email, setEmail] = useState('admin@team1arkansashub.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRoles, setShowRoles] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleLogin = async (role: Role) => {
    setLoading(true);
    try {
      await loginWithRole(role);
      // Navigation will happen automatically via redirect
    } catch (error) {
      console.error('Role login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-navy2 to-brand-navy relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <img 
              src={team1Logo} 
              alt="Team1 Logo" 
              className="h-16 mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-white mb-2">Internal Dashboard</h1>
            <p className="text-brand-paper/80">Team1 Arkansas Hub - Admin Portal</p>
          </div>

          {/* Glass Card */}
          <div className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-glass border border-white/20">
            {!showRoles ? (
              <>
                <h2 className="text-2xl font-semibold text-white mb-6 text-center">Admin Login</h2>
                <p className="text-brand-paper/80 text-center mb-6">
                  Access your internal management console
                </p>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                      placeholder="admin@team1arkansashub.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    loading={loading}
                    variant="primary"
                    size="lg"
                  >
                    Access Dashboard
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="text-center text-brand-paper/80 text-sm mb-4">
                    Need an account? Sign up
                  </p>
                  
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => setShowRoles(true)}
                      className="text-white hover:bg-white/10"
                    >
                      Developer Access Tiles
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-white">Select Role</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowRoles(false)}
                    className="text-white hover:bg-white/10"
                  >
                    ← Back
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                  {roleTiles.map(({ role, title, description }) => (
                    <button
                      key={role}
                      onClick={() => handleRoleLogin(role)}
                      disabled={loading}
                      className="p-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-left transition-all duration-200 hover:scale-105 disabled:opacity-50"
                    >
                      <h3 className="text-white font-medium">{title}</h3>
                      <p className="text-brand-paper/80 text-sm mt-1">{description}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="text-center mt-6">
            <p className="text-brand-paper/60 text-sm">
              Team1 Arkansas Hub © 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}