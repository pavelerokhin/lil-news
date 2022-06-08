package main

import (
	"fmt"
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	glogger "gorm.io/gorm/logger"
)

type SQLiteRepo struct {
	DB     *gorm.DB
	logger *log.Logger
}

type Storage interface {
	GetNewsByID(id int) *News
}

func NewNewsRepo(dbFileName string, logger *log.Logger) (Storage, error) {
	if dbFileName == "" {
		return &SQLiteRepo{}, fmt.Errorf("database name is empty")
	}

	sql, err := gorm.Open(sqlite.Open(fmt.Sprintf("database/%s.db", dbFileName)), &gorm.Config{
		Logger: glogger.Default.LogMode(glogger.Silent),
	})
	if err != nil {
		return &SQLiteRepo{}, err
	}

	err = sql.AutoMigrate(&News{})
	if err != nil {
		return &SQLiteRepo{}, err
	}

	return &SQLiteRepo{DB: sql, logger: logger}, nil
}

// GetNewsByID gets article with `id` from the SQLite DB
func (r *SQLiteRepo) GetNewsByID(id int) *News {
	r.logger.Printf("getting news with ID %d", id)
	var news News
	tx := r.DB.Where("id = ?", id).Find(&news)
	if tx.RowsAffected != 0 {
		return &news
	}
	r.logger.Printf("news with ID %v not found", id)
	return nil
}
