/**
 * Global markup decorators.
 * Each exported function receives the `main` element and performs a
 * single, focused DOM transformation. Add new decorators here and call
 * them from `decorateMain` in scripts.js.
 */

/**
 * Replaces a single `<span class="icon icon-{name}">` with
 * `<i class="lni lni-{name}" aria-hidden="true"></i>`.
 * @param {Element} span The icon span element to replace
 */
function decorateIconSpan(span) {
  const iconClass = Array.from(span.classList).find((c) => c.startsWith('icon-'));
  if (!iconClass) return;
  const iconName = iconClass.slice('icon-'.length);
  const i = document.createElement('i');
  i.classList.add('lni', `lni-${iconName}`);
  i.setAttribute('aria-hidden', 'true');
  span.replaceWith(i);
}

/**
 * Replaces all `<span class="icon icon-{name}">` elements inside `main`
 * with `<i class="lni lni-{name}" aria-hidden="true"></i>` elements.
 * @param {Element} main The main element to search for icon spans
 */
export function decorateIcons(main) {
  main.querySelectorAll('span.icon[class*="icon-"]').forEach(decorateIconSpan);
}

/**
 * Directive keys that control CSS class generation.
 * All other keys are applied as HTML attributes verbatim.
 */
const REGEN_CSS_KEYS = new Set(['element', 'theme', 'style', 'size', 'radius', 'level', 'author', 'source']);

/** Matches a `{{regen:start;...}}` marker inside a text node. */
const REGEN_START_RE = /\{\{regen:start;(.*?)\}\}/;

/** Matches a `{{regen:end}}` marker inside a text node. */
const REGEN_END_RE = /\{\{regen:end\}\}/;

/**
 * Parses the key-value pairs from a `{{regen:start;...}}` directive string.
 * Handles quoted values (e.g. `title:"My Title"`).
 * @param {string} raw The full directive text including `{{regen:start;` and `}}`
 * @returns {Record<string,string>} Directive parameters
 */
