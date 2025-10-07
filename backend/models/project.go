package models

import "gorm.io/gorm"

// Project struct
type Project struct {
	gorm.Model
	Title       string   `gorm:"not null" json:"title"`
	Description string   `json:"description"`
	UserID      uint     `gorm:"index" json:"user_id"`
	Defects     []Defect `gorm:"foreignKey:ProjectID" json:"defects"`
}

// Defect struct
type Defect struct {
	gorm.Model
	ProjectID uint   `gorm:"not null" json:"project_id"`
	Title     string `json:"title"`
}
