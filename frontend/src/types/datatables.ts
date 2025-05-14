export interface Project {
    id: number;
    name: string;
}

export interface User {
    email: string;
    password: string;
    username: string;
    dob: string;
    is_verified: boolean;
    verification_expires: string;
    verification_token: string;
}

export interface RoleManagement {
    user_email: string;
    project_id: number;
    role: string;
}

export interface Customer {
    id: number;
    email: string;
    password: string;
    first_name: string;
    name: string;
    dob: string;
    city: string;
    project_id: number;
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

export interface Bike {
    id: number;
    model_id: number;
    serial_number: string;
    production_date: string;
    quantity: number;
    warehouse_location: string;
    project_id: number;
}

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
