import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole, Employee } from '../types';

interface AuthState {
  user: User | null;
  employee: Employee | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
  setEmployee: (employee: Employee) => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const mockUsers: User[] = [
  {
    id: '1',
    email: 'hr@techwarehouse.com',
    password: 'hr1234',
    role: 'hr',
    name: 'HR Manager',
    language: 'th',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    email: 'ceo@techwarehouse.com',
    password: 'ceo1234',
    role: 'ceo',
    name: 'CEO',
    language: 'th',
    createdAt: '2024-01-01',
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      employee: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const user = mockUsers.find(u => u.email === email && u.password === password);
        if (user) {
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ user: null, employee: null, isAuthenticated: false });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setEmployee: (employee: Employee) => {
        set({ employee });
      },

      hasRole: (roles: UserRole[]) => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export const useAuth = useAuthStore;