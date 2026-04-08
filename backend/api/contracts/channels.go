package contracts

type PersonalZaloAccountOwner struct {
	AccountExternalID string `json:"account_external_id,omitempty"`
	UserID            string `json:"user_id"`
	UserName          string `json:"user_name,omitempty"`
	UserEmail         string `json:"user_email,omitempty"`
}

type UpdatePersonalZaloAccountOwnersRequest struct {
	AccountOwners []PersonalZaloAccountOwner `json:"account_owners"`
}
