const base = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
const LOCAL = `${base}config.local.json`;
const EXAMPLE = `${base}config.example.json`;

/**
 * @param {Response} res
 * @returns {Promise<{ ok: true, data: unknown } | { ok: false }>}
 */
async function tryParseJsonResponse(res) {
  if (!res.ok) return { ok: false };
  const text = await res.text();
  const t = text.trim();
  if (!t.startsWith('{') && !t.startsWith('[')) {
    return { ok: false };
  }
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
}

/**
 * @param {string} url
 * @returns {Promise<{ ok: true, data: unknown } | { ok: false }>}
 */
async function tryLoadJson(url) {
  try {
    const res = await fetch(url);
    return await tryParseJsonResponse(res);
  } catch {
    return { ok: false };
  }
}

/**
 * @returns {Promise<{ raw: unknown, usedLocal: boolean, usedFallback: boolean }>}
 */
export async function loadSiteConfig() {
  const local = await tryLoadJson(LOCAL);
  if (local.ok) {
    return { raw: local.data, usedLocal: true, usedFallback: false };
  }

  const example = await tryLoadJson(EXAMPLE);
  if (example.ok) {
    return { raw: example.data, usedLocal: false, usedFallback: true };
  }

  throw new Error(
    'Không tải được config (thiếu hoặc không hợp lệ: public/config.local.json và public/config.example.json). ' +
      'Nếu đang deploy tĩnh, đảm bảo hai file này nằm trong thư mục build (Vite copy từ public/).',
  );
}
