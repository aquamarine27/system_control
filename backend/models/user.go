package models

import (
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Project struct {
	gorm.Model
	Title  string `json:"title"`
	UserID uint   `gorm:"index"`
}

type User struct {
	gorm.Model
	Login    string    `gorm:"unique;not null" json:"login"`
	Password string    `gorm:"not null" json:"password"`
	Role     uint      `gorm:"not null" json:"role"` // 1-user, 2-manager, 3-admin
	Projects []Project `gorm:"foreignKey:UserID" json:"projects"`
}

// HashPassword
func (u *User) HashPassword() error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	return nil
}
