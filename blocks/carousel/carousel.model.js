import { html } from '../../scripts/scripts.js';

export const CONTENT_MODEL = {
  id: 'carousel',
  fields: [],
};

export const DEFAULT_MARKUP = html`
  <table>
    <tr>
      <td colspan="2">carousel</td>
    </tr>
    <tr>
      <td>(image)</td>
      <td>Slide 1 caption</td>
    </tr>
    <tr>
      <td>(image)</td>
      <td>Slide 2 caption</td>
    </tr>
    <tr>
      <td>(image)</td>
      <td>Slide 3 caption</td>
    </tr>
  </table>
`;

export const AUTOPLAY_MARKUP = html`
  <table>
    <tr>
      <td colspan="2">carousel (autoplay)</td>
    </tr>
    <tr>
      <td>(image)</td>
      <td>Auto slide 1</td>
    </tr>
    <tr>
      <td>(image)</td>
      <td>Auto slide 2</td>
    </tr>
    <tr>
      <td>(image)</td>
      <td>Auto slide 3</td>
    </tr>
  </table>
`;

export const NO_CONTROLS_MARKUP = html`
  <table>
    <tr>
      <td colspan="2">carousel (no-controls)</td>
    </tr>
    <tr>
      <td>(image)</td>
      <td>Slide 1</td>
    </tr>
    <tr>
      <td>(image)</td>
      <td>Slide 2</td>
    </tr>
  </table>
`;
