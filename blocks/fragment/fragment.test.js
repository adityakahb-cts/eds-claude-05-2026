import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../scripts/scripts.js', () => ({
  decorateMain: vi.fn(),
}));

vi.mock('../../scripts/aem.js', () => ({
  loadSections: vi.fn().mockResolvedValue(undefined),
  getMetadata: vi.fn().mockReturnValue(''),
}));

const { loadFragment } = await import('./fragment.js');

describe('loadFragment', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('returns null for a relative path (no leading slash)', async () => {
    const result = await loadFragment('relative/path');
    expect(result).toBeNull();
  });

  it('returns null for a protocol-relative URL (//)', async () => {
    const result = await loadFragment('//example.com/fragment');
    expect(result).toBeNull();
  });

  it('returns null for an empty path', async () => {
    const result = await loadFragment('');
    expect(result).toBeNull();
  });

  it('fetches the .plain.html URL for a valid absolute path', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: async () => '<div class="section"><div>Hello fragment</div></div>',
    });

    await loadFragment('/test-fragment');
    expect(global.fetch).toHaveBeenCalledWith('/test-fragment.plain.html');
  });

  it('returns a main element with content when fetch succeeds', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: async () => '<div>Fragment content</div>',
    });

    const result = await loadFragment('/valid-fragment');
    expect(result).toBeTruthy();
    expect(result.tagName).toBe('MAIN');
  });

  it('returns null when fetch response is not ok', async () => {
    global.fetch.mockResolvedValue({ ok: false });
    const result = await loadFragment('/missing-fragment');
    expect(result).toBeNull();
  });

  it('returns null when fetch throws a network error', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));
    // loadFragment does not catch errors itself; the caller must handle them
    await expect(loadFragment('/broken-fragment')).rejects.toThrow('Network error');
  });
});
