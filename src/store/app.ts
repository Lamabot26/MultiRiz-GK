"use client";

import { create } from "zustand";

export type View =
  | "home"
  | "projects"
  | "project"
  | "invest"
  | "dashboard"
  | "agreement"
  | "ppa"
  | "terms"
  | "privacy"
  | "about"
  | "contact"
  | "safety";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  utilityName?: string | null;
  consumerNumber?: string | null;
  state?: string | null;
}

interface AppState {
  view: View;
  selectedProjectId: string | null;
  user: AppUser | null;
  authOpen: boolean;
  authMode: "login" | "register";
  investIntent: { projectId: string; amount?: number } | null;
  userInitLoaded: boolean;
  setView: (v: View) => void;
  openProject: (id: string) => void;
  setUser: (u: AppUser | null) => void;
  setAuthOpen: (open: boolean, mode?: "login" | "register") => void;
  startInvest: (projectId: string, amount?: number) => void;
  clearInvestIntent: () => void;
  loadUser: () => Promise<void>;
}

export const useApp = create<AppState>((set, get) => ({
  view: "home",
  selectedProjectId: null,
  user: null,
  authOpen: false,
  authMode: "login",
  investIntent: null,
  userInitLoaded: false,

  setView: (v) => {
    set({ view: v });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  },

  openProject: (id) => {
    set({ selectedProjectId: id, view: "project" });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  },

  setUser: (u) => set({ user: u }),

  setAuthOpen: (open, mode) =>
    set((s) => ({ authOpen: open, authMode: mode ?? (open ? s.authMode : "login") })),

  startInvest: (projectId, amount) => {
    const user = get().user;
    if (!user) {
      set({ authOpen: true, authMode: "register", investIntent: { projectId, amount } });
      return;
    }
    set({ investIntent: { projectId, amount }, view: "invest" });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  },

  clearInvestIntent: () => set({ investIntent: null }),

  loadUser: async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      set({ user: data.user ?? null, userInitLoaded: true });
    } catch {
      set({ user: null, userInitLoaded: true });
    }
  },
}));
