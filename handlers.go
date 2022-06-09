package main

import (
	"encoding/json"
	"github.com/labstack/echo/v4"
	"golang.org/x/net/websocket"
	"log"
	"net/http"
	"time"
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

//type Handlers interface {
//	IndexPage(c echo.Context) error
//	NewsFeedWebSocketHandler(c echo.Context, db Storage) error
//}

func (h *handlers) IndexPage(c echo.Context) error {
	return c.Render(http.StatusOK, "newsfeed", "")
}

func (h *handlers) NewsFeedWebSocketHandler(c echo.Context) error {
	websocket.Handler(func(ws *websocket.Conn) {
		defer ws.Close()

		if s == nil {
			return
		}

		var notFirstTime bool
		for {
			if hasChanged, err := s.HasChanged(notFirstTime); err == nil && hasChanged {
				notFirstTime = true
				log.Println("there has been changes in the DB, write to socket")
				allNews := s.GetAllNews()
				msg, err := json.Marshal(allNews)
				if err != nil {
					c.Logger().Error(err)
				}
				err = websocket.Message.Send(ws, string(msg))
				if err != nil {
					c.Logger().Error(err)
				}
			}
			time.Sleep(time.Millisecond * 2000)
		}

		//for {
		// Write
		//err := websocket.Message.Send(ws, "Hello, Client!")
		//if err != nil {
		//	c.Logger().Error(err)
		//}

		// Read
		//msg := ""
		//err = websocket.Message.Receive(ws, &msg)
		//if err != nil {
		//	c.Logger().Error(err)
		//}
		//fmt.Printf("%s\n", msg)
		//}

	}).ServeHTTP(c.Response(), c.Request())
	return nil
}
