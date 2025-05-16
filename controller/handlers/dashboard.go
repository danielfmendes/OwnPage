package handlers

import (
	"controller/models"
	"controller/utils"
	"net/http"
)

func DashBoardHandler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	switch path {
	case "/dashboard/graphmeta":
		GetGraphMeta(w, r)
	case "/dashboard/graphdata":
		GetGraphData(w, r)
	case "/dashboard/citydata":
		GetCityData(w, r)
	case "/dashboard/bikemodels":
		GetSalesPerBikeModel(w, r)
	default:
		http.Error(w, "Not Found", http.StatusNotFound)
	}
}

func GetGraphMeta(w http.ResponseWriter, r *http.Request) {
	timeRange := r.URL.Query().Get("range")
	if timeRange == "" {
		http.Error(w, "Missing range parameter", http.StatusBadRequest)
		return
	}

	query := utils.MustReadSQLFile("selects/graphmeta.sql")

	utils.HandleGetWithProjectIDs(w, r, query, func(scanner utils.Scanner) (any, error) {
		var meta models.GraphMeta
		err := scanner.Scan(
			&meta.CurrentRevenue,
			&meta.PreviousRevenue,
			&meta.CurrentSales,
			&meta.PreviousSales,
		)
		return meta, err
	}, timeRange)
}

func GetGraphData(w http.ResponseWriter, r *http.Request) {
	timeRange := r.URL.Query().Get("range")
	if timeRange == "" {
		http.Error(w, "Missing range parameter", http.StatusBadRequest)
		return
	}

	query := utils.MustReadSQLFile("selects/graphdata.sql")

	utils.HandleGetWithProjectIDs(w, r, query, func(scanner utils.Scanner) (any, error) {
		var data models.GraphData
		err := scanner.Scan(
			&data.Bucket,
			&data.Revenue,
			&data.SalesNo,
		)
		return data, err
	}, timeRange)
}

func GetCityData(w http.ResponseWriter, r *http.Request) {
	timeRange := r.URL.Query().Get("range")
	if timeRange == "" {
		http.Error(w, "Missing range parameter", http.StatusBadRequest)
		return
	}

	query := utils.MustReadSQLFile("selects/citydata.sql")

	utils.HandleGetWithProjectIDs(w, r, query, func(scanner utils.Scanner) (any, error) {
		var data models.CityData
		err := scanner.Scan(
			&data.City,
			&data.CurrentRevenue,
			&data.PreviousRevenue,
		)
		return data, err
	}, timeRange)
}

func GetSalesPerBikeModel(w http.ResponseWriter, r *http.Request) {
	timeRange := r.URL.Query().Get("range")
	if timeRange == "" {
		http.Error(w, "Missing range parameter", http.StatusBadRequest)
		return
	}

	query := utils.MustReadSQLFile("selects/bikemodelssales.sql")

	utils.HandleGetWithProjectIDs(w, r, query, func(scanner utils.Scanner) (any, error) {
		var data models.BikeSales
		err := scanner.Scan(
			&data.BikeModel,
			&data.OrderDate,
			&data.TotalSales,
			&data.Revenue,
		)
		return data, err
	}, timeRange)
}
