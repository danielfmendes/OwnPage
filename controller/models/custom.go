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
