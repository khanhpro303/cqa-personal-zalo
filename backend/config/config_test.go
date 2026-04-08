package config

import (
	"os"
	"testing"
)

func TestLoadConfig(t *testing.T) {
	// Set required env vars
	os.Setenv("JWT_SECRET", "test-jwt-secret-at-least-32-chars-long")
	os.Setenv("ENCRYPTION_KEY", "12345678901234567890123456789012")
	os.Setenv("DB_PASSWORD", "testpassword")
	defer func() {
		os.Unsetenv("JWT_SECRET")
		os.Unsetenv("ENCRYPTION_KEY")
		os.Unsetenv("DB_PASSWORD")
	}()

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load failed: %v", err)
	}

	if cfg.ServerPort != "8080" {
		t.Errorf("Default ServerPort should be 8080, got %s", cfg.ServerPort)
	}
	if cfg.DBName != "cqa" {
		t.Errorf("Default DBName should be cqa, got %s", cfg.DBName)
	}
	if cfg.InternalImportSecret != cfg.JWTSecret {
		t.Errorf("InternalImportSecret should default to JWTSecret")
	}
}

func TestLoadConfigMissingRequired(t *testing.T) {
	os.Unsetenv("JWT_SECRET")
	os.Unsetenv("ENCRYPTION_KEY")
	os.Unsetenv("DB_PASSWORD")

	_, err := Load()
	if err == nil {
		t.Fatal("Load should fail with missing required vars")
	}
}

func TestDSN(t *testing.T) {
	cfg := &Config{
		DBUser:     "testuser",
		DBPassword: "testpass",
		DBHost:     "localhost",
		DBPort:     "3306",
		DBName:     "testdb",
	}
	dsn := cfg.DSN()
	expected := "testuser:testpass@tcp(localhost:3306)/testdb?charset=utf8mb4&parseTime=True&loc=Local"
	if dsn != expected {
		t.Errorf("DSN = %q, want %q", dsn, expected)
	}
}

func TestIsProduction(t *testing.T) {
	cfg := &Config{Env: "production"}
	if !cfg.IsProduction() {
		t.Error("Should be production")
	}

	cfg.Env = "development"
	if cfg.IsProduction() {
		t.Error("Should not be production")
	}
}
