package channels

import (
	"encoding/json"
	"fmt"
)

// SupportsPullSync reports whether the core app should poll this channel type directly.
func SupportsPullSync(channelType string) bool {
	switch channelType {
	case "zalo_oa", "facebook":
		return true
	default:
		return false
	}
}

// IsExternallyManagedImport reports whether messages are pushed into the core app by another service.
func IsExternallyManagedImport(channelType string) bool {
	return channelType == "personal_zalo_import"
}

// NewAdapter creates a ChannelAdapter from channel type and decrypted credentials JSON.
func NewAdapter(channelType string, credentialsJSON []byte) (ChannelAdapter, error) {
	switch channelType {
	case "zalo_oa":
		var creds ZaloOACredentials
		if err := json.Unmarshal(credentialsJSON, &creds); err != nil {
			return nil, fmt.Errorf("invalid zalo_oa credentials: %w", err)
		}
		return NewZaloOAAdapter(creds), nil
	case "facebook":
		var creds FacebookCredentials
		if err := json.Unmarshal(credentialsJSON, &creds); err != nil {
			return nil, fmt.Errorf("invalid facebook credentials: %w", err)
		}
		return NewFacebookAdapter(creds), nil
	default:
		return nil, fmt.Errorf("unsupported channel type: %s", channelType)
	}
}
