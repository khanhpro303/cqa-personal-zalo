package channels

import (
	"testing"
)

func TestNewAdapterZaloOA(t *testing.T) {
	creds := `{"app_id":"123","app_secret":"abc","access_token":"tok","refresh_token":"ref"}`
	adapter, err := NewAdapter("zalo_oa", []byte(creds))
	if err != nil {
		t.Fatalf("NewAdapter zalo_oa failed: %v", err)
	}
	if adapter == nil {
		t.Fatal("Adapter should not be nil")
	}
}

func TestNewAdapterFacebook(t *testing.T) {
	creds := `{"page_id":"123","access_token":"tok"}`
	adapter, err := NewAdapter("facebook", []byte(creds))
	if err != nil {
		t.Fatalf("NewAdapter facebook failed: %v", err)
	}
	if adapter == nil {
		t.Fatal("Adapter should not be nil")
	}
}

func TestNewAdapterUnsupported(t *testing.T) {
	_, err := NewAdapter("whatsapp", []byte("{}"))
	if err == nil {
		t.Fatal("Should fail for unsupported channel type")
	}
}

func TestNewAdapterInvalidJSON(t *testing.T) {
	_, err := NewAdapter("zalo_oa", []byte("not json"))
	if err == nil {
		t.Fatal("Should fail for invalid JSON")
	}
}

func TestSupportsPullSync(t *testing.T) {
	if !SupportsPullSync("zalo_oa") {
		t.Fatal("zalo_oa should support pull sync")
	}
	if !SupportsPullSync("facebook") {
		t.Fatal("facebook should support pull sync")
	}
	if SupportsPullSync("personal_zalo_import") {
		t.Fatal("personal_zalo_import should not support pull sync")
	}
}

func TestIsExternallyManagedImport(t *testing.T) {
	if !IsExternallyManagedImport("personal_zalo_import") {
		t.Fatal("personal_zalo_import should be marked as externally managed")
	}
	if IsExternallyManagedImport("facebook") {
		t.Fatal("facebook should not be marked as externally managed")
	}
}
