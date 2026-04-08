package handlers

import (
	"testing"
	"time"

	"github.com/vietbui/chat-quality-agent/api/contracts"
)

func TestToSyncedConversation(t *testing.T) {
	now := time.Now().UTC()
	conv := contracts.ImportConversation{
		ExternalID:     "conv-1",
		ThreadType:     "group",
		ExternalUserID: "user-1",
		CustomerName:   "Khach A",
		LastMessageAt:  now,
		Metadata: map[string]interface{}{
			"source": "personal_zalo",
		},
	}

	synced := toSyncedConversation(conv, "account-1", nil)
	if synced.ExternalID != "group:"+conv.ExternalID {
		t.Fatalf("expected composite external id %s, got %s", "group:"+conv.ExternalID, synced.ExternalID)
	}
	if synced.Metadata["thread_type"] != "group" {
		t.Fatalf("expected metadata thread_type to be group, got %v", synced.Metadata["thread_type"])
	}
	if synced.Metadata["account_external_id"] != "account-1" {
		t.Fatalf("expected metadata account_external_id to be preserved")
	}
}

func TestToSyncedConversationWithOwner(t *testing.T) {
	now := time.Now().UTC()
	conv := contracts.ImportConversation{
		ExternalID:     "conv-1",
		ThreadType:     "user",
		ExternalUserID: "user-1",
		CustomerName:   "Khach A",
		LastMessageAt:  now,
	}

	synced := toSyncedConversation(conv, "account-1", &contracts.PersonalZaloAccountOwner{
		AccountExternalID: "account-1",
		UserID:            "user-123",
		UserName:          "Leader A",
		UserEmail:         "leader@example.com",
	})
	if synced.ExternalID != "user:"+conv.ExternalID {
		t.Fatalf("expected composite external id %s, got %s", "user:"+conv.ExternalID, synced.ExternalID)
	}
	if synced.Metadata["owner_user_id"] != "user-123" {
		t.Fatalf("expected owner_user_id to be preserved")
	}
	if synced.Metadata["owner_name"] != "Leader A" {
		t.Fatalf("expected owner_name to be preserved")
	}
	if synced.Metadata["owner_email"] != "leader@example.com" {
		t.Fatalf("expected owner_email to be preserved")
	}
}

func TestToSyncedMessages(t *testing.T) {
	now := time.Now().UTC()
	messages := []contracts.ImportMessage{
		{
			ExternalID:  "msg-1",
			SenderType:  "agent",
			SenderName:  "Admin 1",
			Content:     "Xin chao",
			ContentType: "text",
			SentAt:      now,
			Attachments: []contracts.ImportAttachment{
				{
					Type:      "image",
					URL:       "https://example.com/a.jpg",
					Name:      "a.jpg",
					LocalPath: "tenant/conv/a.jpg",
				},
			},
			RawData: map[string]interface{}{
				"source": "gateway",
			},
		},
	}

	synced := toSyncedMessages(messages)
	if len(synced) != 1 {
		t.Fatalf("expected 1 message, got %d", len(synced))
	}
	if synced[0].ExternalID != "msg-1" {
		t.Fatalf("expected external id msg-1, got %s", synced[0].ExternalID)
	}
	if len(synced[0].Attachments) != 1 || synced[0].Attachments[0].LocalPath != "tenant/conv/a.jpg" {
		t.Fatalf("expected attachment local path to be preserved")
	}
}
