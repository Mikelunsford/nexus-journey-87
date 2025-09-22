import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Topbar() {
  const { user, profile, signOut, effectiveRole } = useAuth();
  const [brandV1Enabled] = useFeatureFlag('ui.brand_v1');

  return (
    <header className="header-surface sticky top-0 z-40 h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <SidebarTrigger className="text-text-light dark:text-text-onDark/90 hover:text-text-light dark:hover:text-white" />
        <h1 className="text-text-light dark:text-text-onDark text-[20px] font-semibold tracking-tight">
          Team1 Nexus
        </h1>
      </div>

      <div className="flex items-center space-x-3">
        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 text-text-light dark:text-text-onDark/90 hover:text-text-light dark:hover:text-white">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${brandV1Enabled ? 'bg-t1-red' : 'bg-brand-red'}`}>
                {profile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-text-light dark:text-text-onDark">
                  {profile?.name || 'User'}
                </div>
                <div className="text-xs text-dim capitalize">
                  {effectiveRole?.replace('_', ' ')}
                </div>
              </div>
              <svg className="w-4 h-4 text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{profile?.name}</p>
              <p className="text-xs text-brand-gray">{user?.email}</p>
            </div>
            
            <DropdownMenuSeparator />
            
            <div className="px-2 py-1">
              <p className="text-xs text-brand-gray mb-1">Current Role:</p>
              <p className="text-sm font-medium capitalize">{effectiveRole?.replace('_', ' ')}</p>
            </div>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={signOut}>
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