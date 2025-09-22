import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  
  // View preferences
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
  
  // Toast notifications
  toasts: Array<{
    id: string;
    title: string;
    description?: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>;
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUI = create<UIState>((set, get) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  viewMode: 'list',
  setViewMode: (mode) => set({ viewMode: mode }),
  
  toasts: [],
  addToast: (toast) => {
    const id = Date.now().toString();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 3000);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));