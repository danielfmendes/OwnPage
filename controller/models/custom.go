package models

import "time"

type WarehousePartWithName struct {
	WarehousePart
	PartName string `json:"part_name"`
}

type BikeWithModelName struct {
	Bike
	ModelName string `json:"model_name"`
}

type RoleManagementWithName struct {
	RoleManagement
	ProjectName string `json:"project_name"`
}

type OrderWithCustomer struct {
	Order
	CustomerName  string `json:"customer_name"`
	CustomerEmail string `json:"customer_email"`
}

type OrderItemsWithBikeName struct {
	OrderItem
	ModelName string `json:"model_name"`
}

type OrderItemsWithBikeAndDate struct {
	OrderItem
	ModelName string    `json:"model_name"`
	OrderDate time.Time `json:"order_date"`
}

type GraphMeta struct {
	CurrentRevenue  float64 `json:"current_revenue"`
	PreviousRevenue float64 `json:"previous_revenue"`
	CurrentSales    int     `json:"current_sales"`
	PreviousSales   int     `json:"previous_sales"`
}

type GraphData struct {
	Bucket  time.Time `json:"bucket"`
	Revenue float64   `json:"revenue"`
	SalesNo int       `json:"sales_no"`
}

type CityData struct {
	City            string  `json:"city"`
	CurrentRevenue  float64 `json:"current_revenue"`
	PreviousRevenue float64 `json:"previous_revenue"`
}

type BikeSales struct {
	BikeModel  string    `json:"bike_model"`
	OrderDate  time.Time `json:"order_date"`
	TotalSales int       `json:"total_sales"`
	Revenue    float64   `json:"revenue"`
}