function parseRegenDirective(raw) {
  const params = {};
  const content = raw
    .trim()
    .replace(/^\{\{regen:start;?/, '')
    .replace(/\}\}$/, '');
  content.split(';').forEach((part) => {
    const colonIdx = part.indexOf(':');
    if (colonIdx === -1) return;
    const key = part.slice(0, colonIdx).trim();
    let value = part.slice(colonIdx + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    params[key] = value;
  });
  return params;
}

/**
 * Maps human-readable size names to their CSS class suffixes.
 * Accepts both the full word (e.g. "small") and the short form (e.g. "sm").
 */
const SIZE_MAP = {
  small: 'sm',
  sm: 'sm',
  normal: 'md',
  medium: 'md',
  md: 'md',
  large: 'lg',
  lg: 'lg',
  'extra-large': 'xl',
  xl: 'xl',
};

/**
 * Applies CSS classes and HTML attributes from directive params to an element.
 * @param {Element} el The target element
 * @param {Record<string,string>} params Parsed directive parameters
 */
function applyRegenParams(el, params) {
  const { theme, style, size, radius } = params;
  const sizeSuffix = size ? (SIZE_MAP[size] ?? size) : null;

  el.classList.add('btn');
  if (theme) el.classList.add(`btn--${theme}`);
  if (style && style !== 'solid') el.classList.add(`btn--${style}`);
  if (sizeSuffix && sizeSuffix !== 'md') el.classList.add(`btn--${sizeSuffix}`);
  if (radius === 'pilled') el.classList.add('btn--pilled');

  Object.entries(params).forEach(([key, value]) => {
    if (!REGEN_CSS_KEYS.has(key)) el.setAttribute(key, value);
  });
}

/**
 * Serializes an array of sibling nodes to an HTML string, preserving element
 * outerHTML (so icon `<i>` elements are not lost) and text node content.
 * @param {Node[]} nodes Sibling nodes between regen markers
 * @returns {string} Serialized HTML
 */
function serializeBetween(nodes) {
  return nodes.map((n) => (n.nodeType === Node.ELEMENT_NODE ? n.outerHTML : n.textContent)).join('');
}

/**
 * Adds `.btn--icon-only` when an anchor or button contains only a lineicon
 * with no visible text, making the element square so `radius:pilled` renders
 * as a perfect circle.
 * @param {Element} el The anchor or button element
 */
function applyIconOnlyIfNeeded(el) {
  if (el.textContent.trim() === '' && el.querySelector('.lni, .btn__icon')) {
    el.classList.add('btn--icon-only');
  }
}

/**
 * Removes a directive marker from a text node, deleting the node entirely if
 * no other content remains.
 * @param {Text} node The text node containing the marker
 * @param {RegExp} pattern The marker pattern to strip
 */
function stripMarkerNode(node, pattern) {
  const cleaned = node.textContent.replace(pattern, '');
  if (cleaned) {
    node.textContent = cleaned;
  } else {
    node.parentNode.removeChild(node);
  }
}

/**
 * Processes a `{{regen:start;...}}` text node and the sibling nodes that follow
 * it up to a matching `{{regen:end}}` text node.
 *
 * Supported element types:
 * - `element:anchor`     → `<a>`: enhances existing or creates new; receives btn classes.
 * - `element:button`     → `<button type="button">`: receives btn classes.
 * - `element:image`      → `<img>`: src from enclosed `<a href>`; wrapped in link if target present.
 * - `element:paragraph`  → `<p>`: `style` drives `.paragraph--{style}`.
 * - `element:blockquote` → `<blockquote>`: `author`/`source` build a `<footer>`.
 * - `element:heading`    → `<h1>`–`<h6>` via `level`; `style` drives `.heading--{style}`.
 * - `element:badge`      → `<span>`: `theme`/`style` drive `.badge--{theme/style}`.
 * - `element:alert`      → `<div>`: `theme`/`style` drive `.alert--{theme/style}`.
 * - `element:divider`    → `<hr>`.
 *
 * CSS keys — `element`, `theme`, `style`, `size`, `level`, `author`, `source` — drive
 * class/tag logic and are never set as HTML attributes. All other keys are set as
 * HTML attributes verbatim (e.g. `href`, `target`, `title`, `type`, `aria-label`).
 *
 * @param {Text} startTextNode Text node whose content contains `{{regen:start;...}}`
 */
function applyRegenDirective(startTextNode) {
  const directiveMatch = startTextNode.textContent.match(REGEN_START_RE);
  if (!directiveMatch) return;

  // If both markers are in the same text node (no intervening DOM elements),
  // split it into sibling text nodes so the standard sibling-walking logic works.
  const startStr = directiveMatch[0];
  const startIdx = startTextNode.textContent.indexOf(startStr);
  const afterStart = startTextNode.textContent.slice(startIdx + startStr.length);
  if (REGEN_END_RE.test(afterStart)) {
    const { parentNode } = startTextNode;
    const endStr = '{{regen:end}}';
    const endIdx = startTextNode.textContent.indexOf(endStr, startIdx + startStr.length);
    const before = startTextNode.textContent.slice(0, startIdx);
    const inner = startTextNode.textContent.slice(startIdx + startStr.length, endIdx);
    const after = startTextNode.textContent.slice(endIdx + endStr.length);
    if (before) parentNode.insertBefore(document.createTextNode(before), startTextNode);
    const newStart = document.createTextNode(startStr);
    parentNode.insertBefore(newStart, startTextNode);
    if (inner) parentNode.insertBefore(document.createTextNode(inner), startTextNode);
    parentNode.insertBefore(document.createTextNode(endStr), startTextNode);
    if (after) parentNode.insertBefore(document.createTextNode(after), startTextNode);
    parentNode.removeChild(startTextNode);
    applyRegenDirective(newStart);
    return;
  }

  const params = parseRegenDirective(directiveMatch[0]);
  const { element } = params;

  // Collect sibling nodes up to the {{regen:end}} marker
  let node = startTextNode.nextSibling;
  const between = [];
  let endTextNode = null;

  while (node) {
    if (node.nodeType === Node.TEXT_NODE && REGEN_END_RE.test(node.textContent)) {
      endTextNode = node;
      break;
    }
    between.push(node);
    node = node.nextSibling;
  }

  if (!endTextNode) return;

  if (element === 'image') {
    const imgAnchor = between.find((n) => n.nodeType === Node.ELEMENT_NODE && n.tagName === 'A');
    const img = document.createElement('img');

    // Non-CSS directive params (alt, width, height, loading, class, …) → img attributes
    Object.entries(params).forEach(([key, value]) => {
      if (!REGEN_CSS_KEYS.has(key)) img.setAttribute(key, value);
    });
    if (params.radius === 'pilled') img.classList.add('img--pilled');

    if (imgAnchor) {
      const href = imgAnchor.getAttribute('href');
      img.setAttribute('src', href);
      const target = imgAnchor.getAttribute('target');
      between.forEach((n) => n.parentNode.removeChild(n));

      if (target) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.setAttribute('target', target);
        a.appendChild(img);
        startTextNode.parentNode.insertBefore(a, endTextNode);
      } else {
        startTextNode.parentNode.insertBefore(img, endTextNode);
      }
    } else {
      between.forEach((n) => n.parentNode.removeChild(n));
      startTextNode.parentNode.insertBefore(img, endTextNode);
    }
  } else if (element === 'paragraph') {
    const p = document.createElement('p');
    const { style: pStyle } = params;
    if (pStyle) p.classList.add(`paragraph--${pStyle}`);
    Object.entries(params).forEach(([key, value]) => {
      if (!REGEN_CSS_KEYS.has(key)) p.setAttribute(key, value);
    });
    const existingParaEl = between.find((n) => n.nodeType === Node.ELEMENT_NODE);
    p.innerHTML = existingParaEl
      ? existingParaEl.innerHTML
      : between
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .map((n) => n.textContent)
          .join('');
    between.forEach((n) => n.parentNode.removeChild(n));
    startTextNode.parentNode.insertBefore(p, endTextNode);
  } else if (element === 'blockquote') {
    const { author, source } = params;
    const bq = document.createElement('blockquote');
    const elems = between.filter((n) => n.nodeType === Node.ELEMENT_NODE);
    const textNodes = between.filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    bq.innerHTML = elems.length
      ? elems.map((n) => n.outerHTML).join('')
      : textNodes.map((n) => `<p>${n.textContent}</p>`).join('');
    if (author || source) {
      const footer = document.createElement('footer');
      if (author) {
        const cite = document.createElement('cite');
        cite.textContent = author;
        footer.append('\u2014 ', cite);
      }
      if (source) {
        if (author) footer.append(', ');
        const span = document.createElement('span');
        span.classList.add('blockquote__source');
        span.textContent = source;
        footer.append(span);
      }
      bq.appendChild(footer);
    }
    between.forEach((n) => n.parentNode.removeChild(n));
    startTextNode.parentNode.insertBefore(bq, endTextNode);
  } else if (element === 'heading') {
    const levelNum = parseInt(params.level, 10);
    const tag = levelNum >= 1 && levelNum <= 6 ? `h${levelNum}` : 'h2';
    const h = document.createElement(tag);
    const { style: hStyle } = params;
    if (hStyle) h.classList.add(`heading--${hStyle}`);
    Object.entries(params).forEach(([key, value]) => {
      if (!REGEN_CSS_KEYS.has(key)) h.setAttribute(key, value);
    });
    const existingHeadingEl = between.find((n) => n.nodeType === Node.ELEMENT_NODE);
    h.innerHTML = existingHeadingEl
      ? existingHeadingEl.innerHTML
      : between
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .map((n) => n.textContent)
          .join('');
    between.forEach((n) => n.parentNode.removeChild(n));
    startTextNode.parentNode.insertBefore(h, endTextNode);
  } else if (element === 'badge') {
    const badge = document.createElement('span');
    const { theme: bTheme, style: bStyle, radius: bRadius } = params;
    badge.classList.add('badge');
    if (bTheme) badge.classList.add(`badge--${bTheme}`);
    if (bStyle && bStyle !== 'solid') badge.classList.add(`badge--${bStyle}`);
    if (bRadius === 'pilled') badge.classList.add('badge--pilled');
    Object.entries(params).forEach(([key, value]) => {
      if (!REGEN_CSS_KEYS.has(key)) badge.setAttribute(key, value);
    });
    const existingBadgeEl = between.find((n) => n.nodeType === Node.ELEMENT_NODE);
    badge.innerHTML = existingBadgeEl
      ? existingBadgeEl.innerHTML
      : between
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .map((n) => n.textContent)
          .join('');
    between.forEach((n) => n.parentNode.removeChild(n));
    startTextNode.parentNode.insertBefore(badge, endTextNode);
  } else if (element === 'alert') {
    const alertEl = document.createElement('div');
    const { theme: aTheme, style: aStyle, radius: aRadius } = params;
    alertEl.classList.add('alert');
    if (aTheme) alertEl.classList.add(`alert--${aTheme}`);
    if (aStyle) alertEl.classList.add(`alert--${aStyle}`);
    if (aRadius === 'pilled') alertEl.classList.add('alert--pilled');
    Object.entries(params).forEach(([key, value]) => {
      if (!REGEN_CSS_KEYS.has(key)) alertEl.setAttribute(key, value);
    });
    const alertElems = between.filter((n) => n.nodeType === Node.ELEMENT_NODE);
    const alertTexts = between.filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    alertEl.innerHTML = alertElems.length
      ? alertElems.map((n) => n.outerHTML).join('')
      : alertTexts.map((n) => `<p>${n.textContent}</p>`).join('');
    between.forEach((n) => n.parentNode.removeChild(n));
    startTextNode.parentNode.insertBefore(alertEl, endTextNode);
  } else if (element === 'divider') {
    const hr = document.createElement('hr');
    Object.entries(params).forEach(([key, value]) => {
      if (!REGEN_CSS_KEYS.has(key)) hr.setAttribute(key, value);
    });
    between.forEach((n) => n.parentNode.removeChild(n));
    startTextNode.parentNode.insertBefore(hr, endTextNode);
  } else if (element === 'anchor') {
    const existingAnchor = between.find((n) => n.nodeType === Node.ELEMENT_NODE && n.tagName === 'A');
    if (existingAnchor) {
      applyRegenParams(existingAnchor, params);
      if (!existingAnchor.getAttribute('href')) existingAnchor.setAttribute('href', '#');
      applyIconOnlyIfNeeded(existingAnchor);
    } else {
      const a = document.createElement('a');
      applyRegenParams(a, params);
      if (!a.getAttribute('href')) a.setAttribute('href', '#');
      a.innerHTML = serializeBetween(between);
      applyIconOnlyIfNeeded(a);
      between.forEach((n) => n.parentNode.removeChild(n));
      startTextNode.parentNode.insertBefore(a, endTextNode);
    }
  } else if (element === 'button') {
    const btn = document.createElement('button');
    if (!params.type) btn.setAttribute('type', 'button');
    applyRegenParams(btn, params);
    btn.innerHTML = serializeBetween(between);
    applyIconOnlyIfNeeded(btn);
    between.forEach((n) => n.parentNode.removeChild(n));
    startTextNode.parentNode.insertBefore(btn, endTextNode);
  }

  stripMarkerNode(startTextNode, REGEN_START_RE);
  stripMarkerNode(endTextNode, REGEN_END_RE);
}

/**
 * Finds all `{{regen:start;...}}` / `{{regen:end}}` marker pairs in `main`
 * and regenerates the enclosed element according to each directive.
 * @param {Element} main The main element to search
 */
export function decorateRegenElements(main) {
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  const starts = [];
  let node = walker.nextNode();
  while (node) {
    if (REGEN_START_RE.test(node.textContent)) starts.push(node);
    node = walker.nextNode();
  }
  starts.forEach(applyRegenDirective);
}
