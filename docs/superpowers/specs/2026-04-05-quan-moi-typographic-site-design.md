# Design: Trang typography “Quán Mới” (frontend-only)

**Ngày:** 2026-04-05  
**Trạng thái:** Đã duyệt qua brainstorming (sáu phần + bổ sung Vercel).

---

## 1. Tổng quan và phạm vi

### Mục tiêu

Một trang web **frontend-only**, **ưu tiên typography**, mô tả cách quán **“Mới”** vận hành cho **chủ quán / quản lý**. Người đọc theo được **luồng chính** (timeline), đồng thời xem thêm **ghi chú, chi phí, lương, …** qua lớp tương tác: **hover** (desktop) và **chạm** (mobile).

### Trong phạm vi

- **Frontend tĩnh** sau build: HTML/CSS/JS, không API, không database.
- **Nội dung và số liệu** từ file cấu hình: **`config.example.json`** (commit) + **`config.local.json`** (local, **gitignore**).
- **Tài liệu cho người và AI:** **`CONFIGURATION.md`** mô tả schema, quy ước và ví dụ chỉnh sửa — để sau có thể nhờ AI: *đọc `CONFIGURATION.md` và các file config rồi cập nhật theo vận hành mới*.

### Ngoài phạm vi (MVP)

- CMS, đăng nhập, form lưu server, đa ngôn ngữ đầy đủ (có thể mở rộng sau bằng toàn bộ copy trong config).
- Ứng dụng native, PWA.

### Tiêu chí thành công

- Chủ quán mở trang là **đọc được flow** trong vài phút.
- **Không cần sửa code** để đổi nội dung thông thường — chỉ sửa **config local** (và không lộ số thật qua Git nhờ gitignore).
- **Mobile** có **cùng lớp thông tin** như desktop, không phụ thuộc hover.

---

## 2. Cấu trúc trang, timeline, nhánh, hover/chạm, accessibility

### Bố cục

- **Đầu trang:** Tên quán (từ config) + dòng phụ (tagline / “Sổ vận hành”).
- **Thân:** **Timeline chính** dọc — mỗi bước: tiêu đề ngắn + đoạn **body** luồng chính.
- **Nhánh phụ:** Một số bước có **nhánh ngắn** (danh sách thụt hoặc khối phụ ngay dưới bước). Cấu hình: **bước cha → mảng nhánh con** (không cần đồ thị phức tạp).

### Hover / chạm

- Các mục có thêm lớp chi tiết được đánh dấu trong config qua object **`detail`**.
- **Desktop:** `hover` và **`focus` (bàn phím)** mở **panel** đủ lớn để đọc (typographic, không tooltip tí hon).
- **Mobile:** **tap** bật/tắt panel; có gợn ý trực quan nhẹ (gạch chân / viền / chấm) cho trạng thái “có thêm thông tin”.
- **Accessibility:** Trigger **focusable** (`button` hoặc `tabindex` + role phù hợp); panel hỗ trợ **`aria-expanded`** / quan hệ **`aria-controls`** khi markup cố định.

### Nguyên tắc nội dung

- **Luồng chính** phải đủ hiểu **không** cần mở panel; panel chỉ **bổ sung**.

---

## 3. Kiến trúc kỹ thuật và Vercel

### Stack

- **Vite** + **vanilla** (JavaScript), không framework UI.
- **`npm run dev`**, **`npm run build`**, output **`dist/`**.

### Cấu trúc thư mục (định hướng)

- `index.html`, `src/main.js`, `src/style.css` (có thể tách thêm module nếu cần).
- **`config.example.json`** — commit, đủ cấu trúc + ví dụ.
- **`config.local.json`** — gitignore, dữ liệu thật; bản copy từ example.
- **`CONFIGURATION.md`** — hợp đồng cho AI và người.
- **`.gitignore`:** gồm `config.local.json` (đã có trong repo; có thể thêm `dist/` nếu team không commit build output).

### Load config

- Runtime **`fetch`** ưu tiên **`/config.local.json`** (đặt trong `public/` khi dev/build local).
- Nếu **404 / lỗi** → **fallback** `config.example.json` + **banner** nhắc copy file local.
- **JSON không hợp lệ:** thông báo lỗi **trên trang**.

### Deploy Vercel

- Repo kết nối **Vercel**, preset **Vite** (`npm run build`, output `dist/`).
- **`vercel.json`** chỉ khi cần (ví dụ rewrite SPA); một trang đơn giản có thể chưa cần ngay.
- **`config.local.json` không commit** → mặc định **không có** trên build từ Git trừ khi có quy trình riêng (env + bước build, v.v.). **`CONFIGURATION.md`** phải mô tả **dev local** vs **deploy**.

### Bảo mật (bắt buộc hiểu rõ)

