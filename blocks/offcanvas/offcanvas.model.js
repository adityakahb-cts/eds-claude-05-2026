import { html } from '../../scripts/scripts.js';

export const CONTENT_MODEL = {
  id: 'offcanvas',
  fields: [],
};

export const DEFAULT_MARKUP = html`
  <table>
    <tr>
      <td colspan="2">offcanvas</td>
    </tr>
    <tr>
      <td>Trigger</td>
      <td>Open Left Panel</td>
    </tr>
    <tr>
      <td>
        <p>Panel heading</p>
        <p>Panel content goes here. Slides in from the left.</p>
        <a href="/link">A link inside the panel</a>
      </td>
      <td></td>
    </tr>
  </table>
`;

export const END_MARKUP = html`
  <table>
    <tr>
      <td colspan="2">offcanvas (end)</td>
    </tr>
    <tr>
      <td>Trigger</td>
      <td>Open Right Panel</td>
    </tr>
    <tr>
      <td>
        <p>Right Panel</p>
        <p>This offcanvas slides in from the right.</p>
      </td>
      <td></td>
    </tr>
  </table>
`;

export const TOP_MARKUP = html`
  <table>
    <tr>
      <td colspan="2">offcanvas (top)</td>
    </tr>
    <tr>
      <td>Trigger</td>
      <td>Open Top Panel</td>
    </tr>
    <tr>
      <td>
        <p>Top Panel</p>
        <p>This offcanvas slides down from the top.</p>
      </td>
      <td></td>
    </tr>
  </table>
`;

export const BOTTOM_MARKUP = html`
  <table>
    <tr>
      <td colspan="2">offcanvas (bottom)</td>
    </tr>
    <tr>
      <td>Trigger</td>
      <td>Open Bottom Sheet</td>
    </tr>
    <tr>
      <td>
        <p>Bottom Sheet</p>
        <p>This offcanvas slides up from the bottom.</p>
      </td>
      <td></td>
    </tr>
  </table>
`;
