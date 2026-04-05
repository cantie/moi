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
