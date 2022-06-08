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
	//e.Use(middleware.Recover())

	e.Static("/", "public")
	db, err := NewNewsRepo("newsfeed", l)
	if err != nil {
		l.Fatalf("error persistence: %s", err)
	}

	// Handlers
	e.GET("/", Index)
	handler := func(c echo.Context) error {
		return NewsFeedWebSocketHandler(c, db)
	}
	e.GET("/ws", handler)
	e.Logger.Fatal(e.Start(":1111"))
}
