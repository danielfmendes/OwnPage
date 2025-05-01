package models

import "time"

type User struct {
	ID           int       `json:"id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"password_hash"`
	CreatedAt    time.Time `json:"created_at"`
}

type Customer struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Location string `json:"location"`
}

type Bike struct {
	ID                int       `json:"id"`
	ModelID           int       `json:"model_id"`
	SerialNumber      string    `json:"serial_number"`
	ProductionDate    time.Time `json:"production_date"`
	WarehouseLocation string    `json:"warehouse_location"`
}

type Saddle struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type Frame struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type Fork struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type BikeModel struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	SaddleID int    `json:"saddle_id"`
	FrameID  int    `json:"frame_id"`
	ForkID   int    `json:"fork_id"`
}

type WarehousePart struct {
	ID              int    `json:"id"`
	PartType        string `json:"part_type"`
	PartID          int    `json:"part_id"`
	Quantity        int    `json:"quantity"`
	StorageLocation string `json:"storage_location"`
}

type Order struct {
	ID         int       `json:"id"`
	CustomerID int       `json:"customer_id"`
	OrderDate  time.Time `json:"order_date"`
	TotalPrice float64   `json:"total_price"`
}

type OrderItem struct {
	ID      int     `json:"id"`
	OrderID int     `json:"order_id"`
	BikeID  int     `json:"bike_id"`
	Price   float64 `json:"price"`
}

type PartCost struct {
	PartType string  `json:"part_type"`
	PartID   int     `json:"part_id"`
	Cost     float64 `json:"cost"`
}
