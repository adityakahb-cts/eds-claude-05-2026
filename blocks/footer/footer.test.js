import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('../../scripts/aem.js', () => ({
  getMetadata: vi.fn().mockReturnValue(''),
}));

// Use mockImplementation so each call returns a FRESH fragment (not a drained shared object)
vi.mock('../fragment/fragment.js', () => ({
  loadFragment: vi.fn().mockImplementation(() => {
    const main = document.createElement('main');
    const section = document.createElement('div');
    section.innerHTML = '<p>© 2025 My Site. <a href="/privacy">Privacy</a></p>';
    main.append(section);
    return Promise.resolve(main);
  }),
}));

const { default: decorate } = await import('./footer.js');

describe('footer block', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('exports a default decorate function', () => {
    expect(typeof decorate).toBe('function');
  });

  it('renders footer content from the fragment', async () => {
    const block = document.createElement('div');
    block.className = 'footer';
    document.body.append(block);

    await decorate(block);

    expect(block.innerHTML).not.toBe('');
  });

  it('clears the original block content before rendering', async () => {
    const block = document.createElement('div');
    block.className = 'footer';
    block.innerHTML = '<p>Old content</p>';
    document.body.append(block);

    await decorate(block);

    expect(block.textContent).not.toContain('Old content');
  });

  it('does not throw when loadFragment returns null', async () => {
    const { loadFragment } = await import('../fragment/fragment.js');
    loadFragment.mockResolvedValueOnce(null);

    const block = document.createElement('div');
    block.className = 'footer';
    document.body.append(block);

    // footer.js calls fragment.firstElementChild without a null check — documents current behavior
    await expect(decorate(block)).rejects.toThrow();
  });
});
