package service

import (
	"context"
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type DatabaseService struct {
	DB  *sql.DB
	Ctx context.Context
}

func NewDatabaseService(ctx context.Context) *DatabaseService {
	return &DatabaseService{Ctx: ctx}
}

func (d *DatabaseService) InitDatabase() error {
	var err error
	d.DB, err = sql.Open("sqlite3", "./database.db")
	if err != nil {
		runtime.LogError(d.Ctx, fmt.Sprintf("Failed to open database: %v", err))
		return fmt.Errorf("failed to open database: %w", err)
	}
	createTableSQL := `
	CREATE TABLE IF NOT EXISTS products (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		price REAL NOT NULL,
		category TEXT,
		stock INTEGER DEFAULT 0,
		description TEXT,
		image_url TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP
	);`

	_, err = d.DB.Exec(createTableSQL)
	if err != nil {
		return fmt.Errorf("failed to create products table: %w", err)
	}
	runtime.LogInfo(d.Ctx, "SQLite database and 'products' table initialized successfully!")
	return nil
}

func (d *DatabaseService) CloseDatabase() {
	if d.DB != nil {
		d.DB.Close()
		runtime.LogInfo(d.Ctx, "Database connection closed.")
	}
}

func (d *DatabaseService) HealthCheck() error {
	if d.DB == nil {
		runtime.LogError(d.Ctx, "Database connection not established")
		return fmt.Errorf("database connection not established")
	}

	if err := d.DB.Ping(); err != nil {
		runtime.LogError(d.Ctx, fmt.Sprintf("Database connection is not healthy: %v", err))
		return fmt.Errorf("database connection is not healthy: %w", err)
	}

	runtime.LogInfo(d.Ctx, "Database connection is healthy.")
	return nil
}
