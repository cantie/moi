import { stepHasDetailPanel } from '../config/validate.js';

function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

const ACCENT_CLASS = ['ig-accent-a', 'ig-accent-b', 'ig-accent-c', 'ig-accent-d'];

/**
 * @param {HTMLElement} root
 * @param {{ meta: { venueName: string, subtitle?: string }, steps: Record<string, unknown>[] }} data
 * @param {{ showFallbackBanner: boolean }} opts
 */
export function renderApp(root, data, opts) {
  clear(root);

  const page = document.createElement('div');
  page.className = 'ig-page';

  if (opts.showFallbackBanner) {
    const ban = document.createElement('div');
    ban.className = 'ig-banner';
    ban.setAttribute('role', 'status');
    ban.innerHTML =
      '<span class="ig-banner__mark" aria-hidden="true">!</span><span class="ig-banner__text">Đang dùng <strong>config.example.json</strong> — copy <code>public/config.example.json</code> → <code>public/config.local.json</code> để chỉnh dữ liệu thật (file local không commit).</span>';
    page.appendChild(ban);
  }

  const header = document.createElement('header');
  header.className = 'ig-hero';
  const brand = document.createElement('div');
  brand.className = 'ig-hero__brand';
  const h1 = document.createElement('h1');
  h1.className = 'ig-hero__title';
  h1.textContent = data.meta.venueName;
  brand.appendChild(h1);
  if (data.meta.subtitle) {
    const p = document.createElement('p');
    p.className = 'ig-hero__subtitle';
    p.textContent = data.meta.subtitle;
    brand.appendChild(p);
  }
  header.appendChild(brand);

  const stats = document.createElement('div');
  stats.className = 'ig-hero__stats';
  const n = data.steps.length;
  stats.innerHTML = `
    <div class="ig-stat">
      <span class="ig-stat__value">${n}</span>
      <span class="ig-stat__label">bước trong luồng</span>
    </div>
    <div class="ig-stat ig-stat--dim">
      <span class="ig-stat__value">${String(n).padStart(2, '0')}</span>
      <span class="ig-stat__label">mã quy trình</span>
    </div>`;
  header.appendChild(stats);
  page.appendChild(header);

  const main = document.createElement('main');
  main.className = 'ig-flow';

  data.steps.forEach((step, index) => {
    if (index > 0) {
      const arrow = document.createElement('div');
      arrow.className = 'ig-flow-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.innerHTML = '<span class="ig-flow-arrow__shaft"></span><span class="ig-flow-arrow__head"></span>';
      main.appendChild(arrow);
    }

    const article = document.createElement('article');
    article.className = 'ig-step';
    article.id = `step-${step.id}`;

    const accent = ACCENT_CLASS[index % ACCENT_CLASS.length];
    const card = document.createElement('div');
    card.className = `ig-card ${accent}`;

    const badge = document.createElement('div');
    badge.className = 'ig-card__badge';
    badge.setAttribute('aria-hidden', 'true');
    const num = document.createElement('span');
    num.className = 'ig-card__num';
    num.textContent = String(index + 1);
    badge.appendChild(num);
    card.appendChild(badge);

    const inner = document.createElement('div');
    inner.className = 'ig-card__inner';

    const titleRow = document.createElement('div');
    titleRow.className = 'ig-card__head';
    const h2 = document.createElement('h2');
    h2.className = 'ig-card__title';
    h2.textContent = /** @type {string} */ (step.title);
    titleRow.appendChild(h2);

    const showDetail = stepHasDetailPanel(step);
    let panelId = '';
    if (showDetail) {
      panelId = `panel-${step.id}`;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ig-pill';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', panelId);
      btn.innerHTML = '<span class="ig-pill__icon" aria-hidden="true">+</span> Số liệu &amp; ghi chú';
      titleRow.appendChild(btn);
    }
    inner.appendChild(titleRow);

    const body = document.createElement('div');
    body.className = 'ig-card__body';
    body.innerHTML = esc(String(step.body)).replace(/\n/g, '<br />');
    inner.appendChild(body);

    if (Array.isArray(step.branches) && step.branches.length) {
      const branches = document.createElement('div');
      branches.className = 'ig-branches';
      const brTitle = document.createElement('div');
      brTitle.className = 'ig-branches__label';
      brTitle.textContent = 'Nhánh';
      branches.appendChild(brTitle);
      const row = document.createElement('div');
      row.className = 'ig-branches__row';
      for (const br of step.branches) {
        const chip = document.createElement('div');
        chip.className = 'ig-chip';
        chip.innerHTML = `<span class="ig-chip__tag">${esc(String(br.label))}</span><p class="ig-chip__text">${esc(String(br.body)).replace(/\n/g, '<br />')}</p>`;
        row.appendChild(chip);
      }
      branches.appendChild(row);
      inner.appendChild(branches);
    }

    if (showDetail) {
      const panel = document.createElement('div');
      panel.id = panelId;
      panel.className = 'ig-detail';
      panel.hidden = true;
      panel.setAttribute('role', 'region');
      const detail = /** @type {{ title?: string, sections: { kind: string, label: string, body: string }[] }} */ (
        step.detail
      );
      if (detail.title) {
        const pt = document.createElement('h3');
        pt.className = 'ig-detail__title';
        pt.textContent = detail.title;
        panel.appendChild(pt);
      }
      const grid = document.createElement('div');
      grid.className = 'ig-detail__grid';
      for (const sec of detail.sections) {
        const block = document.createElement('section');
        block.className = `ig-tile ig-tile--${sec.kind}`;
        block.innerHTML = `<h4 class="ig-tile__label">${esc(sec.label)}</h4><div class="ig-tile__body">${esc(sec.body).replace(/\n/g, '<br />')}</div>`;
        grid.appendChild(block);
      }
      panel.appendChild(grid);
      inner.appendChild(panel);

      const btn = /** @type {HTMLButtonElement} */ (titleRow.querySelector('.ig-pill'));
      const toggle = () => {
        const open = panel.hidden;
        panel.hidden = !open;
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.classList.toggle('ig-pill--open', open);
      };
      btn.addEventListener('click', () => toggle());

      const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
      if (mq.matches) {
        const openHover = () => {
          panel.hidden = false;
          btn.setAttribute('aria-expanded', 'true');
          btn.classList.add('ig-pill--open');
        };
        const closeHover = () => {
          if (document.activeElement !== btn && !panel.matches(':hover')) {
            panel.hidden = true;
            btn.setAttribute('aria-expanded', 'false');
            btn.classList.remove('ig-pill--open');
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

    card.appendChild(inner);
    article.appendChild(card);
    main.appendChild(article);
  });

  page.appendChild(main);
  root.appendChild(page);
}

/**
 * @param {HTMLElement} root
 * @param {string} message
 * @param {string[]} [errors]
 */
export function renderError(root, message, errors = []) {
  clear(root);
  const page = document.createElement('div');
  page.className = 'ig-page';
  const box = document.createElement('div');
  box.className = 'ig-alert';
  box.setAttribute('role', 'alert');
  box.innerHTML = `<div class="ig-alert__title">Lỗi</div><p class="ig-alert__msg">${esc(message)}</p>`;
  if (errors.length) {
    const ul = document.createElement('ul');
    ul.className = 'ig-alert__list';
    for (const e of errors) {
      const li = document.createElement('li');
      li.textContent = e;
      ul.appendChild(li);
    }
    box.appendChild(ul);
  }
  page.appendChild(box);
  root.appendChild(page);
}
