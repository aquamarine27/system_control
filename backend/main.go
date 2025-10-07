package main

import (
	"log"

	"backend/models"
	"backend/routers"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Setup database
	if err := models.Setup(); err != nil {
		log.Fatal("Failed to setup database:", err)
	}

	app := fiber.New()
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, http://localhost:5173",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowCredentials: true,
	}))

	// Static serving
	app.Static("/upload", "./upload")

	api := app.Group("/api/v1")
	auth := api.Group("/auth")

	//auth setup
	routers.RegisterAuthRoutes(auth)

	//projects setup
	routers.RegisterProjectRoutes(api)

	log.Fatal(app.Listen(":3000"))
}
