import { create } from 'zustand';
import { NavModule, User } from '@/types';
import { MOCK_USERS } from '@/constants/mockData';

interface AppState {
  currentUser: User;
  activeModule: NavModule;
  sidebarCollapsed: boolean;
  setCurrentUser: (user: User) => void;
  setActiveModule: (module: NavModule) => void;
  toggleSidebar: () => void;
}

const storedUser = localStorage.getItem('mediflow_user');
const defaultUser = storedUser ? JSON.parse(storedUser) : MOCK_USERS[3]; // Admin by default

export const useAppStore = create<AppState>((set) => ({
  currentUser: defaultUser,
  activeModule: 'dashboard',
  sidebarCollapsed: false,

  setCurrentUser: (user) => {
    localStorage.setItem('mediflow_user', JSON.stringify(user));
    set({ currentUser: user });
  },

  setActiveModule: (module) => set({ activeModule: module }),

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
