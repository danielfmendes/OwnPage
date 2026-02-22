import { create } from "zustand";
import { type FilterItem } from "@/components/helpers/FilterBar";

interface FilterState {
    loadedItems: Record<string, Record<string, FilterItem[]>>; // context -> key -> items[]
    setLoadedItems: (context: string, key: string, items: FilterItem[]) => void;
    getLoadedItems: (context: string, key: string) => FilterItem[] | undefined;
    clearLoadedItems: (context: string) => void;
}

export const useFilterStore = create<FilterState>((set, get) => ({
    loadedItems: {},
    setLoadedItems: (context, key, items) =>
        set((state) => ({
            loadedItems: {
                ...state.loadedItems,
                [context]: {
                    ...(state.loadedItems[context] || {}),
                    [key]: items,
                },
            },
        })),
    getLoadedItems: (context, key) =>
        get().loadedItems[context]?.[key],
    clearLoadedItems: (context) =>
        set((state) => {
            const updated = { ...state.loadedItems };
            delete updated[context];
            return { loadedItems: updated };
        }),
}));
