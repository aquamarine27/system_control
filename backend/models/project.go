package models

import "gorm.io/gorm"

// Project struct
type Project struct {
	gorm.Model
	Title  string `json:"title"`
	UserID uint   `gorm:"index"`
}
