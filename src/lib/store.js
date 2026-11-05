import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useEmergencyStore = create((set) => ({
  currentEmergency: null,
  emergencies: [],
  selectedHospital: null,
  assignedAmbulance: null,
  activeEmergency: null,
  
  setCurrentEmergency: (emergency) => set({ currentEmergency: emergency }),
  addEmergency: (emergency) =>
    set((state) => ({ emergencies: [...state.emergencies, emergency] })),
  updateEmergency: (id, updates) =>
    set((state) => ({
      emergencies: state.emergencies.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    })),
  setSelectedHospital: (hospital) => set({ selectedHospital: hospital }),
  setAssignedAmbulance: (ambulance) => set({ assignedAmbulance: ambulance }),
  setActiveEmergency: (emergency) => set({ activeEmergency: emergency }),
  updateEmergencyStatus: (status) =>
    set((state) => ({
      activeEmergency: state.activeEmergency
        ? { ...state.activeEmergency, status }
        : null,
    })),
  clearEmergency: () =>
    set({
      currentEmergency: null,
      selectedHospital: null,
      assignedAmbulance: null,
      activeEmergency: null,
    }),
}))

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      role: null,
      token: null,
      
      setUser: (user) => set({ user, isAuthenticated: !!user, role: user?.role }),
      login: (user, token) => set({ user, isAuthenticated: true, role: user?.role, token }),
      logout: () => set({ user: null, isAuthenticated: false, role: null, token: null }),
    }),
    {
      name: "auth-storage",
    }
  )
)

export const useAuthStore = useUserStore

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}))