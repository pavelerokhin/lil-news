package main

import (
	"io"
	"log"
	"os"
	"text/template"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

var (
	l = log.New(os.Stdout, "lil-news ", log.LstdFlags|log.Lshortfile)
	s = NewNewsSQLiteRepo("newsfeed", l)
	h = getHandlers(l, s)
)

type Template struct {
	templates *template.Template
}

func (t *Template) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return t.templates.ExecuteTemplate(w, name, data)
}

func main() {
	t := &Template{
		templates: template.Must(template.ParseGlob("public/views/*.html")),
	}
	e := echo.New()
	e.Renderer = t

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Static("/", "public")

	// Handlers
	e.GET("/", h.IndexPage)
	e.GET("/ws", h.NewsFeedWebSocketHandler)
	e.GET("/csv", h.DownloadCSV)
	e.POST("/insert", h.Insert)
	e.POST("/insert-random", h.InsertRandom)

	e.Logger.Fatal(e.Start(":1111"))
}
