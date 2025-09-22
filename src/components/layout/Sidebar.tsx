import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/state/useAuth';
import { canView } from '@/lib/rbac';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

// Navigation items with role-based visibility
const navigationItems = [
  {
    label: 'Main',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: DashboardIcon, roles: ['admin', 'manager', 'developer', 'internal', 'employee', 'production', 'shipping_receiving', 'customer'] },
      { title: 'Projects', url: '/dashboard/projects', icon: ProjectsIcon, roles: ['admin', 'manager', 'developer', 'internal', 'employee'] },
      { title: 'Messages', url: '/dashboard/messages', icon: MessagesIcon, roles: ['admin', 'manager', 'developer', 'internal', 'employee', 'customer'] },
      { title: 'Production', url: '/dashboard/production', icon: ProductionIcon, roles: ['admin', 'manager', 'developer', 'internal', 'production'] },
      { title: 'Shipping', url: '/dashboard/shipping', icon: ShippingIcon, roles: ['admin', 'manager', 'developer', 'internal', 'shipping_receiving'] },
      { title: 'Documents', url: '/dashboard/documents', icon: DocumentsIcon, roles: ['admin', 'manager', 'developer', 'internal', 'employee', 'production', 'shipping_receiving', 'customer'] },
    ],
  },
  {
    label: 'Business',
    items: [
      { 
        title: 'Customers', 
        url: '/dashboard/customers', 
        icon: CustomersIcon, 
        roles: ['admin', 'manager', 'developer', 'internal', 'employee'],
        submenu: [
          { title: 'List', url: '/dashboard/customers', roles: ['admin', 'manager', 'developer', 'internal', 'employee'] },
          { title: 'Add', url: '/dashboard/customers/new', roles: ['admin', 'manager', 'developer', 'internal'] },
          { title: 'Labels', url: '/dashboard/customers/labels', roles: ['admin', 'manager', 'developer', 'internal'] },
        ]
      },
      { title: 'Carriers', url: '/dashboard/carriers', icon: CarriersIcon, roles: ['admin', 'manager', 'developer', 'internal', 'shipping_receiving'] },
      { title: 'Accounting', url: '/dashboard/accounting', icon: AccountingIcon, roles: ['admin', 'manager', 'developer', 'internal'] },
    ],
  },
  {
    label: 'Management',
    items: [
      { title: 'Analytics', url: '/dashboard/analytics', icon: AnalyticsIcon, roles: ['admin', 'manager', 'developer', 'internal'] },
      { 
        title: 'Users', 
        url: '/dashboard/admin/users', 
        icon: UsersIcon, 
        roles: ['admin', 'manager', 'developer', 'internal'],
        submenu: [
          { title: 'List', url: '/dashboard/admin/users', roles: ['admin', 'manager', 'developer', 'internal'] },
          { title: 'Invite', url: '/dashboard/admin/users/invite', roles: ['admin', 'manager', 'developer', 'internal'] },
          { title: 'Labels', url: '/dashboard/admin/users/labels', roles: ['admin', 'manager', 'developer', 'internal'] },
        ]
      },
      { 
        title: 'Organizations', 
        url: '/dashboard/admin/organizations', 
        icon: OrgsIcon, 
        roles: ['admin', 'manager', 'developer', 'internal'],
        submenu: [
          { title: 'List', url: '/dashboard/admin/organizations', roles: ['admin', 'manager', 'developer', 'internal'] },
          { title: 'Labels', url: '/dashboard/admin/organizations/labels', roles: ['admin', 'manager', 'developer', 'internal'] },
        ]
      },
      { title: 'Settings', url: '/dashboard/settings', icon: SettingsIcon, roles: ['admin', 'manager', 'developer', 'internal', 'employee', 'customer'] },
    ],
  },
  {
    label: 'Development',
    items: [
      { title: 'Bridge Panel', url: '/dev/bridge', icon: DevIcon, roles: ['admin', 'manager', 'developer', 'internal'] },
    ],
  },
];

// Simple SVG Icons
function DashboardIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5v4M16 5v4" />
    </svg>
  );
}

function ProjectsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4H5m14 8H5" />
    </svg>
  );
}

function MessagesIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function ProductionIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ShippingIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
    </svg>
  );
}

function DocumentsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function CustomersIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  );
}

function CarriersIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  );
}

function AccountingIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  );
}

function OrgsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function DevIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

export function AppSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const { state: sidebarState } = useSidebar();
  const isCollapsed = sidebarState === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="dark:bg-[#0C1527] dark:border-r dark:border-white/10">
      <SidebarContent>
        {navigationItems.map((section) => {
          const visibleItems = section.items.filter(item => 
            user && item.roles.includes(user.role as any)
          );

          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <NavLink 
                            to={item.url}
                            className={cn(
                              "flex items-center space-x-3",
                              isActive 
                                ? "bg-surface-2 text-text-light dark:bg-white/8 dark:text-text-onDark" 
                                : "text-dim hover:text-text-light dark:hover:text-text-onDark"
                            )}
                          >
                            <item.icon />
                            {!isCollapsed && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}