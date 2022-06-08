package main

import (
	"fmt"
	"log"
	"strings"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	glogger "gorm.io/gorm/logger"
)

type SQLiteRepo struct {
	DB     *gorm.DB
	logger *log.Logger
}

type Storage interface {
	GetAllNews() []News
	GetNewsByID(id int) *News
	HasChanged(notFirstTime bool) (bool, error)
}

func NewNewsRepo(dbFileName string, logger *log.Logger) (Storage, error) {
	if dbFileName == "" {
		return &SQLiteRepo{}, fmt.Errorf("database name is empty")
	}

	if !strings.HasPrefix(dbFileName, "db") {
		dbFileName += ".db"
	}

	sql, err := gorm.Open(sqlite.Open(fmt.Sprintf("database/%s", dbFileName)), &gorm.Config{
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

// GetAllNews gets all news from DB
func (r *SQLiteRepo) GetAllNews() []News {
	r.logger.Printf("getting all news")
	var news []News
	tx := r.DB.Find(&news)
	if tx.RowsAffected != 0 {
		return news
	}
	r.logger.Printf("no articles found")
	return nil
}

// GetNewsByID gets news with `id` from the SQLite DB
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

var oldCount int64

// HasChanged returns `true` if DB has been changed
func (r *SQLiteRepo) HasChanged(notFirstTime bool) (bool, error) {
	if !notFirstTime {
		notFirstTime = true
		return true, nil
	}

	var c int64
	tx := r.DB.Raw("SELECT count() FROM news").Scan(&c)
	if tx.Error != nil {
		r.logger.Print(tx.Error)
		return false, tx.Error
	}
	if c != oldCount {
		oldCount = c
		// if it is second time, but nothing has changed. In this way we initialize oldCount
		//if notFirstTime {
		//	return false, nil
		//}
		return true, nil
	}

	return false, nil
}
