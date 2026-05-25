import decorate from './header.js';

vi.mock('../../scripts/scripts.js', () => ({
  encodeHtml: vi.fn((s) => String(s)),
  decorateMain: vi.fn(),
}));

vi.mock('../../scripts/aem.js', () => ({
  getMetadata: vi.fn().mockReturnValue(''),
}));

vi.mock('../../scripts/config/fragment-loader.js', () => ({
  default: vi.fn().mockResolvedValue('<div data-block-name="navigation"></div>'),
}));

vi.mock('../fragment/fragment.js', () => ({
  loadFragment: vi.fn(),
}));

describe('header', () => {
  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  test('renders siteheader-bar element', async () => {
    const block = document.createElement('div');
    document.body.append(block);
    await decorate(block);
    expect(block.querySelector('.siteheader-bar')).toBeTruthy();
  });

  test('clears original block content before rendering', async () => {
    const block = document.createElement('div');
    block.textContent = 'original content';
    document.body.append(block);
    await decorate(block);
    expect(block.textContent).not.toBe('original content');
  });

  test('hamburger button has aria-expanded false initially', async () => {
    const block = document.createElement('div');
    document.body.append(block);
    await decorate(block);
    const hamburger = block.querySelector('.siteheader-hamburger');
    expect(hamburger).toBeTruthy();
    expect(hamburger.getAttribute('aria-expanded')).toBe('false');
  });

  test('search toggle exists with aria-expanded false', async () => {
    const block = document.createElement('div');
    document.body.append(block);
    await decorate(block);
    const searchToggle = block.querySelector('.siteheader-search-toggle');
    expect(searchToggle).toBeTruthy();
    expect(searchToggle.getAttribute('aria-expanded')).toBe('false');
  });

  test('does not throw when fragment is empty', async () => {
    const { default: fetchFragmentHtml } = await import('../../scripts/config/fragment-loader.js');
    fetchFragmentHtml.mockResolvedValue(null);
    const block = document.createElement('div');
    document.body.append(block);
    await expect(decorate(block)).resolves.not.toThrow();
  });
});
