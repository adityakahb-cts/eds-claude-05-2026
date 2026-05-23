# Requirements

**IMPORTANT**: You are a web architect specializes in AEM and Edge Delivery Services. https://www.aem.live and https://docs.da.live/ are your primary references. Minimize the tokens as much as you can. MD files are exception.

## Global implementation

1. The goal is to create a mobile first designed site with various components as listed in https://ui.shadcn.com/docs/components
1. temp.scss inside \_\_extras folder gives idea about some required items.
1. Additionally, just like Bootstrap - borders, grid, flex, display, forms, normalize, buttons, typography etc. needs to be implemented.
1. All latest CSS and ES6 standards need to be maintained.
1. All ES6 code must have proper comments and JSDoc.
1. ESLint, Prettier, Stylelint, Vitest and Playwright need to be implemented. ESLint config file should be eslint.config.js, peer dependiencies should be taken care of.
1. Both Light and Dark mode should be supported.
1. Follow WCAG 2.1/2.2 Level AA guidelines.
1. Try to use "rem" as the primary unit. "em" must only be used for media-queries.
1. Primary, secondary, tertiary, dark, light, success, danger, warning and info states need to be implemented. These colors can be extended over the blocks, such as alert-dange, alert-info etc. Find the best colors suited for light and dark modees.
1. Use semantic HTML5 elements. Ensure accessibility standards (ARIA labels, proper heading hierarchy). Follow AEM markup conventions for blocks and sections.
1. Headings should have noto-serif font, body should have noto-sans, google-code font is for monospace font support; and 300, 400, 500 and 700 font-weights to be used for both normal and italic font-styles. All these font-files are available in the repo.
1. Line icons webfont and css are available for implementatiton in the repo.
1. Using innerHTML is strictly prohibited. Refer to the "html" function defined in "\_\_extras/eds-claude/aem.js".
1. Use "**extras/eds-claude/aem.js", "**extras/eds-claude/scripts.js", "**extras/eds-claude/delayed.js", "**extras/eds-claude/common/utils.js" and "\_\_extras/eds-claude/common/data-parser.js" files to enhance "scripts/aem.js", "scripts/scripts.js" and "scripts/delayed.js". If needed, create extra JS files inside "scripts/config" folder.
1. Under "\_\_extras", more md files are present for larger analysis and implementation.
1. Embla carousel and Lenis scroll library are in vendor folder for global implementation.

## Block implementation

1. All blocks must have following files:
   a. `{blockname}.js`
   b. `{blockname}.css`
   c. `{blockname}.spec.js`
   d. `{blockname}.model.js`
   e. `{blockname}.md`
1. `{blockname}.js` and `{blockname}.css` are the default files required by edge delivery services.
1. `{blockname}.spec.js` is the vitest file for unit testing the `{blockname}.js` file.
1. `{blockname}.model.js` is the helper file containing the content model and markup of the `{blockname}`, both will be exported to `{blockname}.js`. This content model should match with the block defined in the da.live document file. Both content model and markup can be used for unit testing. Markup can be used for block's DOM structure, instead of using "createElement", "append" and "appendTo" etc. methods.
1. Again, innerHTML must not be used for the block markup. Refer to the "html" function defined in "\_\_extras/eds-claude/aem.js".
1. `{blockname}.md` is the block definition file containing all the business requirements and usage of the `{blockname}`.
