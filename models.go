package main

import (
	"gorm.io/gorm"
)

type News struct {
	gorm.Model
	Categories  []Categories `gorm:"foreignKey:CategoryID" json:"categories"`
	Headline    string       `gorm:"headline" json:"headline"`
	Image       string       `gorm:"image" json:"image"`
	IsRelevant  int          `gorm:"isRelevant" json:"isRelevant"`
	Link        string       `gorm:"link" json:"link"`
	Location    string       `gorm:"location" json:"location"`
	PublishDate string       `gorm:"publishDate" json:"publishDate"`
	Severity    int          `gorm:"severity" json:"severity"`
}

type Categories struct {
	gorm.Model
	CategoryID uint
	Name       string
}
