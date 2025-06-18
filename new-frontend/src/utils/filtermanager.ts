import {useRoleStore} from "@/utils/rolemananagemetstate";
import type {DateRange} from "react-day-picker";

export type FilterType = "search" | "date" | "default";

interface FilterData {
    values: any[];
    type: FilterType;
}

class FilterManager {
    private filters: Map<string, FilterData>;

    constructor(initialFilters?: Record<string, FilterData>) {
        this.filters = new Map();

        if (initialFilters) {
            for (const key in initialFilters) {
                const data = initialFilters[key];
                if (Array.isArray(data.values)) {
                    this.filters.set(key, {
                        values: data.values,
                        type: data.type ?? "default",
                    });
                }
            }
        }
    }

    getFilters(): Record<string, FilterData> {
        const result: Record<string, FilterData> = {};
        this.filters.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }

    getSelectedValues(): Record<string, string[]> {
        const result: Record<string, string[]> = {};
        this.filters.forEach((data, key) => {
            result[key] = data.values;
        });
        return result;
    }

    getDateRanges(): Record<string, DateRange | undefined> {
        const result: Record<string, DateRange | undefined> = {};

        this.filters.forEach((data, key) => {
            if (data.type === "date" && data.values.length === 2) {
                const [fromStr, toStr] = data.values;
                const from = new Date(fromStr);
                const to = new Date(toStr);
                if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
                    result[key] = {from, to};
                }
            }
        });

        return result;
    }

    addFilter(key: string, values: any[], type: FilterType = "default") {
        if (!key || !Array.isArray(values)) {
            throw new Error("Key must be string and values must be array");
        }
        if (values.length === 0) {
            this.filters.delete(key);
        } else {
            this.filters.set(key, {values, type});
        }
    }

    removeFilter(key: string) {
        this.filters.delete(key);
    }

    hasFilter(key: string): boolean {
        return this.filters.has(key);
    }

    private getProjectIdsFromStore(): number[] {
        const selectedRoles = useRoleStore.getState().selectedRoles;
        return selectedRoles.map((r) => r.project_id);
    }

    private buildFilterString(): string {
        const parts: string[] = [];

        const formatFilter = (key: string, filterData: FilterData) => {
            const {values, type} = filterData;
            if (values.length === 0) return;

            if (type === "date" && values.length === 2) {
                parts.push(`${key}:$between.${values[0]}|${values[1]}`);
            } else if (values.length === 1) {
                parts.push(`${key}:$eq.${values[0]}`);
            } else {
                parts.push(`${key}:$in.${values.join("|")}`);
            }
        };

        const projectFilter = this.filters.get("project_id");
        if (projectFilter) {
            formatFilter("project_id", projectFilter);
        }

        for (const [key, filterData] of this.filters.entries()) {
            if (key === "project_id") continue;
            formatFilter(key, filterData);
        }

        return parts.join(",");
    }

    getFilterStringWithProjectIds(): string {
        const projectIds = this.getProjectIdsFromStore();
        if (projectIds.length > 0) {
            this.filters.set("project_id", {values: projectIds, type: "default"});
        } else {
            console.log("this.projectIds", projectIds)
            console.log("this.filters", this.filters)
        }

        return this.buildFilterString();
    }

    getFilterString(): string {
        return this.buildFilterString();
    }

    toQueryParams(): Record<string, string> {
        const filterString = this.getFilterStringWithProjectIds();
        if (filterString) {
            return {filter: filterString};
        }
        return {};
    }

    static fromQueryParams(searchParams: URLSearchParams): FilterManager {
        const filterParam = searchParams.get("filter");
        const filters: Record<string, FilterData> = {};

        if (filterParam) {
            const parts = filterParam.split(",");
            for (const part of parts) {
                if (part.includes(":$eq.")) {
                    const [key, value] = part.split(":$eq.");
                    if (key && value !== undefined) {
                        filters[key] = {values: [value], type: "default"};
                    }
                } else if (part.includes(":$in.")) {
                    const [key, value] = part.split(":$in.");
                    if (key && value !== undefined) {
                        filters[key] = {values: value.split("|"), type: "default"};
                    }
                } else if (part.includes(":$between.")) {
                    const [key, value] = part.split(":$between.");
                    if (key && value !== undefined) {
                        filters[key] = {values: value.split("|"), type: "date"};
                    }
                } else {
                    console.warn(`Unknown filter format: ${part}`);
                }
            }
        }
        return new FilterManager(filters);
    }
}

export default FilterManager;