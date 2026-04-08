# Thiết lập ban đầu

Sau khi cài đặt xong, bạn cần thực hiện các bước thiết lập ban đầu.

## Bước 1: Tạo tài khoản admin

Mở trình duyệt, truy cập URL CQA (ví dụ `http://<IP-VPS>` hoặc `https://cqa.yourdomain.com`).

Lần đầu tiên, bạn sẽ thấy trang **Thiết lập ban đầu**:

![Trang Setup](/screenshots/setup.png)

1. Nhập **Email** — email đăng nhập admin
2. Nhập **Tên hiển thị** (không bắt buộc)
3. Nhập **Mật khẩu** — tối thiểu 8 ký tự, có chữ hoa và số
4. **Nhập lại mật khẩu** để xác nhận
5. Bấm **Tạo tài khoản**

Sau khi tạo xong, hệ thống tự đăng nhập và chuyển bạn đến trang chính.

::: info Lưu ý
Trang Setup chỉ hiện **1 lần duy nhất** khi hệ thống chưa có user nào. Sau khi tạo admin, trang này sẽ không còn truy cập được.
:::

## Bước 2: Tạo công ty

Sau khi đăng nhập, bạn sẽ thấy trang **Công ty** (trống). Bấm **Thêm công ty**:

1. Nhập **Tên công ty** (2-100 ký tự)
2. **Slug** tự động tạo từ tên (dùng cho URL, chỉ chứa a-z, 0-9, dấu gạch ngang)
3. Bấm **Lưu**

Bấm vào card công ty vừa tạo để vào Dashboard.

## Bước 3: Cấu hình chung

Vào menu **Cài đặt** (icon cog ở sidebar) > tab **Cấu hình chung**:

- **Tên công ty**: Hiển thị trên giao diện
- **Múi giờ**: Chọn múi giờ phù hợp (mặc định: Asia/Ho_Chi_Minh)
- **Ngôn ngữ**: Tiếng Việt hoặc English
- **Tỉ giá USD → VND**: Dùng để quy đổi chi phí AI sang VND (mặc định: 26,000)

Bấm **Lưu cấu hình**.

## Bước 4: Cấu hình AI

Vào menu **Cài đặt** > tab **Cấu hình AI**:

1. **Chọn AI Provider**: Claude (Anthropic), Gemini (Google) hoặc OpenAI (Codex)
2. **Chọn Model**:
   - Claude: Sonnet 4.6 (khuyến nghị), Haiku 4.5 (rẻ), Opus 4 (mạnh nhất)
   - Gemini: Flash 2.0 (rẻ), Pro 2.5 (mạnh)
   - OpenAI: GPT-5.4 Mini (khuyến nghị), GPT-5.3-Codex, GPT-5.3 Chat, GPT-5 Mini, GPT-5 Nano
3. **Nhập API Key**: Lấy từ [console.anthropic.com](https://console.anthropic.com) (Claude), [aistudio.google.com](https://aistudio.google.com) (Gemini) hoặc [platform.openai.com](https://platform.openai.com) (OpenAI)
4. Bấm **Test API Key** để kiểm tra — nếu hiện tick xanh là OK
5. Bấm **Lưu cấu hình**

### Bật Batch Mode (khuyến nghị)

Batch mode gom nhiều cuộc chat vào 1 lần gọi AI, tiết kiệm 60-80% chi phí.

1. Bật **Chế độ Batch**
2. Chọn **Batch Size**: Số cuộc chat gom lại mỗi lần gọi AI
   - **5** (khuyến nghị cho bắt đầu)
   - **10** (tối ưu chi phí, phù hợp khi đã quen)
   - Số lớn hơn tiết kiệm hơn nhưng nếu lỗi thì mất nhiều hơn
3. Bấm **Lưu cấu hình**

## Bước 5: Kết nối kênh chat

Đây là bước quan trọng nhất. Xem hướng dẫn chi tiết tại [Kết nối kênh chat](/usage/channels).

## Tóm tắt luồng thiết lập

```
Cài đặt → Tạo admin → Tạo công ty → Cấu hình chung → Cấu hình AI
→ Kết nối kênh → Đồng bộ tin nhắn → Tạo công việc → Xem kết quả
```

## Bước tiếp theo

- [Cấu hình AI chi tiết](/usage/ai-settings) — So sánh Claude/Gemini/OpenAI, Batch mode
- [Kết nối kênh chat](/usage/channels) — Hướng dẫn kết nối Zalo OA, Facebook
