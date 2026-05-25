import { html } from '../../scripts/scripts.js';

export const CONTENT_MODEL = {
  id: 'tabs',
  fields: [],
};

export const DEFAULT_MARKUP = html`
  <table>
    <tr>
      <td colspan="2">tabs</td>
    </tr>
    <tr>
      <td>Tab One</td>
      <td><p>Content for the first tab.</p></td>
    </tr>
    <tr>
      <td>Tab Two</td>
      <td><p>Content for the second tab.</p></td>
    </tr>
    <tr>
      <td>Tab Three</td>
      <td><p>Content for the third tab.</p></td>
    </tr>
  </table>
`;

export const PILLS_MARKUP = html`
  <table>
    <tr>
      <td colspan="2">tabs (pills)</td>
    </tr>
    <tr>
      <td>Design</td>
      <td><p>Design principles and guidelines.</p></td>
    </tr>
    <tr>
      <td>Development</td>
      <td><p>Developer documentation and API references.</p></td>
    </tr>
  </table>
`;

export const VERTICAL_MARKUP = html`
  <table>
    <tr>
      <td colspan="2">tabs (vertical)</td>
    </tr>
    <tr>
      <td>Overview</td>
      <td><p>Overview content displayed to the right of the tab list on wider screens.</p></td>
    </tr>
    <tr>
      <td>Details</td>
      <td><p>Detailed content for the second tab.</p></td>
    </tr>
  </table>
`;
