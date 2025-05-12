import {Bike, RoleManagement, WarehousePart} from "@/types/datatables";

export type WarehousePartWithName = WarehousePart & {
    part_name: string;
};

export type BikeWithModelName = Bike & {
    model_name: string;
};

export type RoleManagementWithName = RoleManagement & {
    project_name: string;
};

export interface OrderOverview {
    order_id: number;
    orderitem_id: number;
    project_id: number;
    customer_name: string;
    order_date: string;
    bike_model_name: string;
    number: number;
    price: number;
}
