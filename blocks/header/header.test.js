import { describe, it, expect, vi, afterEach } from 'vitest';

// Mock all external dependencies before importing the module
vi.mock('../../scripts/aem.js', () => ({
  getMetadata: vi.fn().mockReturnValue(''),
}));

// Use mockImplementation so each call returns a FRESH fragment (not a drained shared object)
vi.mock('../fragment/fragment.js', () => ({
  loadFragment: vi.fn().mockImplementation(() => {
    const main = document.createElement('main');
    const brand = document.createElement('div');
    brand.innerHTML = '<p><a href="/">Home</a></p>';
    const sections = document.createElement('div');
    sections.innerHTML = '<ul><li>About</li><li>Contact</li></ul>';
    const tools = document.createElement('div');
    tools.innerHTML = '<p>Search</p>';
    main.append(brand, sections, tools);
    return Promise.resolve(main);
  }),
}));

const { default: decorate } = await import('./header.js');

describe('header block', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('exports a default decorate function', () => {
    expect(typeof decorate).toBe('function');
  });

  it('renders a nav element inside a nav-wrapper', async () => {
    const block = document.createElement('div');
    block.className = 'header';
    document.body.append(block);

    await decorate(block);

    expect(block.querySelector('.nav-wrapper')).toBeTruthy();
    expect(block.querySelector('nav#nav')).toBeTruthy();
  });

  it('adds nav-brand, nav-sections, nav-tools classes to first three children', async () => {
    const block = document.createElement('div');
    block.className = 'header';
    document.body.append(block);

    await decorate(block);

    const nav = block.querySelector('nav#nav');
    expect(nav.querySelector('.nav-brand')).toBeTruthy();
    expect(nav.querySelector('.nav-sections')).toBeTruthy();
    expect(nav.querySelector('.nav-tools')).toBeTruthy();
  });

  it('creates a hamburger button for mobile nav', async () => {
    const block = document.createElement('div');
    block.className = 'header';
    document.body.append(block);

    await decorate(block);

    const hamburger = block.querySelector('.nav-hamburger');
    expect(hamburger).toBeTruthy();
    expect(hamburger.querySelector('button')).toBeTruthy();
  });
});
