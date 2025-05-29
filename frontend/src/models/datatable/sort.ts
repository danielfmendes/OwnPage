export enum SortDirection {
    ASC = "asc",
    DESC = "desc",
}

export interface SortItem {
    key: string;
    order: string
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

    restoreSelection(sort: SortItem[]) {
        this.items = sort;
    }

    toCallOpts() {
        return this._items.map(
            (e) => `${e.key}=${e.order ?? SortDirection.ASC}`
        );
    }
}

