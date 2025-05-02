package models

type WarehousePartWithName struct {
	WarehousePart
	PartName string `json:"part_name"`
}
