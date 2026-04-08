package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

var openAIHTTPClient = NewHTTPClientWithTimeout()

type OpenAIProvider struct {
	apiKey  string
	model   string
	baseURL string
}

func NewOpenAIProvider(apiKey, model, baseURL string) *OpenAIProvider {
	if model == "" {
		model = "gpt-5.4-mini"
	}
	return &OpenAIProvider{
		apiKey:  apiKey,
		model:   model,
		baseURL: strings.TrimRight(baseURL, "/"),
	}
}

func (o *OpenAIProvider) AnalyzeChat(ctx context.Context, systemPrompt string, chatTranscript string) (AIResponse, error) {
	return withRetry(ctx, "openai", func() (AIResponse, error) {
		reqBody := map[string]interface{}{
			"model": o.model,
			"messages": []map[string]string{
				{"role": "system", "content": systemPrompt},
				{"role": "user", "content": chatTranscript},
			},
		}

		payload, err := json.Marshal(reqBody)
		if err != nil {
			return AIResponse{}, fmt.Errorf("openai marshal request failed: %w", err)
		}

		req, err := http.NewRequestWithContext(ctx, http.MethodPost, o.chatCompletionsURL(), bytes.NewReader(payload))
		if err != nil {
			return AIResponse{}, fmt.Errorf("openai create request failed: %w", err)
		}
		req.Header.Set("Authorization", "Bearer "+o.apiKey)
		req.Header.Set("Content-Type", "application/json")

		resp, err := openAIHTTPClient.Do(req)
		if err != nil {
			return AIResponse{}, fmt.Errorf("openai request failed: %w", err)
		}
		defer resp.Body.Close()

		body, _ := io.ReadAll(resp.Body)
		if resp.StatusCode >= 400 {
			return AIResponse{}, fmt.Errorf("openai api error %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
		}

		var parsed struct {
			Model   string `json:"model"`
			Choices []struct {
				Message struct {
					Content string `json:"content"`
				} `json:"message"`
			} `json:"choices"`
			Usage struct {
				PromptTokens     int `json:"prompt_tokens"`
				CompletionTokens int `json:"completion_tokens"`
			} `json:"usage"`
		}
		if err := json.Unmarshal(body, &parsed); err != nil {
			return AIResponse{}, fmt.Errorf("openai parse response failed: %w", err)
		}
		if len(parsed.Choices) == 0 || strings.TrimSpace(parsed.Choices[0].Message.Content) == "" {
			return AIResponse{}, fmt.Errorf("openai api returned empty content")
		}

		model := parsed.Model
		if model == "" {
			model = o.model
		}

		return AIResponse{
			Content:      parsed.Choices[0].Message.Content,
			InputTokens:  parsed.Usage.PromptTokens,
			OutputTokens: parsed.Usage.CompletionTokens,
			Model:        model,
			Provider:     "openai",
		}, nil
	})
}

func (o *OpenAIProvider) AnalyzeChatBatch(ctx context.Context, systemPrompt string, items []BatchItem) (AIResponse, error) {
	batchPrompt := WrapBatchPrompt(systemPrompt, len(items))
	batchTranscript := FormatBatchTranscript(items)
	return o.AnalyzeChat(ctx, batchPrompt, batchTranscript)
}

func (o *OpenAIProvider) chatCompletionsURL() string {
	base := o.baseURL
	if base == "" {
		base = "https://api.openai.com/v1"
	}
	if strings.HasSuffix(base, "/chat/completions") {
		return base
	}
	return base + "/chat/completions"
}
