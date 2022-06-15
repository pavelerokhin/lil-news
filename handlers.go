package main

import (
	"encoding/json"
	"github.com/labstack/echo/v4"
	"golang.org/x/net/websocket"
	"log"
	"net/http"
	"strconv"
)

type handlers struct {
	logger  *log.Logger
	storage Storage
}

func getHandlers(l *log.Logger, s Storage) *handlers {
	return &handlers{
		logger:  l,
		storage: s,
	}
}

func (h *handlers) Categories(c echo.Context) error {
	categories := h.storage.GetAllCategories()
	msg, err := json.Marshal(categories)
	if err != nil {
		return c.String(http.StatusConflict, "KO")
	}
	return c.String(http.StatusOK, string(msg))
}

func (h *handlers) Delete(c echo.Context) error {
	id, err := strconv.Atoi(c.FormValue("id"))
	if err != nil {
		return c.String(http.StatusConflict, "KO")
	}

	err = h.storage.DeleteNews(id)
	if err != nil {
		return c.String(http.StatusConflict, "KO")
	}
	return c.String(http.StatusOK, "OK")
}

func (h *handlers) DownloadCSV(c echo.Context) error {
	news := h.storage.GetAllNews()
	// create CSV file
	filepath, fileName, err := CreateCSV(news)
	if err != nil {
		h.logger.Printf("error creating CSV file: %s", err)
		return c.String(http.StatusInternalServerError, "KO")
	}
	// return CSV file
	return c.Attachment(filepath, fileName)
}

func (h *handlers) IndexPage(c echo.Context) error {
	return c.Render(http.StatusOK, "newsfeed", "")
}

func (h *handlers) Insert(c echo.Context) error {
	s, err := strconv.Atoi(c.FormValue("severity"))
	if err != nil {
		return c.String(http.StatusConflict, "KO")
	}

	err = h.storage.AddNews(&News{
		CategoryNews: nil,
		Headline:     c.FormValue("headline"),
		Image:        c.FormValue("image"),
		Location:     c.FormValue("location"),
		PublishDate:  c.FormValue("date"),
		Severity:     s,
	})
	if err != nil {
		return c.String(http.StatusConflict, "KO")
	}
	return c.String(http.StatusOK, "OK")
}

func (h *handlers) InsertRandom(c echo.Context) error {
	n := generateNews()
	err := h.storage.AddNews(n)
	if err != nil {
		return c.String(http.StatusConflict, "KO, random")
	}
	return c.String(http.StatusOK, "OK, random")
}

func (h *handlers) NewsFeedWebSocketHandler(c echo.Context) error {
	websocket.Handler(func(ws *websocket.Conn) {
		defer ws.Close()

		if s == nil {
			return
		}

		firstTime := true

		for {
			// Write
			if firstTime || s.HasChanges() {
				firstTime = false
				h.logger.Println("there has been changes in the DB, write to socket")
				allNews := s.GetAllNews()
				msg, err := json.Marshal(allNews)
				if err != nil {
					h.logger.Printf("error writing to websocket: %s", err)
				}
				err = websocket.Message.Send(ws, string(msg))
				if err != nil {
					h.logger.Printf("error sending message in websocket: %s", err)
				}
			}
			// Read
			msg := ""
			err := websocket.Message.Receive(ws, &msg)
			if err != nil {
				h.logger.Printf("error reading from websocket: %s", err)
				return
			}
			if msg == "ping" {
				err = websocket.Message.Send(ws, "pong")
				if err != nil {
					h.logger.Printf("error sending message in websocket: %s", err)
				}
			}
		}
	}).ServeHTTP(c.Response(), c.Request())
	return nil
}
