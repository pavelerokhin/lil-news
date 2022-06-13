package main

import (
	"fmt"
	"gorm.io/gorm/clause"
	"log"
	"strings"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	glogger "gorm.io/gorm/logger"
)

type SQLiteRepo struct {
	DB               *gorm.DB
	logger           *log.Logger
	newChangesInRepo bool
}

type Storage interface {
	AddCategory(category *Category) error
	//AddCategoryNews(n *CategoryNews) error
	AddNews(n *News) error
	DeleteNews(id int) error
	GetAllCategories() []Category
	GetAllNews() []News
	GetNewsByID(id int) *News
	HasChanges() bool
}

func NewNewsSQLiteRepo(dbFileName string, logger *log.Logger) Storage {
	if dbFileName == "" {
		logger.Printf("error: database name cannot be empty")
		return &SQLiteRepo{}
	}

	if !strings.HasPrefix(dbFileName, "db") {
		dbFileName += ".db"
	}

	sql, err := gorm.Open(sqlite.Open(fmt.Sprintf("database/%s", dbFileName)), &gorm.Config{
		Logger: glogger.Default.LogMode(glogger.Silent),
	})
	if err != nil {
		logger.Printf("error: cannot connect to the database")
		return &SQLiteRepo{}
	}

	err = sql.AutoMigrate(&News{})
	if err != nil {
		logger.Printf("error: cannot auto migrate model to the database")
		return &SQLiteRepo{}
	}

	err = sql.AutoMigrate(&Category{})
	if err != nil {
		logger.Printf("error: cannot auto migrate model to the database")
		return &SQLiteRepo{}
	}

	err = sql.AutoMigrate(&CategoryNews{})
	if err != nil {
		logger.Printf("error: cannot auto migrate model to the database")
		return &SQLiteRepo{}
	}

	logger.Printf("connected to SQLite database %s", dbFileName)
	return &SQLiteRepo{DB: sql, logger: logger}
}

// AddCategory add news to DB
func (r *SQLiteRepo) AddCategory(category *Category) error {
	r.logger.Printf("adding category %s", category)
	tx := r.DB.Create(category)
	if tx.Error != nil {
		r.logger.Printf("error category %e", tx.Error)
		return tx.Error
	}
	r.newChangesInRepo = true
	return nil
}

//// AddCategoryNews add news to DB
//func (r *SQLiteRepo) AddCategoryNews(categoryNews *CategoryNews) error {
//	r.logger.Printf("associating categories %s to the news", categoryNews)
//	tx := r.DB.Create(categoryNews)
//	if tx.Error != nil {
//		r.logger.Printf("error category association %e", tx.Error)
//		return tx.Error
//	}
//	r.newChangesInRepo = true
//	return nil
//}

// AddNews add news to DB
func (r *SQLiteRepo) AddNews(n *News) error {
	r.logger.Printf("adding news %s", n)
	tx := r.DB.Create(n)
	if tx.Error != nil {
		r.logger.Printf("error news %e", tx.Error)
		return tx.Error
	}
	r.newChangesInRepo = true
	return nil
}

func (r *SQLiteRepo) DeleteNews(id int) error {
	var n News

	tx := r.DB.Where("id = ?", id).Find(&n)
	if tx.RowsAffected != 0 {
		tx = r.DB.Delete(&n)
		if tx.Error != nil {
			return fmt.Errorf("error while deleting news with ID %d: %s", id, tx.Error)
		}
		r.newChangesInRepo = true
		r.logger.Printf("news with ID %v has been deleted successfully", id)
	} else {
		r.logger.Printf("cannot find news with ID %d", id)
	}

	return nil
}

// GetAllCategories gets all categories from DB
func (r *SQLiteRepo) GetAllCategories() []Category {
	r.logger.Printf("getting all categories")
	var categories []Category
	tx := r.DB.Find(&categories)
	if tx.RowsAffected != 0 {
		r.logger.Printf("%d categories found", tx.RowsAffected)
		return categories
	}
	r.logger.Printf("no categories found")
	return nil
}

// GetAllNews gets all news from DB
func (r *SQLiteRepo) GetAllNews() []News {
	r.logger.Printf("getting all news")
	var news []News
	tx := r.DB.Preload(clause.Associations).Find(&news)
	if tx.RowsAffected != 0 {
		r.logger.Printf("%d articles found", tx.RowsAffected)
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

// HasChanges returns `true` if DB has been changed and changes the internal state of storage
func (r *SQLiteRepo) HasChanges() bool {
	if r.newChangesInRepo {
		r.newChangesInRepo = false
		return true
	}
	return false
}
