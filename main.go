package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/net/websocket"
)

func main() {
	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.GET("/ws", newsFeedWebSocketHandler)
	e.Logger.Fatal(e.Start(":1323"))

}

func newsFeedWebSocketHandler(c echo.Context) error {
	websocket.Handler(func(ws *websocket.Conn) {
		defer ws.Close()
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
