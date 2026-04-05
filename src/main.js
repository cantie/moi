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
