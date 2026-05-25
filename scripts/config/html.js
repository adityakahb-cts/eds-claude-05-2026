/**
 * Tagged template literal for safe DOM construction without innerHTML.
 * String values are interpolated directly; HTMLElement, Array, and NodeList
 * values are inserted as real DOM nodes via placeholder markers.
 * @param {TemplateStringsArray} strings Template string parts
 * @param {...(string|number|HTMLElement|Element[]|NodeList)} values Interpolated values
 * @returns {Element|HTMLCollection} The constructed DOM element(s)
 */
export default function html(strings, ...values) {
  const template = document.createElement('template');
  template.innerHTML = strings.reduce((acc, str, i) => {
    if (values[i] instanceof HTMLElement || values[i] instanceof Array || values[i] instanceof NodeList) {
      return `${acc}${str}<template data-html-id="value-${i}"></template>`;
    }
    return acc + str + (values[i] ?? '');
  }, '');
  template.content.querySelectorAll('[data-html-id]').forEach((el) => {
    const idx = el.dataset.htmlId.split('-')[1];
    if (values[idx] instanceof Array || values[idx] instanceof NodeList) {
      el.replaceWith(...values[idx]);
      return;
    }
    if (values[idx] instanceof HTMLElement) {
      el.replaceWith(values[idx]);
      return;
    }
    // eslint-disable-next-line no-console
    console.error('Case not handled for', el);
  });
  const { children } = template.content;
  return children.length === 1 ? children[0] : children;
}
