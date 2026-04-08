package contracts

import "time"

type PersonalZaloImportCredentials struct {
	ImportSecret string `json:"import_secret"`
}

type ImportAttachment struct {
	Type      string `json:"type" binding:"required"`
	URL       string `json:"url"`
	Name      string `json:"name"`
	LocalPath string `json:"local_path"`
}

type ImportConversation struct {
	ExternalID     string                 `json:"external_id" binding:"required"`
	ThreadType     string                 `json:"thread_type" binding:"required,oneof=user group"`
	ExternalUserID string                 `json:"external_user_id"`
	CustomerName   string                 `json:"customer_name"`
	LastMessageAt  time.Time              `json:"last_message_at" binding:"required"`
	Metadata       map[string]interface{} `json:"metadata"`
}

type ImportMessage struct {
	ExternalID  string                 `json:"external_id" binding:"required"`
	SenderType  string                 `json:"sender_type" binding:"required,oneof=customer agent system"`
	SenderName  string                 `json:"sender_name"`
	Content     string                 `json:"content"`
	ContentType string                 `json:"content_type"`
	Attachments []ImportAttachment     `json:"attachments"`
	SentAt      time.Time              `json:"sent_at" binding:"required"`
	RawData     map[string]interface{} `json:"raw_data"`
}

type ImportConversationBundle struct {
	Conversation ImportConversation `json:"conversation" binding:"required"`
	Messages     []ImportMessage    `json:"messages" binding:"required"`
}

type PersonalZaloImportRequest struct {
	SchemaVersion     string                     `json:"schema_version" binding:"required"`
	RequestID         string                     `json:"request_id" binding:"required"`
	TenantID          string                     `json:"tenant_id" binding:"required"`
	ChannelID         string                     `json:"channel_id" binding:"required"`
	AccountExternalID string                     `json:"account_external_id"`
	ImportedAt        time.Time                  `json:"imported_at" binding:"required"`
	Conversations     []ImportConversationBundle `json:"conversations" binding:"required,min=1"`
}
