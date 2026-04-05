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
