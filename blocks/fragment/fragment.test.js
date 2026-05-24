import decorate, { loadFragment } from './fragment.js';

jest.mock('../../scripts/scripts.js', () => ({
  decorateMain: jest.fn(),
}));

jest.mock('../../scripts/aem.js', () => ({
  loadSections: jest.fn().mockResolvedValue(undefined),
}));

global.fetch = jest.fn();

describe('fragment — decorate', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('replaces block children with loaded fragment sections', async () => {
    const fragmentHtml = '<div class="section"><p>Fragment content</p></div>';
    global.fetch.mockResolvedValue({ ok: true, text: async () => fragmentHtml });

    const block = document.createElement('div');
    const link = document.createElement('a');
    link.href = '/fragments/test';
    block.append(link);

    await decorate(block);

    expect(block.querySelector('p')).toBeTruthy();
  });

  test('does nothing when block has no link and empty text', async () => {
    const block = document.createElement('div');
    await decorate(block);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('does nothing when fetch returns non-ok response', async () => {
    global.fetch.mockResolvedValue({ ok: false });
    const block = document.createElement('div');
    const link = document.createElement('a');
    link.href = '/fragments/missing';
    block.append(link);

    await decorate(block);
    // block children unchanged — link is still there
    expect(block.querySelector('a')).toBeTruthy();
  });
});

describe('fragment — loadFragment', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns null for non-root-relative paths', async () => {
    const result = await loadFragment('https://example.com/fragment');
    expect(result).toBeNull();
  });

  test('returns null for protocol-relative paths', async () => {
    const result = await loadFragment('//example.com/fragment');
    expect(result).toBeNull();
  });

  test('returns null when fetch fails', async () => {
    global.fetch.mockResolvedValue({ ok: false });
    const result = await loadFragment('/fragments/test');
    expect(result).toBeNull();
  });

  test('returns decorated main element on success', async () => {
    global.fetch.mockResolvedValue({ ok: true, text: async () => '<div><p>Hello</p></div>' });
    const result = await loadFragment('/fragments/test');
    expect(result.tagName.toLowerCase()).toBe('main');
  });
});
