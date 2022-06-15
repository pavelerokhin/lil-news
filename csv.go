package main

import (
	"encoding/csv"
	"fmt"
	"os"
	"strconv"
	"time"
)

func CreateCSV(news []News) (string, string, error) {
	filename := fmt.Sprintf("newsfeed_%s.csv", strconv.Itoa(int(time.Now().UnixMilli())))
	filepath := fmt.Sprintf("public/csv/%s", filename)

	csvFile, err := os.OpenFile(filepath, os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return "", "", fmt.Errorf("failed creating file: %w", err)
	}
	defer csvFile.Close()

	w := csv.NewWriter(csvFile)
	defer w.Flush()

	if err = w.Error(); err != nil {
		return "", "", fmt.Errorf("failed writing to file: %w", err)
	}

	for i, n := range news {
		if i == 0 {
			err = w.Write(n.Header())
			if err != nil {
				return "", "", fmt.Errorf("failed writing to file: %w", err)
			}
		}

		err = w.Write(n.String())
		if err != nil {
			return "", "", fmt.Errorf("failed writing to file: %w", err)
		}
	}

	return filepath, filename, nil
}

func (n *News) Header() []string {
	return []string{"Categories", "Headline", "URL", "Location", "Date", "Severity"}
}

func (n *News) String() []string {
	var cnn string
	for _, c := range n.CategoryNews {
		cnn += fmt.Sprintf("%s;", c.String())
	}
	return []string{cnn, n.Headline, n.Link, n.Location, n.PublishDate, strconv.Itoa(n.Severity)}
}

// TODO: a hack to fix (it doesn't get automatically all the nested types)
var cats []Category

func (cn *CategoryNews) String() string {
	if cats == nil {
		cats = s.GetAllCategories()
	}

	for _, c := range cats {
		if c.ID == cn.CategoryId {
			return c.Name
		}
	}

	return ""
}
