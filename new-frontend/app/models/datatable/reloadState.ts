import React from "react";
import {create} from "zustand";
import {useRefreshData, type ItemsLoader} from "@/models/datatable/itemsLoader";

type ReloadStore = {
    reloadKeys: Record<string, number>;
    triggerReload: (key: string) => void;
};

function getReloadKeyFromUrl(): string {
    const pathname = window.location.pathname;
    const prefix = "/dwh/";
    if (!pathname.startsWith(prefix)) return "default";

    const afterDwh = pathname.substring(prefix.length);
    const reloadKey = afterDwh.split("/")[0];
    return reloadKey || "default";
}

export const triggerReload = (key?: string) => {
    const reloadKey = key ?? getReloadKeyFromUrl();
    useReloadStore.getState().triggerReload(reloadKey);
};

export function useReloadedData(itemsLoader: ItemsLoader, key: string) {
    const reloadKey = useReloadStore((state) => state.reloadKeys[key]);
    const refreshData = useRefreshData(itemsLoader);

    React.useEffect(() => {
        if (reloadKey) {
            refreshData();
        }
    }, [reloadKey]);
}

export const useReloadStore = create<ReloadStore>((set) => ({
    reloadKeys: {},
    triggerReload: (key: string) =>
        set((state) => ({
            reloadKeys: {
                ...state.reloadKeys,
                [key]: Date.now(),
            },
        })),
}));
