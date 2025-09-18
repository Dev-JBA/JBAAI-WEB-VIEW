import { create } from "zustand";
import type { CustomerInfo } from "../services/auth.service";

type AuthState = {
  loginToken: string | null;
  verified: boolean;
  customer: CustomerInfo | null;
  setLoginToken: (t: string | null) => void;
  setVerified: (v: boolean) => void;
  setCustomer: (c: CustomerInfo | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  loginToken: null,
  verified: false,
  customer: null,
  setLoginToken: (t) => set({ loginToken: t }),
  setVerified: (v) => set({ verified: v }),
  setCustomer: (c) => set({ customer: c }),
}));
