package main

import (
	"encoding/json"
	"github.com/labstack/echo/v4"
	"golang.org/x/net/websocket"
	"net/http"
	"time"
)

func Index(c echo.Context) error {
	return c.Render(http.StatusOK, "newsfeed", "")
}

func NewsFeedWebSocketHandler(c echo.Context, db Storage) error {
	websocket.Handler(func(ws *websocket.Conn) {
		defer ws.Close()

		if db == nil {
			return
		}

		var notFirstTime bool
		for {
			if hasChanged, err := db.HasChanged(notFirstTime); err == nil && hasChanged {
				notFirstTime = true
				allNews := db.GetAllNews()
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
