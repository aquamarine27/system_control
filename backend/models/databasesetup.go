package models

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Setup() error {
	baseDSN := os.Getenv("DATABASE_URL")
	if baseDSN == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}
	db, err := sql.Open("postgres", "postgres://postgres:12345@localhost:5432/?sslmode=disable")
	if err != nil {
		log.Fatal("Cannot connect to postgres server:", err)
	}
	defer db.Close()

	dbName := "control_system"
	_, err = db.Exec("CREATE DATABASE " + dbName + " WITH OWNER postgres")
	if err != nil {

		if err.Error() != "pq: database "+dbName+" already exists" {
			log.Fatal("Failed to create database:", err)
		}
	}

	// connected db
	dsn := "postgres://postgres:12345@localhost:5432/control_system?sslmode=disable"
	dbGorm, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		log.Fatal("Cannot connect to the database:", err)
	}

	if err := dbGorm.AutoMigrate(&User{}, &Project{}); err != nil {
		log.Fatal("Auto migration failed:", err)
	}

	DB = dbGorm
	log.Println("Successfully connected to database")
	return nil
}
