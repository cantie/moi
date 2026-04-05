# Quán Mới — Trang typography (Vite) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây trang một trang Vite vanilla đọc `config.local.json` (fallback `config.example.json`), render timeline + nhánh + panel hover/tap theo spec `docs/superpowers/specs/2026-04-05-quan-moi-typographic-site-design.md`, kèm `CONFIGURATION.md`, sẵn sàng deploy Vercel.

**Architecture:** Logic thuần (validate / phát hiện detail hợp lệ) nằm trong `src/config/` và được Vitest kiểm thử. `main.js` fetch config, validate, gọi `renderApp` ghi DOM. Nội dung `body` bước là **plain text** (xuống dòng = `\n`); sau khi **escape HTML**, chuỗi được tách `\n` → `<br />` (không dùng markdown). Class `step-text` / `detail-section-body` dùng `white-space: pre-line` làm dự phòng.

**Tech Stack:** Vite 6, vanilla JS (ESM), Vitest + jsdom, npm.

---

## Cấu trúc file (trước khi chia task)

| File | Trách nhiệm |
|------|-------------|
| `package.json` | Scripts `dev`, `build`, `preview`, `test`; devDependencies vite, vitest, jsdom |
| `vite.config.js` | Cấu hình Vite + khối `test: { environment: 'jsdom' }` |
| `index.html` | Khung trang, `<div id="app">`, script `type="module"` → `/src/main.js` |
| `public/config.example.json` | Dữ liệu mẫu đầy đủ schema (commit) |
| `src/main.js` | `loadSiteConfig()`, validate, `renderApp()` hoặc `renderError()` |
| `src/config/loadSiteConfig.js` | `fetch` local rồi example; trả metadata `usedFallback` |
| `src/config/validate.js` | `validateConfig`, `stepHasDetailPanel` |
| `src/render/renderApp.js` | Tạo DOM header, timeline, branches, nút + panel, gắn sự kiện |
| `src/style.css` | Typography, timeline, panel, banner, responsive, biến CSS |
| `CONFIGURATION.md` | Hợp đồng cho AI + người (schema, Vercel, rủi ro public URL) |
| `.gitignore` | Đã có `config.local.json`; thêm `node_modules`, `dist` |
| `src/config/validate.test.js` | Vitest cho validate + stepHasDetailPanel |
| `src/config/loadSiteConfig.test.js` | Vitest mock `fetch` cho thứ tự URL và fallback |

---

