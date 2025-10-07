package routers

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/gofiber/fiber/v2"
)

func RegisterProjectRoutes(router fiber.Router) {
	projects := router.Group("/projects")
	projects.Use(middleware.JWTMiddleware)
	projects.Post("/", handlers.CreateProject)
	projects.Put("/:projectId", handlers.UpdateProject)
	projects.Get("/", handlers.GetProjects)
	projects.Get("/:projectId", handlers.GetProject)
}
