import {Bike, WarehousePart} from "@/types/datatables";

export type WarehousePartWithName = WarehousePart & {
    part_name: string;
};

export type BikeWithModelName = Bike & {
    model_name: string;
};