### Task 1: Khởi tạo dự án Vite + Vitest

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.js` (placeholder tạm: `document.getElementById('app').textContent = 'OK'`)
- Modify: `.gitignore`

- [ ] **Step 1: Tạo `package.json`**

```json
{
  "name": "quan-moi-ops",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "devDependencies": {
    "jsdom": "^26.0.0",
    "vite": "^6.2.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Tạo `vite.config.js`**

```js
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: false,
  },
});
```

- [ ] **Step 3: Tạo `index.html` ở thư mục gốc**

```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Quán Mới — Sổ vận hành</title>
    <link rel="stylesheet" href="/src/style.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 4: Append `.gitignore`**

Thêm các dòng (giữ nguyên `config.local.json` đã có):

```
node_modules/
dist/
```

- [ ] **Step 5: Cài dependency và chạy dev**

Run: `npm install`  
Expected: exit 0, tạo `node_modules/`.

Run: `npm run dev` (hoặc chạy ngắn rồi Ctrl+C)  
Expected: server khởi động không lỗi.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.js index.html src/main.js .gitignore
git commit -m "chore: scaffold Vite vanilla project"
```

---

### Task 2: `validateConfig` — test trước, code sau

**Files:**
- Create: `src/config/validate.js`
- Create: `src/config/validate.test.js`

- [ ] **Step 1: Viết test thất bại**

Tạo `src/config/validate.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { validateConfig } from './validate.js';

describe('validateConfig', () => {
  it('rejects non-object root', () => {
    const r = validateConfig(null);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('object'))).toBe(true);
  });

  it('requires meta.venueName', () => {
    const r = validateConfig({ meta: {}, steps: [] });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('venueName'))).toBe(true);
  });

  it('requires steps array', () => {
    const r = validateConfig({ meta: { venueName: 'Mới' }, steps: 'x' });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('steps'))).toBe(true);
  });

  it('requires step id, title, body', () => {
    const r = validateConfig({
      meta: { venueName: 'Mới' },
      steps: [{ id: '', title: 'T', body: 'B' }],
    });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('steps[0].id'))).toBe(true);
  });

  it('detects duplicate step ids', () => {
    const r = validateConfig({
      meta: { venueName: 'Mới' },
      steps: [
        { id: 'a', title: '1', body: 'x' },
        { id: 'a', title: '2', body: 'y' },
      ],
    });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('Duplicate'))).toBe(true);
  });

  it('accepts minimal valid config', () => {
    const r = validateConfig({
      meta: { venueName: 'Mới', subtitle: 'Sổ vận hành' },
      steps: [{ id: 'open', title: 'Mở cửa', body: 'Chuẩn bị quầy.' }],
    });
    expect(r.ok).toBe(true);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `npm test`  
Expected: FAIL (module `./validate.js` missing hoặc export trống).

- [ ] **Step 3: Triển khai `src/config/validate.js`**

```js
const DETAIL_KINDS = new Set(['note', 'cost', 'payroll', 'other']);

/**
 * @param {unknown} raw
 * @returns {{ ok: true, data: object } | { ok: false, errors: string[] }}
 */
export function validateConfig(raw) {
  /** @type {string[]} */
  const errors = [];

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, errors: ['Root phải là object JSON'] };
  }

  const o = /** @type {Record<string, unknown>} */ (raw);

  if (!o.meta || typeof o.meta !== 'object' || Array.isArray(o.meta)) {
    errors.push('Thiếu object meta');
  } else {
    const m = /** @type {Record<string, unknown>} */ (o.meta);
    if (typeof m.venueName !== 'string' || !m.venueName.trim()) {
      errors.push('meta.venueName bắt buộc, chuỗi không rỗng');
    }
    if (m.subtitle != null && typeof m.subtitle !== 'string') {
      errors.push('meta.subtitle nếu có phải là chuỗi');
    }
  }

  if (!Array.isArray(o.steps)) {
    errors.push('steps phải là mảng');
  } else {
    const seen = new Set();
    o.steps.forEach((step, i) => {
      const p = `steps[${i}]`;
      if (!step || typeof step !== 'object' || Array.isArray(step)) {
        errors.push(`${p} phải là object`);
        return;
      }
      const s = /** @type {Record<string, unknown>} */ (step);
      if (typeof s.id !== 'string' || !s.id.trim()) {
        errors.push(`${p}.id bắt buộc, chuỗi không rỗng`);
      } else if (seen.has(s.id)) {
        errors.push(`Duplicate step id: "${s.id}" (tại ${p})`);
      } else {
        seen.add(s.id);
      }
      if (typeof s.title !== 'string' || !s.title.trim()) {
        errors.push(`${p}.title bắt buộc, chuỗi không rỗng`);
      }
      if (typeof s.body !== 'string' || !s.body.trim()) {
        errors.push(`${p}.body bắt buộc, chuỗi không rỗng`);
      }

      if (s.branches != null) {
        if (!Array.isArray(s.branches)) {
          errors.push(`${p}.branches phải là mảng hoặc bỏ trường`);
        } else {
          s.branches.forEach((b, j) => {
            const q = `${p}.branches[${j}]`;
            if (!b || typeof b !== 'object' || Array.isArray(b)) {
              errors.push(`${q} phải là object`);
              return;
            }
            const br = /** @type {Record<string, unknown>} */ (b);
            if (typeof br.label !== 'string' || !br.label.trim()) {
              errors.push(`${q}.label bắt buộc`);
            }
            if (typeof br.body !== 'string' || !br.body.trim()) {
              errors.push(`${q}.body bắt buộc`);
            }
            if (br.id != null && typeof br.id !== 'string') {
              errors.push(`${q}.id nếu có phải là chuỗi`);
            }
          });
        }
      }

      if (s.detail != null) {
        if (!s.detail || typeof s.detail !== 'object' || Array.isArray(s.detail)) {
          errors.push(`${p}.detail phải là object hoặc bỏ trường`);
        } else {
          const d = /** @type {Record<string, unknown>} */ (s.detail);
          if (d.title != null && typeof d.title !== 'string') {
            errors.push(`${p}.detail.title phải là chuỗi`);
          }
          if (!Array.isArray(d.sections)) {
            errors.push(`${p}.detail.sections phải là mảng khi có detail`);
          } else {
            d.sections.forEach((sec, k) => {
              const r = `${p}.detail.sections[${k}]`;
              if (!sec || typeof sec !== 'object' || Array.isArray(sec)) {
                errors.push(`${r} phải là object`);
                return;
              }
              const x = /** @type {Record<string, unknown>} */ (sec);
              if (typeof x.kind !== 'string' || !DETAIL_KINDS.has(x.kind)) {
                errors.push(`${r}.kind phải là note|cost|payroll|other`);
              }
              if (typeof x.label !== 'string' || !x.label.trim()) {
                errors.push(`${r}.label bắt buộc`);
              }
              if (typeof x.body !== 'string' || !x.body.trim()) {
                errors.push(`${r}.body bắt buộc`);
              }
            });
          }
        }
      }
    });
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, data: o };
}

