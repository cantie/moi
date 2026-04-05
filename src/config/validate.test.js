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
