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

	// exist db
	dbName := "control_system"
	var exists bool
	err = db.QueryRow("SELECT EXISTS(SELECT datname FROM pg_database WHERE datname = $1)", dbName).Scan(&exists)
	if err != nil {
		log.Fatal("Failed to check database existence:", err)
	}

	if !exists {
		// if not exist - create db
		_, err = db.Exec("CREATE DATABASE " + dbName + " WITH OWNER postgres")
		if err != nil {
			log.Fatal("Failed to create database:", err)
		}
		log.Println("Database 'control_system' created successfully")
	}

	// connected to db
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
