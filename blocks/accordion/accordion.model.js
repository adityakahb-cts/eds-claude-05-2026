import { html } from '../../scripts/scripts.js';

export const CONTENT_MODEL = {
  id: 'accordion',
  fields: [],
};

export const DEFAULT_MARKUP = html`
  <table>
    <tr>
      <td colspan="2">accordion</td>
    </tr>
    <tr>
      <td>Panel Heading 1</td>
      <td><p>Panel content goes here. Authors add rich text, links, or images.</p></td>
    </tr>
    <tr>
      <td>Panel Heading 2</td>
      <td><p>More content for the second panel.</p></td>
    </tr>
  </table>
`;

export const ALLOW_MULTIPLE_MARKUP = html`
  <table>
    <tr>
      <td colspan="2">accordion (allow-multiple)</td>
    </tr>
    <tr>
      <td>First item</td>
      <td><p>This variation allows multiple panels open simultaneously.</p></td>
    </tr>
    <tr>
      <td>Second item</td>
      <td><p>Click any heading to expand or collapse independently.</p></td>
    </tr>
  </table>
`;
