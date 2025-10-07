package handlers

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CreateDefectInput struct {
	Title       string `json:"title" form:"title"`
	Description string `json:"description" form:"description"`
	ProjectID   uint   `json:"project_id" form:"project_id"`
}

type UpdateDefectInput struct {
	Title       string     `json:"title" form:"title"`
	Description string     `json:"description" form:"description"`
	Status      *uint      `json:"status" form:"status"`
	Deadline    *time.Time `json:"deadline" form:"deadline"`
}

// CreateDefect handler
func CreateDefect(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var input CreateDefectInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request: " + err.Error()})
	}

	var project models.Project
	if err := models.DB.First(&project, input.ProjectID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Project not found"})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	var imageURL string
	file, err := c.FormFile("image")
	if err == nil {
		uploadDir, err := filepath.Abs("./upload")
		if err != nil {
			log.Printf("Failed to resolve absolute path for upload directory: %v", err)
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to resolve upload directory path"})
		}

		if err := os.MkdirAll(uploadDir, 0755); err != nil {
			log.Printf("Failed to create upload directory %s: %v", uploadDir, err)
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create upload directory: " + err.Error()})
		}

		ext := filepath.Ext(file.Filename)
		filename := uuid.New().String() + ext
		filePath := filepath.Join(uploadDir, filename)
		if err := c.SaveFile(file, filePath); err != nil {
			log.Printf("Failed to save image to %s: %v", filePath, err)
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save image: " + err.Error()})
		}
		imageURL = "/upload/" + filename
	}

	defect := models.Defect{
		ProjectID:   input.ProjectID,
		Title:       input.Title,
		Description: input.Description,
		Status:      1,
		CreatedBy:   userID,
		ImageURL:    imageURL,
	}

	if err := models.DB.Create(&defect).Error; err != nil {
		log.Printf("Failed to create defect: %v", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create defect"})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"message": "Defect created successfully",
		"defect":  defect,
	})
}

// GetDefects handler
func GetDefects(c *fiber.Ctx) error {
	projectIDStr := c.Query("project_id")
	if projectIDStr == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "project_id is required"})
	}
	projectID, err := strconv.ParseUint(projectIDStr, 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid project_id"})
	}

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	search := c.Query("search", "")

	if page < 1 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid page number"})
	}
	if limit < 1 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid limit value"})
	}

	offset := (page - 1) * limit
	var defects []models.Defect
	var total int64

	query := models.DB.Where("project_id = ?", projectID)
	if search != "" {
		query = query.Where("title ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Model(&models.Defect{}).Count(&total).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	if err := query.Offset(offset).Limit(limit).Find(&defects).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	// status
	statusCounts := make(map[uint]int64)
	models.DB.Model(&models.Defect{}).Where("project_id = ?", projectID).
		Select("status, COUNT(*) as count").
		Group("status").
		Scan(&statusCounts)

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"defects": defects,
		"pagination": fiber.Map{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": (total + int64(limit) - 1) / int64(limit),
		},
		"status_counts": statusCounts,
	})
}

// GetDefect handler
func GetDefect(c *fiber.Ctx) error {
	defectID := c.Params("defect_id")
	var defect models.Defect
	if err := models.DB.First(&defect, defectID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Defect not found"})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"defect": defect})
}

// UpdateDefect handler
func UpdateDefect(c *fiber.Ctx) error {
	defectID := c.Params("defect_id")
	var defect models.Defect
	if err := models.DB.First(&defect, defectID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Defect not found"})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	var input UpdateDefectInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request: " + err.Error()})
	}

	updates := make(map[string]interface{})
	if input.Title != "" {
		updates["title"] = input.Title
	}
	if input.Description != "" {
		updates["description"] = input.Description
	}
	if input.Status != nil {
		updates["status"] = *input.Status
	}
	if input.Deadline != nil {
		updates["deadline"] = input.Deadline
	}

	file, err := c.FormFile("image")
	if err == nil {
		uploadDir, err := filepath.Abs("./upload")
		if err != nil {
			log.Printf("Failed to resolve absolute path for upload directory: %v", err)
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to resolve upload directory path"})
		}

		if err := os.MkdirAll(uploadDir, 0755); err != nil {
			log.Printf("Failed to create upload directory %s: %v", uploadDir, err)
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create upload directory: " + err.Error()})
		}

		ext := filepath.Ext(file.Filename)
		filename := uuid.New().String() + ext
		filePath := filepath.Join(uploadDir, filename)
		if err := c.SaveFile(file, filePath); err != nil {
			log.Printf("Failed to save image to %s: %v", filePath, err)
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save image: " + err.Error()})
		}
		updates["image_url"] = "/upload/" + filename
	}

	if len(updates) == 0 {
		return c.Status(http.StatusOK).JSON(fiber.Map{"message": "No changes provided"})
	}

	if err := models.DB.Model(&defect).Updates(updates).Error; err != nil {
		log.Printf("Failed to update defect: %v", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update defect"})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Defect updated successfully",
		"defect":  defect,
	})
}

// DeleteDefect handler
func DeleteDefect(c *fiber.Ctx) error {
	defectID := c.Params("defect_id")
	log.Printf("Attempting to delete defect with ID: %s", defectID)
	result := models.DB.Unscoped().Delete(&models.Defect{}, defectID)
	if result.Error != nil {
		log.Printf("Database error deleting defect %s: %v", defectID, result.Error)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}
	if result.RowsAffected == 0 {
		log.Printf("No defect found with ID: %s", defectID)
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Defect not found"})
	}

	log.Printf("Defect with ID %s deleted successfully", defectID)
	return c.Status(http.StatusOK).JSON(fiber.Map{"message": "Defect deleted successfully"})
}
