package handlers

import (
	"net/http"
	"strings"

	"backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type CreateProjectInput struct {
	Title       string `json:"title" binding:"required,min=3"`
	Description string `json:"description"`
}

type UpdateProjectInput struct {
	Title       string `json:"title" binding:"omitempty,min=3"`
	Description string `json:"description" binding:"omitempty"`
}

// CreateProject handler
func CreateProject(c *fiber.Ctx) error {
	var input CreateProjectInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	input.Title = strings.TrimSpace(input.Title)
	input.Description = strings.TrimSpace(input.Description)

	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	// Check if project with the same title exists
	var existingProject models.Project
	if err := models.DB.Where("title = ?", input.Title).First(&existingProject).Error; err == nil {
		return c.Status(http.StatusConflict).JSON(fiber.Map{"error": "Project with this title already exists"})
	}

	project := models.Project{
		Title:       input.Title,
		Description: input.Description,
		UserID:      userID,
	}

	if err := models.DB.Create(&project).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create project"})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"message":    "Project created successfully",
		"project_id": project.ID,
	})
}

// UpdateProject handler
func UpdateProject(c *fiber.Ctx) error {
	var input UpdateProjectInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	input.Title = strings.TrimSpace(input.Title)
	input.Description = strings.TrimSpace(input.Description)

	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	// Get project ID from URL
	projectID := c.Params("projectId")
	var project models.Project
	if err := models.DB.First(&project, projectID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Project not found"})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	// Check if the user is the owner
	if project.UserID != userID {
		return c.Status(http.StatusForbidden).JSON(fiber.Map{"error": "You can only edit your own projects"})
	}

	// Prepare updates
	updates := make(map[string]interface{})
	if input.Title != "" {
		// Check for duplicate title
		var existingProject models.Project
		if err := models.DB.Where("title = ? AND id != ?", input.Title, projectID).First(&existingProject).Error; err == nil {
			return c.Status(http.StatusConflict).JSON(fiber.Map{"error": "Project with this title already exists"})
		}
		updates["title"] = input.Title
	}
	if input.Description != "" {
		updates["description"] = input.Description
	}

	if len(updates) == 0 {
		return c.Status(http.StatusOK).JSON(fiber.Map{"message": "No changes provided"})
	}

	// Update project
	if err := models.DB.Model(&project).Updates(updates).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update project"})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Project updated successfully",
		"project": project,
	})
}

// GetProjects handler
func GetProjects(c *fiber.Ctx) error {

	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 4)
	search := strings.TrimSpace(c.Query("search", ""))

	if page < 1 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid page number"})
	}
	if limit < 1 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid limit value"})
	}

	offset := (page - 1) * limit
	var projects []models.Project
	var total int64

	query := models.DB.Where("user_id = ?", userID)
	if search != "" {
		query = query.Where("title ILIKE ?", "%"+search+"%")
	}

	if err := query.Model(&models.Project{}).Count(&total).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	if err := query.Offset(offset).Limit(limit).Find(&projects).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"projects": projects,
		"pagination": fiber.Map{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (total + int64(limit) - 1) / int64(limit),
		},
	})
}

// GetProject handler
func GetProject(c *fiber.Ctx) error {

	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	projectID := c.Params("projectId")
	var project models.Project
	if err := models.DB.First(&project, projectID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Project not found"})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	// Check if the user is the owner
	if project.UserID != userID {
		return c.Status(http.StatusForbidden).JSON(fiber.Map{"error": "You can only view your own projects"})
	}

	return c.Status(http.StatusOK).JSON(project)
}
