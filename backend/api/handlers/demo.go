package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vietbui/chat-quality-agent/api/middleware"
	"github.com/vietbui/chat-quality-agent/db"
	"github.com/vietbui/chat-quality-agent/db/models"
)

// GetDemoStatus returns whether tenant has data and if it's demo data.
func GetDemoStatus(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)

	var channelCount int64
	db.DB.Model(&models.Channel{}).Where("tenant_id = ?", tenantID).Count(&channelCount)

	var tenant models.Tenant
	db.DB.Where("id = ?", tenantID).First(&tenant)
	isDemo := false
	if tenant.Settings != "" {
		var s map[string]interface{}
		if json.Unmarshal([]byte(tenant.Settings), &s) == nil {
			if v, ok := s["is_demo_data"]; ok {
				isDemo, _ = v.(bool)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"has_data": channelCount > 0,
		"is_demo":  isDemo,
	})
}

// ResetDemoData deletes all tenant data except users.
func ResetDemoData(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)

	// Check demo flag
	var tenant models.Tenant
	if err := db.DB.Where("id = ?", tenantID).First(&tenant).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "tenant_not_found"})
		return
	}
	isDemo := false
	if tenant.Settings != "" {
		var s map[string]interface{}
		if json.Unmarshal([]byte(tenant.Settings), &s) == nil {
			isDemo, _ = s["is_demo_data"].(bool)
		}
	}
	if !isDemo {
		c.JSON(http.StatusBadRequest, gin.H{"error": "not_demo_data"})
		return
	}

	tx := db.DB.Begin()

	// Delete in dependency order
	tx.Where("tenant_id = ?", tenantID).Delete(&models.Message{})
	tx.Where("tenant_id = ?", tenantID).Delete(&models.JobResult{})
	tx.Where("tenant_id = ?", tenantID).Delete(&models.AIUsageLog{})
	tx.Where("tenant_id = ?", tenantID).Delete(&models.NotificationLog{})
	tx.Where("tenant_id = ?", tenantID).Delete(&models.ActivityLog{})
	tx.Where("tenant_id = ?", tenantID).Delete(&models.JobRun{})
	tx.Where("tenant_id = ?", tenantID).Delete(&models.Job{})
	tx.Where("tenant_id = ?", tenantID).Delete(&models.Conversation{})
	tx.Where("tenant_id = ?", tenantID).Delete(&models.AppSetting{})
	tx.Where("tenant_id = ?", tenantID).Delete(&models.Channel{})

	// Clear demo flag
	tx.Model(&models.Tenant{}).Where("id = ?", tenantID).Update("settings", "{}")

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "All demo data deleted"})
}
