export interface WarehousePart {
    id: number;
    part_type: string;
    part_id: number;
    quantity: number;
    storage_location: string;
    project_id: number;
}

export interface Order {
    id: number;
    customer_id: number;
    order_date: string;
    project_id: number;
}

export interface OrderItem {
    id: number;
    order_id: number;
    bike_id: number;
    number: number;
    price: number;
}

export interface PartCost {
    part_type: string;
    part_id: number;
    cost: number;
    project_id: number;
}
