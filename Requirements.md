# Requirements

**IMPORTANT**: You are a web architect specializes in AEM and Edge Delivery Services. https://www.aem.live and https://docs.da.live/ are your primary references. Minimize the tokens as much as you can. MD files are exception. Imagine the following team structure:

1. 1 frontend manager
1. 1 senior frontend developer
1. 2 junior frontend developers
1. 1 qa manager
1. 1 senior qa
1. 2 junior qa

## Global implementation

1. The goal is to create a mobile first designed site with various components as listed in https://ui.shadcn.com/docs/components
1. This will need third party JS plugins, which we will incorporate gradually, not all at once and not at very beginning of this setup.
1. Additionally, just like Bootstrap - borders, grid, flex, display, forms, normalize, buttons, typography etc. needs to be implemented.
1. temp.scss inside \_\_extras folder gives idea about some required items.
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
1. More third party plugins, like megamenu, countup.js, popper.js etc. will be introduced gradually.
1. All third party JS plugins will be used as UMD or CDN form, since there is not build process involved. These files must be determined to be loaded either on the header, or lazyly. `delayed.js` also can be used for such scenarios.
1. da.live mcp server is configured for specific tools. Every authored block must be in sync with its respective content model in the codebase.
1. Claude to suggest best mcps, plugins, skills, etc. to achieve the best results.
1. Lighthouse score target is 100 for mobile and desktop viewports.
1. Analyze styles folder and respective CSS files inside blocks. Check the CSS imports, variables and other related architecture. This must be followed.
1. Plan a git process - branching, checkout, checkin, PR, merging, review and testing strategy. The main branch must be protected and all new branches must be created from develop branch. Only with a final approval, code must be pushed to main branch.
1. Plan an environment strategy with keeping dev, qa, uat, prelive and prod environments in mind.
1. Plan a CI/CD pipeline if needed.
1. Create custom agents, skills, commands, prompts, hooks etc. for the architecture. Consider the developer and qa usage too. Hooks to fix the lint also must be available. Git Precommit hook works too.
1. Suggest more improvements to make it robust for fast and scalable EDS website.
1. Add a future plan to integrate Adobe DTM, Google GTM, Adobe Dynamic Media and Adobe Asset Selector.
1. As da.live is our CMS for EDS, refer to https://github.com/adobe/skills/tree/main/plugins/aem/edge-delivery-services/skills for any additional skills you need.

## Block implementation

1. All blocks must have following files:
   a. `{blockname}.js`
   b. `{blockname}.css`
   c. `{blockname}.spec.js`
   d. `{blockname}.test.js`
   d. `{blockname}.model.js`
   e. `{blockname}.md`
1. `{blockname}.js` and `{blockname}.css` are the default files required by edge delivery services.
1. Unless extremely necessary, `{blockname}.js` and `{blockname}.css` should use imports from `scripts` and `styles` folders. This is to keep the UI uniform and reduce duplication.
1. `{blockname}.test.js` is the vitest file for unit testing the `{blockname}.js` file.
1. `{blockname}.spec.js` is the playwright e2e test file testing the `{blockname}.js` file.
1. `{blockname}.model.js` is the helper file containing the content model and markup of the `{blockname}`, both will be exported to `{blockname}.js`. This content model should match with the block defined in the da.live document file. Both content model and markup can be used for unit testing. Markup can be used for block's DOM structure, instead of using "createElement", "append" and "appendTo" etc. methods.
1. Again, innerHTML must not be used for the block markup. Refer to the "html" function defined in "\_\_extras/eds-claude/aem.js".
1. `{blockname}.md` is the block definition file containing all the business requirements and usage of the `{blockname}`.
