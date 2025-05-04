package models

import "time"

type Project struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type User struct {
	Email    string    `json:"email"`
	Password string    `json:"password"`
	Username string    `json:"username"`
	Dob      time.Time `json:"dob"`
}

type RoleManagement struct {
	UserEmail string `json:"user_email"`
	ProjectID int    `json:"project_id"`
	Role      string `json:"role"`
}

type Customer struct {
	ID        int       `json:"id"`
	Email     string    `json:"email"`
	Password  string    `json:"password"`
	FirstName string    `json:"first_name"`
	Name      string    `json:"name"`
	Dob       time.Time `json:"dob"`
	Location  string    `json:"location"`
	ProjectID int       `json:"project_id"`
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

type Bike struct {
	ID                int       `json:"id"`
	ModelID           int       `json:"model_id"`
	SerialNumber      string    `json:"serial_number"`
	ProductionDate    time.Time `json:"production_date"`
	Quantity          int       `json:"quantity"`
	WarehouseLocation string    `json:"warehouse_location"`
	ProjectID         int       `json:"project_id"`
}

type WarehousePart struct {
	ID              int    `json:"id"`
	PartType        string `json:"part_type"`
	PartID          int    `json:"part_id"`
	Quantity        int    `json:"quantity"`
	StorageLocation string `json:"storage_location"`
	ProjectID       int    `json:"project_id"`
}

type Order struct {
	ID         int       `json:"id"`
	CustomerID int       `json:"customer_id"`
	OrderDate  time.Time `json:"order_date"`
	TotalPrice float64   `json:"total_price"`
	ProjectID  int       `json:"project_id"`
}

type OrderItem struct {
	ID      int     `json:"id"`
	OrderID int     `json:"order_id"`
	BikeID  int     `json:"bike_id"`
	Price   float64 `json:"price"`
}

type PartCost struct {
	PartType  string  `json:"part_type"`
	PartID    int     `json:"part_id"`
	Cost      float64 `json:"cost"`
	ProjectID int     `json:"project_id"`
}
