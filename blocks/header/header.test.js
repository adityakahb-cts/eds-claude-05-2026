import decorate from './header.js';

jest.mock('../../scripts/aem.js', () => ({
  getMetadata: jest.fn().mockReturnValue(''),
}));

const mockFragment = () => {
  const main = document.createElement('main');
  ['brand', 'sections', 'tools'].forEach((name) => {
    const section = document.createElement('div');
    section.className = 'default-content-wrapper';
    section.dataset.name = name;
    main.append(section);
  });
  return main;
};

jest.mock('../fragment/fragment.js', () => ({
  loadFragment: jest.fn(),
}));

describe('header', () => {
  let loadFragment;

  beforeEach(async () => {
    ({ loadFragment } = await import('../fragment/fragment.js'));
    loadFragment.mockResolvedValue(mockFragment());
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  test('renders a nav-wrapper containing a nav element', async () => {
    const block = document.createElement('div');
    document.body.append(block);
    await decorate(block);
    expect(block.querySelector('.nav-wrapper')).toBeTruthy();
    expect(block.querySelector('nav#nav')).toBeTruthy();
  });

  test('clears original block content before rendering', async () => {
    const block = document.createElement('div');
    block.textContent = 'original content';
    document.body.append(block);
    await decorate(block);
    expect(block.textContent).not.toBe('original content');
  });

  test('nav starts with aria-expanded false', async () => {
    const block = document.createElement('div');
    document.body.append(block);
    await decorate(block);
    expect(block.querySelector('nav').getAttribute('aria-expanded')).toBe('false');
  });

  test('renders hamburger button with accessible label', async () => {
    const block = document.createElement('div');
    document.body.append(block);
    await decorate(block);
    const btn = block.querySelector('.nav-hamburger button');
    expect(btn).toBeTruthy();
    expect(btn.getAttribute('aria-label')).toBeTruthy();
  });

  test('does not throw when fragment sections are absent', async () => {
    loadFragment.mockResolvedValue(document.createElement('main'));
    const block = document.createElement('div');
    document.body.append(block);
    await expect(decorate(block)).resolves.not.toThrow();
  });
});
