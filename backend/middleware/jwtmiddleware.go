package middleware

import (
	"net/http"

	"backend/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func JWTMiddleware(c *fiber.Ctx) error {
	err := utils.ValidateToken(c)
	if err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "wrong token"})
	}

	token, err := utils.GetToken(c)
	if err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Token parsing error"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Dead token"})
	}

	userIDFloat, ok := claims["id"].(float64)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "cannot get user id"})
	}
	userID := uint(userIDFloat)

	roleFloat, ok := claims["role"].(float64)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "cannot get user role"})
	}
	role := uint(roleFloat)

	c.Locals("user_id", userID)
	c.Locals("role", role)
	return c.Next()
}
