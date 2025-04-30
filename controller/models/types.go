package models

import "time"

type Bike struct {
	ID                int       `json:"id"`
	ModelID           int       `json:"model_id"`
	SerialNumber      string    `json:"serial_number"`
	ProductionDate    time.Time `json:"production_date"`
	WarehouseLocation string    `json:"warehouse_location"`
}
