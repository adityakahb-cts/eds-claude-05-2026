import html from '../../scripts/config/html.js';

export const CONTENT_MODEL = {
  id: 'alert',
  fields: [],
};

export const DEFAULT_MARKUP = html`
  <table>
    <tr>
      <td>alert</td>
    </tr>
    <tr>
      <td>Information</td>
    </tr>
    <tr>
      <td>This is an informational alert message for the user.</td>
    </tr>
  </table>
`;

export default DEFAULT_MARKUP;
