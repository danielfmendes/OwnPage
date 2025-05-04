package models

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
