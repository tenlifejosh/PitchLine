import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'pitcher' | 'decision_maker' | 'admin'
  phone?: string
  timezone: string
  isVerified: boolean
  subscriptionStatus: 'none' | 'active' | 'cancelled'
  decisionMakerProfile?: {
    id: string
    title: string
    company: string
    industry?: string
    bio?: string
    expertiseAreas: string[]
    yearsExperience?: number
    hourlyRate: number
    avatarUrl?: string
    linkedinUrl?: string
    isActive: boolean
  }
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (updatedUser) => 
        set((state) => ({ 
          user: state.user ? { ...state.user, ...updatedUser } : null 
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
)