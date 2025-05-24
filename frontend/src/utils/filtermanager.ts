import {useRoleStore} from "@/utils/rolemananagemetstate";

class FilterManager {
    private filters: Map<string, any[]>;

    constructor(initialFilters?: Record<string, any[]>) {
        this.filters = new Map();

        if (initialFilters) {
            for (const key in initialFilters) {
                if (Array.isArray(initialFilters[key])) {
                    this.filters.set(key, initialFilters[key]);
                }
            }
        }
    }

    private async getProjectIds(maxWaitMs = 1000, intervalMs = 100): Promise<number[]> {
        const waitForRoles = async (): Promise<void> => {
            const start = Date.now();
            while (useRoleStore.getState().roles.length === 0) {
                if (Date.now() - start > maxWaitMs) return;
                await new Promise((resolve) => setTimeout(resolve, intervalMs));
            }
        };

        await waitForRoles();

        const selectedRoles = useRoleStore.getState().selectedRoles;
        if (selectedRoles.length > 0) {
            return selectedRoles.map((role) => role.project_id);
        }
        return [];
    }

    addFilter(key: string, values: any[]) {
        if (!key || !Array.isArray(values)) {
            throw new Error("Key must be string and values must be array");
        }
        this.filters.set(key, values);
    }

    removeFilter(key: string) {
        this.filters.delete(key);
    }

    // Jetzt async, damit wir getProjectIds awaiten können
    async toString(): Promise<string> {
        // Projekt-IDs holen
        const projectIds = await this.getProjectIds();

        // Projekt-Filter setzen, falls vorhanden
        if (projectIds.length > 0) {
            this.filters.set("project_id", projectIds);
        }

        const parts: string[] = [];
        for (const [key, values] of this.filters.entries()) {
            if (values.length === 0) continue;

            if (values.length === 1) {
                parts.push(`${key}:$eq.${values[0]}`);
            } else {
                parts.push(`${key}:$in.${values.join("|")}`);
            }
        }
        return parts.join(",");
    }
}

export default FilterManager;