/**
 * Có hiển thị trigger + panel không (sections không rỗng).
 * @param {Record<string, unknown>} step
 */
export function stepHasDetailPanel(step) {
  const d = step.detail;
  if (!d || typeof d !== 'object' || Array.isArray(d)) return false;
  const sections = /** @type {{ sections?: unknown }} */ (d).sections;
  return Array.isArray(sections) && sections.length > 0;
}
```

- [ ] **Step 4: Chạy test**

Run: `npm test`  
Expected: PASS toàn bộ test trong file (thêm test `stepHasDetailPanel` ở Task 3 nếu tách).

- [ ] **Step 5: Commit**

```bash
git add src/config/validate.js src/config/validate.test.js
git commit -m "feat(config): validate site JSON schema"
```

---

### Task 3: Test `stepHasDetailPanel`

**Files:**
- Modify: `src/config/validate.test.js`

- [ ] **Step 1: Thêm test**

Trong `validate.test.js`, thêm:

```js
import { validateConfig, stepHasDetailPanel } from './validate.js';

// ... trong describe hoặc describe mới:
describe('stepHasDetailPanel', () => {
  it('false when no detail', () => {
    expect(stepHasDetailPanel({ id: 'a', title: 't', body: 'b' })).toBe(false);
  });
  it('false when sections empty', () => {
    expect(
      stepHasDetailPanel({
        id: 'a',
        title: 't',
        body: 'b',
        detail: { sections: [] },
      }),
    ).toBe(false);
  });
  it('true when sections has item', () => {
    expect(
      stepHasDetailPanel({
        id: 'a',
        title: 't',
        body: 'b',
        detail: {
          sections: [{ kind: 'note', label: 'Lưu ý', body: 'X' }],
        },
      }),
    ).toBe(true);
  });
});
```

- [ ] **Step 2: Chạy test**

Run: `npm test`  
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/config/validate.test.js
git commit - "test(config): stepHasDetailPanel coverage"
```

Sửa message commit typo: `git commit -m "test(config): stepHasDetailPanel coverage"`

---

### Task 4: `loadSiteConfig` + mock fetch

**Files:**
- Create: `src/config/loadSiteConfig.js`
- Create: `src/config/loadSiteConfig.test.js`

- [ ] **Step 1: Viết test**

`src/config/loadSiteConfig.test.js`:

```js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadSiteConfig } from './loadSiteConfig.js';

describe('loadSiteConfig', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        if (url === '/config.local.json') {
          return Promise.resolve({ ok: false, status: 404, statusText: 'Not Found' });
        }
        if (url === '/config.example.json') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ meta: { venueName: 'Ex' }, steps: [] }),
          });
        }
        return Promise.reject(new Error('unknown url ' + url));
      }),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('falls back to example when local missing', async () => {
    const r = await loadSiteConfig();
    expect(r.usedLocal).toBe(false);
    expect(r.usedFallback).toBe(true);
    expect(r.raw.meta.venueName).toBe('Ex');
  });

  it('uses local when present', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        if (url === '/config.local.json') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ meta: { venueName: 'Local' }, steps: [] }),
          });
        }
        return Promise.reject(new Error('should not fetch ' + url));
      }),
    );
    const r = await loadSiteConfig();
    expect(r.usedLocal).toBe(true);
    expect(r.usedFallback).toBe(false);
  });
});
```

- [ ] **Step 2: Chạy test → FAIL**

Run: `npm test`  
Expected: FAIL (thiếu module).

- [ ] **Step 3: Implement `src/config/loadSiteConfig.js`**

