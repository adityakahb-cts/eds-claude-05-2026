# Footer

Renders the site-wide footer. Footer content is loaded automatically from the `/footer` page (or the URL specified in the `footer` metadata tag on the page).

## Default

| Footer                 |
| ---------------------- |
| _(no authored fields)_ |

The block fetches the footer fragment automatically — no fields are authored directly in this block. All footer content is maintained on the `/footer` page.

## Testing

| File             | Purpose                                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| `footer.spec.js` | Playwright e2e tests — footer wrapper visible, fragment content present, element has children after decoration |

Draft page: `tests/footer-test.html` (uses `<meta name="footer" content="/tests/fragments/footer">` to load `tests/fragments/footer.plain.html` instead of the live CMS footer).
