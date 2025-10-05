package handlers

import (
	"net/http"
	"strings"

	"backend/models"
	"backend/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type RegisterInput struct {
	Login           string `json:"login"`
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirm_password"`
	Role            uint   `json:"role"` // 1-user, 2-manager, 3-enginer
}

type LoginInput struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

// Register handler
func Register(c *fiber.Ctx) error {
	var input RegisterInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Sanitize
	input.Login = strings.TrimSpace(input.Login)
	input.Password = strings.TrimSpace(input.Password)
	input.ConfirmPassword = strings.TrimSpace(input.ConfirmPassword)

	// Validate passwords match
	if input.Password != input.ConfirmPassword {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Passwords do not match"})
	}

	// Check if user exists
	var existingUser models.User
	result := models.DB.Where("login = ?", input.Login).First(&existingUser)
	if result.Error == nil {
		return c.Status(http.StatusConflict).JSON(fiber.Map{"error": "User with this login already exists"})
	} else if result.Error != gorm.ErrRecordNotFound {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	// Create user
	user := models.User{
		Login:    input.Login,
		Password: input.Password,
		Role:     input.Role,
	}

	if err := user.HashPassword(); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to hash password"})
	}

	if err := models.DB.Create(&user).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create user"})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{"message": "User registered successfully"})
}

// Login handler
func Login(c *fiber.Ctx) error {
	var input LoginInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Sanitize
	input.Login = strings.TrimSpace(input.Login)
	input.Password = strings.TrimSpace(input.Password)

	// Find user
	var user models.User
	if err := models.DB.Where("login = ?", input.Login).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid login or password"})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid login or password"})
	}

	// Generate tokens
	accessToken, err := utils.GenerateToken(user)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate access token"})
	}
	refreshToken, err := utils.GenerateRefreshToken(user)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate refresh token"})
	}

	// send token json
	return c.JSON(fiber.Map{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	})
}

// Refresh handler
func Refresh(c *fiber.Ctx) error {
	refreshTokenStr := utils.GetTokenFromRequest(c)
	if refreshTokenStr == "" {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Missing refresh token"})
	}

	// Parse and validate refresh token
	token, err := utils.GetToken(c)
	if err != nil || !token.Valid {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid refresh token"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
	}

	userIDFloat, ok := claims["id"].(float64)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Cannot get user ID"})
	}
	userID := uint(userIDFloat)

	// Find user by ID
	var user models.User
	if err := models.DB.First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "User not found"})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	// Generate new access token
	accessToken, err := utils.GenerateToken(user)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate new access token"})
	}

	return c.JSON(fiber.Map{"access_token": accessToken})
}

// GetUserInfo handler
func GetUserInfo(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	role := c.Locals("role").(uint)

	var user models.User
	if err := models.DB.First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	return c.JSON(fiber.Map{
		"login": user.Login,
		"role":  role,
	})
}
