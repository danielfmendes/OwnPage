export const SortDirection = {
    ASC: "asc",
    DESC: "desc",
}

export interface SortItem {
    key: string;
    order: string;
}

export class Sort {
    private _items: SortItem[];

    constructor(items: SortItem[] = []) {
        this._items = items;
    }

    set items(value: SortItem[]) {
        this._items = value;
    }

    get items(): SortItem[] {
        return this._items;
    }

    static fromQueryParams(searchParams: URLSearchParams): Sort {
        const orderBy = searchParams.get("orderBy");
        if (!orderBy) return new Sort();

        const items = orderBy.split(",").map((item) => {
            const [key, dir] = item.split("=");
            return {key, order: dir ?? SortDirection.ASC};
        });

        return new Sort(items);
    }

    toQueryParams(): Record<string, string> {
        if (this._items.length === 0) return {};
        const value = this._items.map(e => `${e.key}=${e.order}`).join(",");
        return {orderBy: value};
    }

    toCallOpts() {
        return this._items.map(
            (e) => `${e.key}=${e.order ?? SortDirection.ASC}`
        )
    }
}
