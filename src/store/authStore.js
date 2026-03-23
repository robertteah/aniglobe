import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      auth: null,
      isRefreshing: true,
      setAuth: (state) => set({ auth: state }),
      clearAuth: () => set({ auth: null }),
      setIsRefreshing: (val) => set({ isRefreshing: val }),
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ auth: state.auth }),
      version: 0,
    }
  )
);
