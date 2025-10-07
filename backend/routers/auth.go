package routers

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/gofiber/fiber/v2"
)

func RegisterAuthRoutes(router fiber.Router) {
	router.Post("/register", handlers.Register)
	router.Post("/login", handlers.Login)
	router.Post("/refresh", handlers.Refresh)
	router.Get("/user-info", middleware.JWTMiddleware, handlers.GetUserInfo)
	router.Post("/update-password", handlers.UpdatePassword)
}
