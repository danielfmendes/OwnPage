import type {ColumnDef} from "@tanstack/react-table";

export type CustomColumnDef<TData> = ColumnDef<TData> & {
    widthPercent?: number;
    mobileTitle?: boolean;
};
