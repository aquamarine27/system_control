package models

import (
	"time"

	"gorm.io/gorm"
)

// Defect struct
type Defect struct {
	gorm.Model
	ProjectID   uint       `gorm:"not null;index" json:"project_id"`
	Title       string     `gorm:"not null" json:"title"`
	Description string     `json:"description"`
	Status      uint       `gorm:"not null" json:"status"` // 1 - open, 2 - in progress, 3 - resolved
	CreatedBy   uint       `gorm:"not null;index" json:"created_by"`
	Deadline    *time.Time `json:"deadline,omitempty"`
	ImageURL    string     `json:"image_url"`
}
