package main

import (
	"io"
	"text/template"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
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

	e.GET("/", Index)
	e.GET("/ws", NewsFeedWebSocketHandler)
	e.Logger.Fatal(e.Start(":1111"))
}
