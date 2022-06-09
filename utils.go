package main

import (
	"fmt"
	"golang.org/x/text/language"
	"math/rand"
	"time"

	"golang.org/x/text/cases"
)

func init() {
	rand.Seed(time.Now().UnixNano())
}

var (
	caser       = cases.Title(language.English)
	images      = []string{"1.png", "2.png"}
	letterRunes = []rune("abcdefghijklmnopqrstuvwxyz    ")
	locations   = []string{"Madrid", "Minsk", "Monaco", "Moscow", "Nicosia", "Nuuk", "Oslo", "Paris", "Podgorica", "Prague", "Reykjavik", "Riga", "Rome", "San Marino", "Sarajevo", "Skopje", "Sofia", "Stockholm", "Tallinn", "Tirana", "Vaduz", "Valletta", "Vatican City", "Vienna", "Vilnius", "Warsaw", "Zagreb"}
)

func RandImage() string {
	return fmt.Sprintf("images/%s", images[rand.Intn(len(images))])
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
		Location:    RandLocation(),
		PublishDate: t.String(),
		Severity:    rand.Intn(5) + 1,
	}
}