```js
const LOCAL = '/config.local.json';
const EXAMPLE = '/config.example.json';

/**
 * @returns {Promise<{ raw: unknown, usedLocal: boolean, usedFallback: boolean }>}
 */
export async function loadSiteConfig() {
  let usedLocal = false;
  let usedFallback = false;
  let res = await fetch(LOCAL);
  if (!res.ok) {
    usedFallback = true;
    res = await fetch(EXAMPLE);
  } else {
    usedLocal = true;
  }
  if (!res.ok) {
    throw new Error(`Không tải được config (${res.status} ${res.statusText})`);
  }
  const raw = await res.json();
  return { raw, usedLocal, usedFallback };
}
```

- [ ] **Step 4: Chạy test**

Run: `npm test`  
Expected: PASS (cả hai file test).

- [ ] **Step 5: Commit**

```bash
git add src/config/loadSiteConfig.js src/config/loadSiteConfig.test.js
git commit -m "feat(config): load local config with example fallback"
```

---

### Task 5: `public/config.example.json` đầy đủ mẫu

**Files:**
- Create: `public/config.example.json`

- [ ] **Step 1: Tạo file**

```json
{
  "meta": {
    "venueName": "Mới",
    "subtitle": "Sổ vận hành — bản mẫu (copy thành public/config.local.json để chỉnh)"
  },
  "steps": [
    {
      "id": "prep",
      "title": "Trước giờ mở cửa",
      "body": "Kiểm tra máy POS, nước đá, và danh sách món dự trù hôm nay.",
      "branches": [
        {
          "id": "busy-day",
          "label": "Ngày đông",
          "body": "Mở thêm một người phụ quầy từ 11h30."
        },
        {
          "label": "Trái mùa",
          "body": "Giảm prep 20% so với dự báo tuần trước."
        }
      ],
      "detail": {
        "title": "Số liệu & lưu ý",
        "sections": [
          {
            "kind": "note",
            "label": "Ghi chú",
            "body": "POS phải đối soát tồn quỹ trước 9h."
          },
          {
            "kind": "cost",
            "label": "Chi phí ước tính ca sáng",
            "body": "Nguyên liệu prep: ~450.000đ (xem lại theo tuần)."
          },
          {
            "kind": "payroll",
            "label": "Nhân sự",
            "body": "Ca sáng: 2 FOH + 1 bếp (lương giờ theo bảng nội bộ)."
          }
        ]
      }
    },
    {
      "id": "service",
      "title": "Trong giờ phục vụ",
      "body": "Thứ tự: chào → gọi món → báo bếp → phục vụ → thanh toán.",
      "detail": {
        "sections": [
          {
            "kind": "other",
            "label": "KPI nhanh",
            "body": "Thời gian từ order đến bưng món mục tiêu: 12 phút."
          }
        ]
      }
    },
    {
      "id": "close",
      "title": "Đóng ca",
      "body": "Dọn quầy, khoá POS, ghi sổ tồn kho ngắn.",
      "branches": [
        {
          "label": "Còn khách",
          "body": "Chỉ dọn khu vực không ảnh hưởng khách; POS mở đến khi hết bill."
        }
      ]
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add public/config.example.json
git commit -m "docs(config): add example site config"
```

---

### Task 6: `renderApp.js` + `style.css` tối thiểu + `main.js` hoàn chỉnh

**Files:**
- Create: `src/render/renderApp.js`
- Create: `src/style.css`
- Modify: `src/main.js`

- [ ] **Step 1: Tạo `src/render/renderApp.js`**

