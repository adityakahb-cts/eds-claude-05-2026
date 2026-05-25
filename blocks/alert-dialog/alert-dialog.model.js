import html from '../../scripts/config/html.js';

export const CONTENT_MODEL = {
  id: 'alert-dialog',
  fields: [],
};

export const DEFAULT_MARKUP = html`
  <table>
    <tr>
      <td>alert-dialog</td>
    </tr>
    <tr>
      <td>Title</td>
      <td>Information</td>
    </tr>
    <tr>
      <td>Message</td>
      <td>This is an informational dialog message.</td>
    </tr>
    <tr>
      <td>Trigger</td>
      <td>Open Dialog</td>
    </tr>
  </table>
`;

export default DEFAULT_MARKUP;
