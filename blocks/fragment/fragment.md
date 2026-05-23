# Fragment

Embeds the content of another page inline at the block's location on the page.

## Default

| Fragment                                                                     |
| ---------------------------------------------------------------------------- |
| Path _(required)_                                                            |
| Link or plain-text path to the page to embed (e.g. `/fragments/my-fragment`) |

## Testing

| File               | Purpose                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| `fragment.spec.js` | Playwright e2e tests — fragment content renders in the browser; original link removed after decoration |

Draft page: `tests/fragment-test.html` (embeds `tests/fragments/fragment-content.plain.html`).
