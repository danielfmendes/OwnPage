export interface User {
    id: number;
    username: string;
    password_hash: string;
    created_at: string;
}

export interface Customer {
    id: number;
    name: string;
    email: string;
    location: string;
}

export interface Bike {
    id: number;
    model_id: number;
    serial_number: string;
    production_date: string;
    warehouse_location: string;
}

export interface Saddle {
    id: number;
    name: string;
}

export interface Frame {
    id: number;
    name: string;
}

export interface Fork {
    id: number;
    name: string;
}

export interface BikeModel {
    id: number;
    name: string;
    saddle_id: number;
    frame_id: number;
    fork_id: number;
}

export interface WarehousePart {
    id: number;
    part_type: string;
    part_id: number;
    quantity: number;
    storage_location: string;
}

export interface Order {
    id: number;
    customer_id: number;
    order_date: string;
    total_price: number;
}

export interface OrderItem {
    id: number;
    order_id: number;
    bike_id: number;
    price: number;
}

export interface PartCost {
    part_type: string;
    part_id: number;
    cost: number;
}
