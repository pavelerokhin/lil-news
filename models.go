package main

import "time"

var (
	news = []News{
		{
			Categories:  []string{"x", "y", "z"},
			Headline:    "headline 1",
			Image:       "path to image 1",
			Location:    "Berlin",
			PublishDate: time.Now().UTC(),
			Severity:    0,
		},
		{
			Categories:  []string{"x"},
			Headline:    "headline 2",
			Image:       "path to image 2",
			Location:    "Paris",
			PublishDate: time.Now().UTC(),
			Severity:    0,
		},
		{
			Categories:  []string{"y", "z"},
			Headline:    "headline 3",
			Image:       "path to image 3",
			Location:    "Milan",
			PublishDate: time.Now().UTC(),
			Severity:    0,
		},
	}
)

type News struct {
	Categories  []string  `json:"categories"`
	Headline    string    `json:"headline"`
	Image       string    `json:"image"`
	IsRelevant  int       `json:"isRelevant"`
	Location    string    `json:"location"`
	PublishDate time.Time `json:"publishDate"`
	Severity    int       `json:"severity"`
}