```js
import { stepHasDetailPanel } from '../config/validate.js';

function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/**
 * @param {HTMLElement} root
 * @param {{ meta: { venueName: string, subtitle?: string }, steps: Record<string, unknown>[] }} data
 * @param {{ showFallbackBanner: boolean }} opts
 */
export function renderApp(root, data, opts) {
  clear(root);

  if (opts.showFallbackBanner) {
    const ban = document.createElement('div');
    ban.className = 'config-banner';
    ban.setAttribute('role', 'status');
    ban.textContent =
      'Đang dùng config.example.json — copy public/config.example.json thành public/config.local.json để chỉnh dữ liệu thật (file local không commit).';
    root.appendChild(ban);
  }

  const header = document.createElement('header');
  header.className = 'site-header';
  const h1 = document.createElement('h1');
  h1.textContent = data.meta.venueName;
  header.appendChild(h1);
  if (data.meta.subtitle) {
    const p = document.createElement('p');
    p.className = 'subtitle';
    p.textContent = data.meta.subtitle;
    header.appendChild(p);
  }
  root.appendChild(header);

  const main = document.createElement('main');
  main.className = 'timeline';

  data.steps.forEach((step, index) => {
    const article = document.createElement('article');
    article.className = 'step';
    article.id = `step-${step.id}`;

    const marker = document.createElement('div');
    marker.className = 'step-marker';
    marker.setAttribute('aria-hidden', 'true');
    marker.textContent = String(index + 1);
    article.appendChild(marker);

    const bodyWrap = document.createElement('div');
    bodyWrap.className = 'step-body';

    const titleRow = document.createElement('div');
    titleRow.className = 'step-title-row';
    const h2 = document.createElement('h2');
    h2.textContent = /** @type {string} */ (step.title);
    titleRow.appendChild(h2);

    const showDetail = stepHasDetailPanel(step);
    let panelId = '';
    if (showDetail) {
      panelId = `panel-${step.id}`;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'detail-trigger';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', panelId);
      btn.textContent = 'Chi tiết';
      titleRow.appendChild(btn);
    }
    bodyWrap.appendChild(titleRow);

    const body = document.createElement('div');
    body.className = 'step-text';
    body.innerHTML = esc(String(step.body)).replace(/\n/g, '<br />');
    bodyWrap.appendChild(body);

    if (Array.isArray(step.branches) && step.branches.length) {
      const ul = document.createElement('ul');
      ul.className = 'branches';
      for (const br of step.branches) {
        const li = document.createElement('li');
        const strong = document.createElement('strong');
        strong.className = 'branch-label';
        strong.textContent = String(br.label) + ' — ';
        li.appendChild(strong);
        const span = document.createElement('span');
        span.className = 'branch-body';
        span.innerHTML = esc(String(br.body)).replace(/\n/g, '<br />');
        li.appendChild(span);
        ul.appendChild(li);
      }
      bodyWrap.appendChild(ul);
    }

    if (showDetail) {
      const panel = document.createElement('div');
      panel.id = panelId;
      panel.className = 'detail-panel';
      panel.hidden = true;
      panel.setAttribute('role', 'region');
      const detail = /** @type {{ title?: string, sections: { kind: string, label: string, body: string }[] }} */ (
        step.detail
      );
      if (detail.title) {
        const pt = document.createElement('h3');
        pt.className = 'detail-panel-title';
        pt.textContent = detail.title;
        panel.appendChild(pt);
      }
      for (const sec of detail.sections) {
        const block = document.createElement('section');
        block.className = `detail-section detail-section--${sec.kind}`;
        const lab = document.createElement('h4');
        lab.textContent = sec.label;
        block.appendChild(lab);
        const txt = document.createElement('div');
        txt.className = 'detail-section-body';
        txt.innerHTML = esc(sec.body).replace(/\n/g, '<br />');
        block.appendChild(txt);
        panel.appendChild(block);
      }
      bodyWrap.appendChild(panel);

      const btn = /** @type {HTMLButtonElement} */ (titleRow.querySelector('.detail-trigger'));
      const toggle = () => {
        const open = panel.hidden;
        panel.hidden = !open;
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      };
      btn.addEventListener('click', () => toggle());

      let hoverOpen = false;
      const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
      const enableHover = () => mq.matches;
      if (enableHover()) {
        const openHover = () => {
          hoverOpen = true;
          panel.hidden = false;
          btn.setAttribute('aria-expanded', 'true');
        };
        const closeHover = () => {
          hoverOpen = false;
          if (document.activeElement !== btn && !panel.matches(':hover')) {
            panel.hidden = true;
            btn.setAttribute('aria-expanded', 'false');
          }
        };
        btn.addEventListener('mouseenter', openHover);
        btn.addEventListener('mouseleave', () => {
          setTimeout(closeHover, 80);
        });
        panel.addEventListener('mouseenter', () => {
          hoverOpen = true;
        });
        panel.addEventListener('mouseleave', closeHover);
      }
    }

    article.appendChild(bodyWrap);
    main.appendChild(article);
  });

  root.appendChild(main);
}

/**
 * @param {HTMLElement} root
 * @param {string} message
 * @param {string[]} [errors]
 */
export function renderError(root, message, errors = []) {
  clear(root);
  const box = document.createElement('div');
  box.className = 'error-box';
  box.setAttribute('role', 'alert');
  const p = document.createElement('p');
  p.textContent = message;
  box.appendChild(p);
  if (errors.length) {
    const ul = document.createElement('ul');
    for (const e of errors) {
      const li = document.createElement('li');
      li.textContent = e;
      ul.appendChild(li);
    }
    box.appendChild(ul);
  }
  root.appendChild(box);
}
```

