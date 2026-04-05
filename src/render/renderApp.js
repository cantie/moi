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

      const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
      if (mq.matches) {
        const openHover = () => {
          panel.hidden = false;
          btn.setAttribute('aria-expanded', 'true');
        };
        const closeHover = () => {
          if (document.activeElement !== btn && !panel.matches(':hover')) {
            panel.hidden = true;
            btn.setAttribute('aria-expanded', 'false');
          }
        };
        btn.addEventListener('mouseenter', openHover);
        btn.addEventListener('mouseleave', () => {
          setTimeout(closeHover, 80);
        });
        panel.addEventListener('mouseenter', () => {});
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
