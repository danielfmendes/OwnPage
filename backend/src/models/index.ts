export interface Project {
    id: number;
    name: string;
}

export interface User {
    email: string;
    password?: string; // Optional for response hiding
    username: string;
    dob: string; // ISO Date
    is_verified: boolean;
    verification_expires?: string;
    verification_token?: string;
}

export interface RoleManagement {
    user_email: string;
    project_id: number;
    role: string;
}

export interface RoleManagementWithName extends RoleManagement {
    project_name: string;
}

export interface Customer {
    id: number;
    email: string;
    password?: string;
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

export interface BikeWithModelName extends Bike {
    model_name: string;
}

export interface WarehousePart {
    id: number;
    part_type: string;
    part_id: number;
    quantity: number;
    storage_location: string;
    project_id: number;
}

export interface WarehousePartWithName extends WarehousePart {
    part_name: string;
}

export interface Order {
    id: number;
    customer_id: number;
    order_date: string;
    project_id: number;
}

export interface OrderWithCustomer extends Order {
    customer_name: string;
    customer_email: string;
}

export interface OrderItem {
    id: number;
    order_id: number;
    bike_id: number;
    number: number;
    price: number;
}

export interface OrderItemsWithBikeName extends OrderItem {
    model_name: string;
}

export interface OrderItemsWithBikeAndDate extends OrderItem {
    model_name: string;
    order_date: string;
}

export interface PartCost {
    part_type: string;
    part_id: number;
    cost: number;
    project_id: number;
}

export interface GraphMeta {
    current_revenue: number;
    previous_revenue: number;
    current_sales: number;
    previous_sales: number;
}

export interface GraphData {
    bucket: string;
    revenue: number;
    sales_no: number;
}

export interface CityData {
    city: string;
    current_revenue: number;
    previous_revenue: number;
}

export interface BikeSales {
    bike_model: string;
    order_date: string;
    total_sales: number;
    revenue: number;
}
