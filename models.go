package main

import (
	"gorm.io/gorm"
)

var (
	news = []News{
		{
			Categories:  []Categories{{Name: "x"}, {Name: "y"}, {Name: "z"}},
			Headline:    "headline 1",
			Image:       "path to image 1",
			Location:    "Berlin",
			PublishDate: "",
			Severity:    0,
		},
		{
			Categories:  []Categories{{Name: "x"}},
			Headline:    "headline 2",
			Image:       "path to image 2",
			Location:    "Paris",
			PublishDate: "",
			Severity:    0,
		},
		{
			Categories:  []Categories{{Name: "y"}, {Name: "z"}},
			Headline:    "headline 3",
			Image:       "path to image 3",
			Location:    "Milan",
			PublishDate: "",
			Severity:    0,
		},
	}
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
