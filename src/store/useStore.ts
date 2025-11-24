import { create } from 'zustand';
import type { DataItem } from '../types';

interface AppState {
  data: DataItem[];
  loading: boolean;
  error: string | null;
  setData: (data: DataItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addItem: (item: DataItem) => void;
  updateItem: (id: number, item: Partial<DataItem>) => void;
  deleteItem: (id: number) => void;
}

export const useStore = create<AppState>((set) => ({
  data: [],
  loading: false,
  error: null,
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  addItem: (item) => set((state) => ({ data: [...state.data, item] })),
  updateItem: (id, updates) =>
    set((state) => ({
      data: state.data.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),
  deleteItem: (id) =>
    set((state) => ({
      data: state.data.filter((item) => item.id !== id),
    })),
}));