**Lưu ý kỹ thuật:** Hover desktop dùng `mouseenter`/`mouseleave`; mobile không có hover fine → chỉ còn nút **Chi tiết** (tap). Có thể tinh chỉnh sau nếu panel đóng quá nhanh.

- [ ] **Step 2: Tạo `src/style.css`** (rút gọn có đủ biến + timeline + panel)

```css
:root {
  --color-bg: #faf9f7;
  --color-text: #1a1a1a;
  --color-muted: #5c5c5c;
  --color-line: #c8c4bc;
  --color-accent: #2c2c2c;
  --color-panel-bg: #f0eeea;
  --font-body: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --maxw: 40rem;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-body);
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.55;
}

#app {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
}

.config-banner {
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid #b8860b;
  background: #fff8e6;
  font-size: 0.9rem;
}

.site-header h1 {
  font-size: clamp(2rem, 5vw, 2.75rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0 0 0.35rem;
}

.subtitle {
  margin: 0;
  color: var(--color-muted);
  font-size: 1.05rem;
}

.timeline {
  margin-top: 2.5rem;
  border-left: 2px solid var(--color-line);
  padding-left: 1.5rem;
}

.step {
  position: relative;
  margin-bottom: 2.5rem;
}

.step-marker {
  position: absolute;
  left: calc(-1.5rem - 13px);
  top: 0.15rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 2px solid var(--color-line);
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.step-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem 1rem;
  margin-bottom: 0.5rem;
}

.step h2 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 600;
}

.step-text {
  white-space: pre-line;
}

.detail-trigger {
  min-height: 44px;
  min-width: 44px;
  padding: 0.35rem 0.75rem;
  font: inherit;
  cursor: pointer;
  border: 1px solid var(--color-accent);
  background: transparent;
  border-radius: 2px;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.detail-trigger:hover,
.detail-trigger:focus-visible {
  background: #fff;
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.detail-panel {
  margin-top: 1rem;
  padding: 1rem 1.1rem;
  background: var(--color-panel-bg);
  border-left: 4px solid var(--color-accent);
}

.detail-panel-title {
  margin: 0 0 0.75rem;
  font-size: 1rem;
}

.detail-section {
  margin-bottom: 1rem;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  margin: 0 0 0.25rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-muted);
}

.detail-section-body {
  white-space: pre-line;
}

.detail-section--cost .detail-section-body,
.detail-section--payroll .detail-section-body {
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace;
  font-size: 0.95rem;
}

.branches {
  margin: 1rem 0 0;
  padding-left: 1.1rem;
  font-size: 0.95rem;
  color: var(--color-muted);
}

.branch-label {
  font-style: italic;
  font-weight: 600;
  color: var(--color-text);
}

.error-box {
  padding: 1rem 1.25rem;
  border: 2px solid #b00020;
  background: #fff5f5;
}

.error-box ul {
  margin: 0.5rem 0 0;
  padding-left: 1.2rem;
}
```

- [ ] **Step 3: Sửa `src/main.js`**

```js
import { loadSiteConfig } from './config/loadSiteConfig.js';
import { validateConfig } from './config/validate.js';
import { renderApp, renderError } from './render/renderApp.js';

const root = document.getElementById('app');

async function boot() {
  try {
    const { raw, usedLocal, usedFallback } = await loadSiteConfig();
    const v = validateConfig(raw);
    if (!v.ok) {
      renderError(root, 'Cấu hình không hợp lệ. Sửa JSON và tải lại trang.', v.errors);
      return;
    }
    renderApp(root, v.data, {
      showFallbackBanner: usedFallback && !usedLocal,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    renderError(root, 'Không tải được cấu hình: ' + msg);
  }
}

boot();
```

- [ ] **Step 4: Chạy thủ công**

Run: `npm run dev` — mở trình duyệt, thấy banner (nếu chưa có local), timeline 3 bước.

- [ ] **Step 5: Build**

Run: `npm run build`  
Expected: thành công, có `dist/`.

