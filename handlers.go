package main

import (
	"encoding/json"
	"github.com/labstack/echo/v4"
	"golang.org/x/net/websocket"
	"net/http"
)

func Index(c echo.Context) error {
	return c.Render(http.StatusOK, "newsfeed", "")
}

func NewsFeedWebSocketHandler(c echo.Context) error {
	websocket.Handler(func(ws *websocket.Conn) {
		defer ws.Close()

		msg, err := json.Marshal(news)
		if err != nil {
			c.Logger().Error(err)
		}
		err = websocket.Message.Send(ws, string(msg))
		if err != nil {
			c.Logger().Error(err)
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
