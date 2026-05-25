import { html } from '../../scripts/scripts.js';

export const CONTENT_MODEL = {
  id: 'card',
  fields: [],
};

export const DEFAULT_MARKUP = html`
  <table>
    <tr>
      <td colspan="2">card</td>
    </tr>
    <tr>
      <td>(image)</td>
      <td>Alt text</td>
    </tr>
    <tr>
      <td>Card Title</td>
      <td></td>
    </tr>
    <tr>
      <td>Description text goes here with more details.</td>
      <td></td>
    </tr>
    <tr>
      <td><a href="/page">Read more</a></td>
      <td></td>
    </tr>
  </table>
`;

export const HORIZONTAL_MARKUP = html`
  <table>
    <tr>
      <td colspan="2">card (horizontal)</td>
    </tr>
    <tr>
      <td>(image)</td>
      <td>Alt text</td>
    </tr>
    <tr>
      <td>Horizontal Card Title</td>
      <td></td>
    </tr>
    <tr>
      <td>Image on left, text on right at tablet and above.</td>
      <td></td>
    </tr>
    <tr>
      <td><a href="/page">View details</a></td>
      <td></td>
    </tr>
  </table>
`;

export const FEATURED_MARKUP = html`
  <table>
    <tr>
      <td colspan="2">card (featured)</td>
    </tr>
    <tr>
      <td>(image)</td>
      <td>Alt text</td>
    </tr>
    <tr>
      <td>Featured Card Title</td>
      <td></td>
    </tr>
    <tr>
      <td>Image used as full-bleed background with text overlaid.</td>
      <td></td>
    </tr>
    <tr>
      <td><a href="/page">Explore</a></td>
      <td></td>
    </tr>
  </table>
`;

export const NO_IMAGE_MARKUP = html`
  <table>
    <tr>
      <td colspan="2">card (no-image)</td>
    </tr>
    <tr>
      <td>Text-only Card</td>
      <td></td>
    </tr>
    <tr>
      <td>No image slot — content fills the entire card.</td>
      <td></td>
    </tr>
    <tr>
      <td><a href="/page">Learn more</a></td>
      <td></td>
    </tr>
  </table>
`;