- [ ] **Step 6: Commit**

```bash
git add src/render/renderApp.js src/style.css src/main.js
git commit -m "feat(ui): render timeline, branches, detail panels"
```

---

### Task 7: `CONFIGURATION.md`

**Files:**
- Create: `CONFIGURATION.md`

- [ ] **Step 1: Tạo file** (nội dung đầy đủ theo spec §4 + Vercel + bảo mật; có ví dụ JSON trùng với schema; có mục “Plain text” cho `body`.)

Nội dung tối thiểu (có thể mở rộng cùng ý):

```markdown
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

(Xem `public/config.example.json` — giữ đồng bộ với code validate.)

## Thao tác thường dùng

1. **Thêm bước:** thêm object vào cuối `steps` (hoặc xen giữa), `id` mới không trùng.
2. **Thêm nhánh:** trong bước, thêm phần tử vào `branches`.
3. **Thêm chi phí / lương:** trong bước, thêm/ sửa `detail.sections` với `kind` `cost` hoặc `payroll`.
4. **Đổi thứ tự:** kéo thứ tự object trong mảng `steps`.

## Lệnh

- `npm install` — cài dependency
- `npm run dev` — dev server (đọc `public/config.local.json` nếu có)
- `npm run build` — build ra `dist/`
- `npm run preview` — xem bản build
- `npm test` — chạy Vitest

## Deploy Vercel

- Import repo, Framework Preset: **Vite**, build `npm run build`, output `dist`.
- Branch preview dùng `config.example.json` trừ khi bạn cấu hình khác (env/build step — không nằm trong MVP).

## Lỗi thường gặp

- **JSON sai cú pháp:** trang báo lỗi; dùng validator JSON trong editor.
- **Thiếu `config.local.json`:** trang vẫn chạy với example + banner vàng.
- **Trùng `id` bước:** trang liệt kê lỗi validate.
```

- [ ] **Step 2: Commit**

```bash
git add CONFIGURATION.md
git commit -m "docs: CONFIGURATION for editors and AI"
```

---

### Task 8: Kiểm thử thủ công (checklist spec §6)

- [ ] Có `public/config.local.json` (copy từ example): reload, **không** banner (usedLocal true).
- [ ] Xoá tạm `config.local.json`: có banner, nội dung example.
- [ ] Sửa JSON thành `{` thiếu đóng: trang báo lỗi parse (nhánh catch `main.js`).
- [ ] Desktop: hover nút Chi tiết → panel mở (nếu `(hover: hover)`).
- [ ] Mobile / narrow: tap Chi tiết bật/tắt.
- [ ] Tab tới nút, Enter/Space: hoạt động (native `button`).
- [ ] `npm run build` và `npm run preview`: trang ổn.

- [ ] **Commit (nếu chỉ sửa nhỏ sau test)**

```bash
git add -A
git commit -m "fix: polish after manual QA"
```

(Chỉ khi có thay đổi thật.)

---

## Self-review (đã chạy khi soạn plan)

1. **Spec coverage:** Mọi mục MVP (fetch fallback, validate, banner, timeline, branches, detail/hover/tap, CSS variables, CONFIG.md, Vercel note, lỗi JSON) đều có task. Typography “markdown” đã **chốt plain text** trong Task 6 + CONFIG.
2. **Placeholder scan:** Không dùng TBD trong bước thực thi; có một bước commit tùy chọn nếu không có diff sau QA — ghi rõ điều kiện.
3. **Consistency:** `loadSiteConfig` trả `usedLocal`/`usedFallback`; `renderApp` nhận `showFallbackBanner: usedFallback && !usedLocal` khớp ý “chỉ banner khi đã thử local mà không có”.

---

**Plan đã lưu tại `docs/superpowers/plans/2026-04-05-quan-moi-typographic-site.md`. Hai hướng thực thi:**

1. **Subagent-Driven (khuyến nghị)** — mỗi task một subagent, review giữa các task.  
2. **Inline Execution** — làm tuần tự trong cùng phiên, có checkpoint.

Bạn muốn đi theo **1** hay **2**?

**Ghi chú triển khai:** Logic hover `mouseleave` + `setTimeout` có thể cần tinh chỉnh sau QA; nếu nhấp nháy, có thể **chỉ mở panel bằng click** trên mọi thiết bị (vẫn đạt spec: mobile bắt buộc tương tác bằng chạm).