- Site **tĩnh** trên Vercel: nội dung trong **`public/`** hoặc được fetch như file tĩnh **có thể bị truy cập** nếu URL công khai. **Gitignore chỉ bảo vệ repo, không tự ẩn URL đã deploy.**
- Dữ liệu **lương / chi phí thật** trên deploy công khai cần **Deployment Protection** / hạn chế truy cập / hiểu rõ ai xem được — hoặc không đưa số thật vào asset public.

### Biên và lỗi cấu hình

- Thiếu field bắt buộc / `id` trùng: **cảnh báo trên trang** kèm **chỉ mục bước** để sửa JSON.
- `detail` rỗng hoặc `sections` rỗng: **không** hiển thị trigger/panel rỗng.

---

## 4. Schema JSON và `CONFIGURATION.md`

### Gốc document

- **`meta`:** `venueName` (ví dụ `"Mới"`), `subtitle`, tùy chọn `locale` hoặc ghi chú phiên bản.
- **`steps`:** mảng các bước timeline (thứ tự = thứ tự hiển thị).

### Mỗi phần tử `steps[]`

| Trường | Bắt buộc | Mô tả |
|--------|----------|--------|
| `id` | Có | Chuỗi duy nhất, dạng slug — neo cho AI/CSS/anchor. |
| `title` | Có | Tiêu đề bước. |
| `body` | Có | Mô tả luồng chính (plain text hoặc markdown nhẹ — **chốt một kiểu trong implementation** và ghi trong `CONFIGURATION.md`). |
| `branches` | Không | Mảng `{ id?, label, body }[]`. |
| `detail` | Không | Lớp hover/tap; xem dưới. |

### Object `detail`

- **`sections`:** mảng `{ kind: "note" \| "cost" \| "payroll" \| "other", label: string, body: string }[]`.
  - Số tiền nên là **chuỗi đã format** trong `body` để tránh phụ thuộc locale phức tạp ở MVP.
- **Tùy chọn:** `title` ngắn cho panel.

### Nội dung tối thiểu của `CONFIGURATION.md`

1. Mục đích file — “đọc trước khi sửa”.
2. Phân biệt `config.example.json` vs `config.local.json` + **cảnh báo Vercel / URL public**.
3. Schema (bảng trên) + **ví dụ JSON** một bước có `branches` + `detail.sections`.
4. Quy trình: thêm bước, thêm nhánh, thêm section trong `detail`, đổi thứ tự.
5. Lệnh: `npm install`, `npm run dev`, `npm run build`, deploy Vercel.
6. Lỗi thường gặp: JSON sai, thiếu local, fallback.

---

## 5. Typography, thị giác, responsive

- **Hierarchy** rõ; nền sáng / chữ tối mặc định.
- **CSS variables** cho màu và font (`--color-text`, `--color-bg`, `--font-body`, …) để chỉnh tập trung.
- **Font:** system stack mặc định; tùy chọn sau: font display + `public/fonts/`.
- **Timeline:** đường dọc mảnh hoặc đánh số typographic; tránh UI “dashboard”.
- **Nhánh:** thụt lề + cỡ nhỏ hơn hoặc italic cho `label`.
- **Panel:** khối như “ghi chú / trích dẫn”, có thể monospace nhẹ cho section `cost` / `payroll` (qua CSS theo `kind`).
- **Responsive:** một cột mobile; **max-width** ~36–42rem desktop căn giữa; vùng tap đủ lớn (~44px).

---

## 6. Kiểm thử thủ công và định nghĩa xong MVP

### Checklist

- Có `config.local.json`: render đúng timeline, nhánh, panel.
- Chỉ example: fallback + banner đúng.
- JSON lỗi: báo trên trang.
- Desktop: hover + keyboard; đọc flow không cần panel.
- Mobile: tap không kẹt UI.
- `npm run build` thành công; thử preview / Vercel preview.

### MVP hoàn thành khi

- Trang typography đọc config, đúng hành vi đã mô tả.
- Example + local + `CONFIGURATION.md` + `.gitignore` đúng quy ước.
- Deploy Vercel từ repo; tài liệu ghi rõ **rủi ro dữ liệu nhạy cảm** trên URL public.

---

## Quyết định đã chốt (từ brainstorming)

| Chủ đề | Lựa chọn |
|--------|----------|
| Đối tượng | Chủ quán / quản lý (B) |
| Thiết bị | Desktop + mobile — hover + chạm tương đương (C) |
| Cấu trúc flow | Timeline chính + nhánh phụ ngắn (D) |
| Stack | Vite + vanilla, đề xuất “vừa đủ” (C → Hướng 1, user chọn 1) |
| Dữ liệu nhạy cảm | Example commit + local gitignore (A) |
| Deploy | **Vercel** |

---

## Bước tiếp theo (ngoài tài liệu này)

Sau khi spec được chủ dự án xác nhận trên file, dùng skill **writing-plans** để tạo kế hoạch implementation chi tiết.
