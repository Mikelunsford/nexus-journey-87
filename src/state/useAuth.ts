import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role, User } from '@/lib/types';
import { getDefaultRoute } from '@/lib/rbac';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithRole: (role: Role) => Promise<void>;
  logout: () => void;
  switchRole: (role: Role) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Mock authentication
        const mockUser: User = {
          id: 'user_' + Date.now(),
          email,
          role: 'customer',
          name: email.split('@')[0],
        };

        set({ user: mockUser, isAuthenticated: true });
      },

      loginWithRole: async (role: Role) => {
        const mockUser: User = {
          id: 'user_' + Date.now(),
          email: `${role}@team1arkansashub.com`,
          role,
          name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
        };

        set({ user: mockUser, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      switchRole: (role: Role) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              role,
              email: `${role}@team1arkansashub.com`,
              name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
            },
          });
        }
      },
    }),
    {
      name: 'tnx-auth',
    }
  )
);