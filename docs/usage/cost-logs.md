# Chi phí AI

Mỗi lần gọi AI (Claude, Gemini hoặc OpenAI) để phân tích chat đều được ghi nhận chi phí. Vào menu **Chi phí AI** ở sidebar để theo dõi.

![Chi phí AI](/screenshots/chi-phi-ai.png)

## Bảng chi phí

| Cột | Mô tả |
|-----|-------|
| **Thời gian** | Thời điểm gọi API |
| **Provider** | Claude, Gemini hoặc OpenAI |
| **Model** | Model AI cụ thể (Sonnet 4.6, Flash 2.0...) |
| **Input Tokens** | Số token đầu vào (nội dung chat gửi cho AI) |
| **Output Tokens** | Số token đầu ra (kết quả AI trả về) |
| **Chi phí USD** | Chi phí tính bằng USD (4 chữ số thập phân) |
| **Chi phí VND** | Chi phí quy đổi sang VND (theo tỉ giá trong cấu hình) |

## Tổng chi phí

Cuối bảng hiển thị tổng cộng:
- Tổng chi phí USD
- Tổng chi phí VND

## Bộ lọc

| Bộ lọc | Mô tả |
|--------|-------|
| **Provider** | Lọc theo Claude, Gemini hoặc OpenAI |
| **Từ ngày** | Ngày bắt đầu |
| **Đến ngày** | Ngày kết thúc |

## Hiểu về token và chi phí

### Token là gì?

Token là đơn vị đo lường AI xử lý. Khoảng 1 token = 0.75 từ tiếng Việt (hoặc 4 ký tự).

### Bảng giá tham khảo

**Claude (Anthropic):**
| Model | Input ($/1M tokens) | Output ($/1M tokens) |
|-------|---------------------|----------------------|
| Sonnet 4.6 | $3.00 | $15.00 |
| Haiku 4.5 | $0.80 | $4.00 |
| Opus 4 | $15.00 | $75.00 |

**Gemini (Google):**
| Model | Input ($/1M tokens) | Output ($/1M tokens) |
|-------|---------------------|----------------------|
| Flash 2.0 | $0.075 | $0.30 |
| Pro 2.5 | $1.25 | $10.00 |

*Giá có thể thay đổi theo chính sách nhà cung cấp.*

### Tiết kiệm chi phí

1. **Bật Batch Mode** — tiết kiệm 60-80% (xem [Cấu hình AI](/usage/ai-settings))
2. **Dùng model rẻ hơn** — Haiku (Claude) hoặc Flash (Gemini) cho phân loại đơn giản
3. **Giới hạn số chat mỗi lần chạy** — dùng chế độ "Tùy chọn" khi chạy thủ công
4. **Viết điều kiện Skip tốt** — loại bỏ chat spam/rỗng trước khi gọi AI
