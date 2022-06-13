package main

import (
	"gorm.io/gorm"
)

type News struct {
	gorm.Model
	CategoryNews []CategoryNews `json:"categories"`
	Headline     string         `gorm:"headline" json:"headline"`
	Image        string         `gorm:"image" json:"image"`
	IsRelevant   int            `gorm:"isRelevant" json:"isRelevant"`
	Link         string         `gorm:"link" json:"link"`
	Location     string         `gorm:"location" json:"location"`
	PublishDate  string         `gorm:"publishDate" json:"publishDate"`
	Severity     int            `gorm:"severity" json:"severity"`
}

type CategoryNews struct {
	gorm.Model
	Category   Category `gorm:"category" json:"category"`
	CategoryId uint     `gorm:"categoryId" json:"categoryId"`
	NewsId     uint
}

type Category struct {
	gorm.Model
	Name  string `gorm:"unique" json:"name"`
	Color string `json:"color"`
}
