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
}

func RandImage() string {
	return fmt.Sprintf("images/%s", images[rand.Intn(len(images))])
}

func RandLink() string {
	if rand.Intn(2) == 0 {
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
		Headline:    RandString(rand.Intn(100)+1, true),
		Image:       RandImage(),
		Link:        RandLink(),
		Location:    RandLocation(),
		PublishDate: t.String(),
		Severity:    rand.Intn(5) + 1,
	}
}
