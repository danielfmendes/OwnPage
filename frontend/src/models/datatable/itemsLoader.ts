import {Pagination} from "@/models/datatable/pagination";
import {Sort} from "@/models/datatable/sort";

export declare interface ItemsLoaderOptions {
  pagination: Pagination;
  sort: Sort;
}

export declare type ItemsLoader = (_: ItemsLoaderOptions) => Promise<any[]>;
