import {WarehousePart} from "@/types/datatables";

export type WarehousePartWithName = WarehousePart & {
    part_name: string;
};