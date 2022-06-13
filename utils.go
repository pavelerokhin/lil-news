package main

import (
	"fmt"
	"golang.org/x/text/language"
	"io/ioutil"
	"math/rand"
	"time"

	"golang.org/x/text/cases"
)

var (
	caser       = cases.Title(language.English)
	categories  = []Category{{Name: "cat1", Color: "DD6B7F"}, {Name: "cat2", Color: "224624"}, {Name: "cat3", Color: "800080"}}
	images      []string
	letterRunes = []rune("abcdefghijklmnopqrstuvwxyz    ")
	locations   = []string{"Madrid", "Minsk", "Monaco", "Moscow", "Nicosia", "Nuuk", "Oslo", "Paris", "Podgorica", "Prague", "Reykjavik", "Riga", "Rome", "San Marino", "Sarajevo", "Skopje", "Sofia", "Stockholm", "Tallinn", "Tirana", "Vaduz", "Valletta", "Vatican City", "Vienna", "Vilnius", "Warsaw", "Zagreb"}
)

func init() {
	rand.Seed(time.Now().UnixNano())

	files, err := ioutil.ReadDir("public/images")
	if err != nil {
		images = []string{"1.png", "2.png"}
		return
	}

	for _, file := range files {
		images = append(images, file.Name())
	}

	for _, category := range categories {
		_ = s.AddCategory(&category)
	}
}

func RandCategory() []CategoryNews {
	var cc []CategoryNews
	var cats []Category

	cats = s.GetAllCategories()

	n := rand.Intn(len(categories)) + 1

	for n > 0 {
		var i int
		for {
			flag := true
			i = rand.Intn(len(cats))
			for _, c := range cc {
				if c.Category.Name == cats[i].Name {
					flag = false
				}
			}
			if flag {
				break
			}
		}
		cc = append(cc, CategoryNews{Category: cats[i]})
		n--
	}
	return cc
}

func RandImage() string {
	return fmt.Sprintf("images/%s", images[rand.Intn(len(images))])
}

func RandLink() string {
	if 0 == rand.Intn(2) {
		return ""
	}
	return "www.google.com"
}

func RandLocation() string {
	return locations[rand.Intn(len(locations))]
}

func RandString(n int, isTitle bool) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letterRunes[rand.Intn(len(letterRunes))]
	}
	if isTitle {
		return caser.String(string(b))
	}
	return string(b)
}

func generateNews() *News {
	t := time.Now().UTC()
	return &News{
		CategoryNews: RandCategory(),
		Headline:     RandString(rand.Intn(100)+1, true),
		Image:        RandImage(),
		Link:         RandLink(),
		Location:     RandLocation(),
		PublishDate:  t.String(),
		Severity:     rand.Intn(5) + 1,
	}
}
