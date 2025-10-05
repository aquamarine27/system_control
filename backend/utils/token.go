package utils

import (
	"errors"
	"os"
	"strconv"
	"strings"
	"time"

	"backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// helper
func GetEnv(key string) string {
	return strings.TrimSpace(os.Getenv(key))
}

func GenerateToken(user models.User) (string, error) {
	lifespan, err := strconv.Atoi(GetEnv("TOKEN_MINUTE_LIFESPAN"))
	if err != nil {
		return "", err
	}

	claims := jwt.MapClaims{
		"authorized": true,
		"id":         user.ID,
		"role":       user.Role,
		"exp":        time.Now().Add(time.Minute * time.Duration(lifespan)).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(GetEnv("API_SECRET")))
}

func GenerateRefreshToken(user models.User) (string, error) {
	lifespan, err := strconv.Atoi(GetEnv("REFRESH_HOUR_LIFESPAN"))
	if err != nil {
		lifespan = 24
	}

	claims := jwt.MapClaims{
		"id":  user.ID,
		"exp": time.Now().Add(time.Hour * time.Duration(lifespan)).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(GetEnv("REFRESH_SECRET")))
}

func ValidateToken(c *fiber.Ctx) error {
	token, err := GetToken(c)
	if err != nil {
		return err
	}

	if _, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return nil
	}
	return errors.New("invalid token provided")
}

func GetToken(c *fiber.Ctx) (*jwt.Token, error) {
	tokenString := GetTokenFromRequest(c)
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}

		if c.Path() == "/api/v1/auth/refresh" {
			return []byte(GetEnv("REFRESH_SECRET")), nil
		}
		return []byte(GetEnv("API_SECRET")), nil
	})
	return token, err
}

func GetTokenFromRequest(c *fiber.Ctx) string {
	bearerToken := c.Get("Authorization")
	split := strings.Split(bearerToken, " ")
	if len(split) == 2 {
		return split[1]
	}
	return ""
}
