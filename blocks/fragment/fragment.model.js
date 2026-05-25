import html from '../../scripts/config/html.js';

export const CONTENT_MODEL = {
  id: 'fragment',
  fields: [
    {
      component: 'text-input',
      valueType: 'string',
      name: 'path',
      label: 'Fragment Path',
      multi: false,
    },
  ],
};

export const FRAGMENT_MARKUP = html`<div class="fragment"></div>`;
export default FRAGMENT_MARKUP;
