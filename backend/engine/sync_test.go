package engine

import (
	"context"
	"testing"

	"github.com/vietbui/chat-quality-agent/config"
	"github.com/vietbui/chat-quality-agent/db/models"
)

func TestSyncChannelSkipsExternallyManagedImportChannels(t *testing.T) {
	engine := NewSyncEngine(&config.Config{})

	err := engine.SyncChannel(context.Background(), models.Channel{
		ID:          "channel-1",
		Name:        "Personal Zalo Import",
		ChannelType: "personal_zalo_import",
	})
	if err != nil {
		t.Fatalf("SyncChannel should skip externally managed import channels without error: %v", err)
	}
}
