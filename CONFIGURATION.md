# Cấu hình trang “Quán Mới”

Đọc file này **trước** khi sửa `config.*.json` hoặc nhờ AI chỉnh.

## Hai file dữ liệu

| File | Git | Mục đích |
|------|-----|----------|
| `public/config.example.json` | Commit | Cấu trúc + ví dụ công khai |
| `public/config.local.json` | **Không commit** (`.gitignore`) | Dữ liệu thật trên máy bạn |

Tạo local: copy `public/config.example.json` → `public/config.local.json`, rồi sửa.

## Cảnh báo Vercel & URL public

- Mọi file trong `public/` sau khi deploy là **URL tĩnh có thể truy cập** nếu project công khai.
- **Lương / chi phí** trên bản deploy công khai = mọi người có thể đọc. Gitignore chỉ bảo vệ **repo**, không ẩn file bạn tự upload lên hosting.
- Nếu cần giữ số nhạy cảm: Vercel **Deployment Protection**, project private, hoặc không đưa số thật vào file public.

## Định dạng nội dung

- `body` (bước, nhánh) là **plain text**. Xuống dòng dùng `\n` trong JSON.

## Schema tóm tắt

Root:

- `meta.venueName` (string, bắt buộc)
- `meta.subtitle` (string, tuỳ chọn)
- `steps` (mảng bước theo thứ tự)

Mỗi bước:

- `id` (string, duy nhất), `title`, `body` — bắt buộc
- `branches` (tuỳ chọn): `[{ "id"?: string, "label": string, "body": string }]`
- `detail` (tuỳ chọn): `{ "title"?: string, "sections": [...] }`
  - Nếu `sections` rỗng hoặc không có: **không** hiện nút Chi tiết.
  - Mỗi section: `kind`: `note` | `cost` | `payroll` | `other`, `label`, `body` (chuỗi; số tiền nên viết sẵn trong `body`).

## Ví dụ một bước có nhánh + detail

Xem `public/config.example.json` — giữ đồng bộ với code validate trong `src/config/validate.js`.

## Thao tác thường dùng

1. **Thêm bước:** thêm object vào cuối `steps` (hoặc xen giữa), `id` mới không trùng.
2. **Thêm nhánh:** trong bước, thêm phần tử vào `branches`.
3. **Thêm chi phí / lương:** trong bước, thêm hoặc sửa `detail.sections` với `kind` `cost` hoặc `payroll`.
4. **Đổi thứ tự:** đổi thứ tự object trong mảng `steps`.

## Lệnh

- `npm install` — cài dependency
- `npm run dev` — dev server (đọc `public/config.local.json` nếu có)
- `npm run build` — build ra `dist/`
- `npm run preview` — xem bản build
- `npm test` — chạy Vitest

## Deploy Vercel

- Import repo, Framework Preset: **Vite**, build `npm run build`, output `dist`.
- Branch preview thường chỉ có `config.example.json` trừ khi bạn cấu hình thêm (biến môi trường / bước build — ngoài phạm vi MVP).

## Lỗi thường gặp

- **JSON sai cú pháp:** trang báo lỗi; dùng validator JSON trong editor.
- **Thiếu `config.local.json`:** trang vẫn chạy với example + banner vàng.
- **Trùng `id` bước:** trang liệt kê lỗi validate.
