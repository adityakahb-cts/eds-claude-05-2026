import decorate from './footer.js';

vi.mock('../../scripts/config/fragment-loader.js', () => ({
  default: vi.fn(),
}));

vi.mock('../fragment/fragment.js', () => ({
  loadFragment: vi.fn(),
}));

describe('footer', () => {
  let fetchFragmentHtml;

  beforeEach(async () => {
    ({ default: fetchFragmentHtml } = await import('../../scripts/config/fragment-loader.js'));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('appends a wrapper div with fragment content', async () => {
    const p = document.createElement('p');
    p.textContent = 'Footer text';
    const div = document.createElement('div');
    div.append(p);
    fetchFragmentHtml.mockResolvedValue(div.outerHTML);

    const block = document.createElement('div');
    await decorate(block);

    const wrapper = block.querySelector('div');
    expect(wrapper).toBeTruthy();
    expect(wrapper.querySelector('p').textContent).toBe('Footer text');
  });

  test('clears original block content before rendering', async () => {
    fetchFragmentHtml.mockResolvedValue('<div></div>');
    const block = document.createElement('div');
    block.textContent = 'original content';
    await decorate(block);
    expect(block.textContent).toBe('');
  });

  test('renders empty wrapper when fragment has no children', async () => {
    fetchFragmentHtml.mockResolvedValue('   ');
    const block = document.createElement('div');
    await decorate(block);
    expect(block.querySelector('div')).toBeTruthy();
    expect(block.querySelector('div').children).toHaveLength(0);
  });

  test('does nothing when fetchFragmentHtml returns null', async () => {
    fetchFragmentHtml.mockResolvedValue(null);
    const block = document.createElement('div');
    block.textContent = 'original';
    await decorate(block);
    expect(block.textContent).toBe('original');
  });
});
