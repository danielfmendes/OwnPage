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

    getFilters(): Record<string, any[]> {
        const result: Record<string, any[]> = {};
        this.filters.forEach((value, key) => {
            result[key] = value;
        });
        return result;
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

    hasFilter(key: string): boolean {
        return this.filters.has(key);
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

    private buildFilterString(): string {
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

    // Jetzt async, damit wir getProjectIds awaiten können
    async getFilterStringWithProjectIds(): Promise<string> {
        // Projekt-IDs holen
        const projectIds = await this.getProjectIds();

        // Projekt-Filter setzen, falls vorhanden
        if (projectIds.length > 0) {
            this.filters.set("project_id", projectIds);
        }

        return this.buildFilterString();
    }

    async toQueryParams(): Promise<Record<string, string>> {
        const filterString = await this.getFilterStringWithProjectIds();
        if (filterString) {
            return {filter: filterString};
        }
        return {};
    }

    static fromQueryParams(searchParams: URLSearchParams): FilterManager {
        const filterParam = searchParams.get("filter");
        const filters: Record<string, any[]> = {};

        if (filterParam) {
            const parts = filterParam.split(",");
            for (const part of parts) {
                if (part.includes(":$eq.")) {
                    const [key, value] = part.split(":$eq.");
                    if (key && value !== undefined) {
                        filters[key] = [value];
                    }
                } else if (part.includes(":$in.")) {
                    const [key, value] = part.split(":$in.");
                    if (key && value !== undefined) {
                        filters[key] = value.split("|");
                    }
                } else {
                    console.warn(`Unknown filter format: ${part}`);
                }
            }
        }

        return new FilterManager(filters);
    }

    // Method without project IDs (sync)
    getFilterString(): string {
        return this.buildFilterString();
    }
}

export default FilterManager;