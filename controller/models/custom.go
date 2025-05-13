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

type OrderOverview struct {
	OrderID      int       `json:"order_id"`
	OrderItemID  int       `json:"orderitem_id"`
	ProjectID    int       `json:"project_id"`
	CustomerName string    `json:"customer_name"`
	OrderDate    time.Time `json:"order_date"`
	BikeModel    string    `json:"bike_model_name"`
	Number       float64   `json:"number"`
	Price        float64   `json:"price"`
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
}
