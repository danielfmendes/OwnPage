package handlers

import (
	"go-bike-api/db"
	"go-bike-api/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetBikes(c *gin.Context) {
	rows, err := db.DB.Query("SELECT id, model_id, serial_number, production_date, warehouse_location FROM bikes")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var bikes []models.Bike
	for rows.Next() {
		var b models.Bike
		if err := rows.Scan(&b.ID, &b.ModelID, &b.SerialNumber, &b.ProductionDate, &b.WarehouseLocation); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		bikes = append(bikes, b)
	}

	c.JSON(http.StatusOK, bikes)
}
