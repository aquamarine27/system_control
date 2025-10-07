package handlers

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
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
	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	title := strings.TrimSpace(c.FormValue("title"))
	description := strings.TrimSpace(c.FormValue("description"))

	if title == "" || len(title) < 3 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Title is required and must be at least 3 characters"})
	}

	// Check if project with the same title exists
	var existingProject models.Project
	if err := models.DB.Where("title = ?", title).First(&existingProject).Error; err == nil {
		return c.Status(http.StatusConflict).JSON(fiber.Map{"error": "Project with this title already exists"})
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

		if err := checkDirectoryPermissions(uploadDir); err != nil {
			log.Printf("Directory permission error for %s: %v", uploadDir, err)
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Directory permission error: " + err.Error()})
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

	project := models.Project{
		Title:       title,
		Description: description,
		UserID:      userID,
		ImageURL:    imageURL,
	}

	if err := models.DB.Create(&project).Error; err != nil {
		log.Printf("Failed to create project in database: %v", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create project: " + err.Error()})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"message":    "Project created successfully",
		"project_id": project.ID,
	})
}

// UpdateProject handler
func UpdateProject(c *fiber.Ctx) error {
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

	title := strings.TrimSpace(c.FormValue("title"))
	description := strings.TrimSpace(c.FormValue("description"))

	// Prepare updates
	updates := make(map[string]interface{})
	if title != "" && len(title) >= 3 {
		// Check for duplicate title
		var existingProject models.Project
		if err := models.DB.Where("title = ? AND id != ?", title, projectID).First(&existingProject).Error; err == nil {
			return c.Status(http.StatusConflict).JSON(fiber.Map{"error": "Project with this title already exists"})
		}
		updates["title"] = title
	}
	if description != "" {
		updates["description"] = description
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

		if err := checkDirectoryPermissions(uploadDir); err != nil {
			log.Printf("Directory permission error for %s: %v", uploadDir, err)
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Directory permission error: " + err.Error()})
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

	// Update project
	if err := models.DB.Model(&project).Updates(updates).Error; err != nil {
		log.Printf("Failed to update project in database: %v", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update project: " + err.Error()})
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

// checkDirectoryPermissions
func checkDirectoryPermissions(dir string) error {
	info, err := os.Stat(dir)
	if err != nil {
		return err
	}

	if !info.IsDir() {
		return os.ErrInvalid
	}
	testFile := filepath.Join(dir, ".test_write")
	f, err := os.Create(testFile)
	if err != nil {
		return err
	}
	f.Close()
	return os.Remove(testFile)
}
