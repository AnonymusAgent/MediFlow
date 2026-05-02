import { create } from 'zustand';
import { NavModule, User } from '@/types';
import { MOCK_USERS } from '@/constants/mockData';

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  activeModule: NavModule;
  sidebarCollapsed: boolean;
  setCurrentUser: (user: User) => void;
  logout: () => void;
  setActiveModule: (module: NavModule) => void;
  toggleSidebar: () => void;
}

const storedUser = (() => {
  try { const s = localStorage.getItem('mediflow_user'); return s ? JSON.parse(s) : null; } catch { return null; }
})();

export const useAppStore = create<AppState>((set) => ({
  currentUser: storedUser,
  isAuthenticated: !!storedUser,
  activeModule: 'dashboard',
  sidebarCollapsed: false,

  setCurrentUser: (user) => {
    localStorage.setItem('mediflow_user', JSON.stringify(user));
    set({ currentUser: user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('mediflow_user');
    set({ currentUser: null, isAuthenticated: false, activeModule: 'dashboard' });
  },

  setActiveModule: (module) => set({ activeModule: module }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
