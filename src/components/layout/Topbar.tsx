import React from 'react';
import { useAuth } from '@/state/useAuth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Role } from '@/lib/types';

const roles: Role[] = ['admin', 'manager', 'developer', 'internal', 'employee', 'production', 'shipping_receiving', 'customer'];

export function Topbar() {
  const { user, logout, switchRole } = useAuth();

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-surface-dark-1 border-b border-surface-2 dark:border-surface-dark-2">
      <div className="flex items-center space-x-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold text-brand-ink dark:text-brand-paper">
          Team1 Nexus
        </h1>
      </div>

      <div className="flex items-center space-x-3">
        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-brand-red rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-brand-ink dark:text-brand-paper">
                  {user?.name || 'User'}
                </div>
                <div className="text-xs text-brand-gray capitalize">
                  {user?.role?.replace('_', ' ')}
                </div>
              </div>
              <svg className="w-4 h-4 text-brand-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-brand-gray">{user?.email}</p>
            </div>
            
            <DropdownMenuSeparator />
            
            <div className="px-2 py-1">
              <p className="text-xs text-brand-gray mb-1">Switch Role:</p>
              <div className="grid grid-cols-2 gap-1">
                {roles.map((role) => (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => switchRole(role)}
                    className={`text-xs cursor-pointer ${
                      user?.role === role ? 'bg-brand-blue/10 text-brand-blue' : ''
                    }`}
                  >
                    {role.replace('_', ' ')}
                  </DropdownMenuItem>
                ))}
              </div>
            </div>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={logout}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}