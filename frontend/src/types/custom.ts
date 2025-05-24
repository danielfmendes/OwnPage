import {Order, OrderItem} from "@/types/datatables";

export type OrderWithCustomer = Order & {
    customer_name: string;
    customer_email: string;
};

export type OrderItemsWithBikeName = OrderItem & {
    model_name: string;
};

export type OrderItemsWithBikeAndDate = OrderItem & {
    model_name: string;
    order_date: string;
};

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