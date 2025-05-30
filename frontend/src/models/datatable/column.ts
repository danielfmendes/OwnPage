import { ColumnDef } from "@tanstack/react-table";

export type CustomColumnDef<TData> = ColumnDef<TData> & {
    widthPercent?: number;
};
