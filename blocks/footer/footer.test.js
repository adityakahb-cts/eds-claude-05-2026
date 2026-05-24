import decorate from './footer.js';

jest.mock('../../scripts/aem.js', () => ({
  getMetadata: jest.fn().mockReturnValue(''),
}));

jest.mock('../fragment/fragment.js', () => ({
  loadFragment: jest.fn(),
}));

describe('footer', () => {
  let loadFragment;

  beforeEach(async () => {
    ({ loadFragment } = await import('../fragment/fragment.js'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('appends a wrapper div with fragment content', async () => {
    const fragment = document.createElement('main');
    const p = document.createElement('p');
    p.textContent = 'Footer text';
    fragment.append(p);
    loadFragment.mockResolvedValue(fragment);

    const block = document.createElement('div');
    await decorate(block);

    const wrapper = block.querySelector('div');
    expect(wrapper).toBeTruthy();
    expect(wrapper.querySelector('p').textContent).toBe('Footer text');
  });

  test('clears original block content before rendering', async () => {
    loadFragment.mockResolvedValue(document.createElement('main'));
    const block = document.createElement('div');
    block.textContent = 'original content';
    await decorate(block);
    expect(block.textContent).toBe('');
  });

  test('renders empty wrapper when fragment has no children', async () => {
    loadFragment.mockResolvedValue(document.createElement('main'));
    const block = document.createElement('div');
    await decorate(block);
    expect(block.querySelector('div')).toBeTruthy();
    expect(block.querySelector('div').children).toHaveLength(0);
  });

  test('uses /footer path when no footer metadata is set', async () => {
    loadFragment.mockResolvedValue(document.createElement('main'));
    const block = document.createElement('div');
    await decorate(block);
    expect(loadFragment).toHaveBeenCalledWith('/footer');
  });
});
