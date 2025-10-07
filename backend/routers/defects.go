package routers

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/gofiber/fiber/v2"
)

func RegisterDefectsRoutes(router fiber.Router) {
	defects := router.Group("/defects")
	defects.Use(middleware.JWTMiddleware)

	defects.Post("/", handlers.CreateDefect)
	defects.Get("/", handlers.GetDefects)
	defects.Get("/:defect_id", handlers.GetDefect)
	defects.Patch("/:defect_id", handlers.UpdateDefect)
	defects.Delete("/:defect_id", handlers.DeleteDefect)
}
