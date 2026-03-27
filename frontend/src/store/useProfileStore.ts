/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
}

interface ProfileStore {
  user: User | null;
  isLoading: boolean;
  currentScan: any | null;
  scanHistory: any[];
  isScanning: boolean;
  scanProgress: string;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setCurrentScan: (scan: any | null) => void;
  setScanHistory: (scans: any[]) => void;
  setScanning: (isScanning: boolean) => void;
  setScanProgress: (step: string) => void;
  clearStore: () => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  user: null,
  isLoading: true,
  currentScan: null,
  scanHistory: [],
  isScanning: false,
  scanProgress: '',

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setCurrentScan: (currentScan) => set({ currentScan }),
  setScanHistory: (scanHistory) => set({ scanHistory }),
  setScanning: (isScanning) => set({ isScanning }),
  setScanProgress: (scanProgress) => set({ scanProgress }),
  clearStore: () => set({ user: null, isLoading: false, currentScan: null, scanHistory: [], isScanning: false, scanProgress: '' }),
}));
