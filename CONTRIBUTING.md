# Contributing to Shookie's Stream Suite

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person

## Reporting Bugs

Follow the GitHub template

## Suggesting Features

Follow the GitHub template

## Pull Request Process

### 1. Fork and Branch

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR-USERNAME/nodecg-shookie-stream-suite.git
cd nodecg-shookie-stream-suite

# Create a feature branch
git switch -c feature/your-feature-name
```

### 2. Make Your Changes

Follow the [Code Conventions](#code-conventions) below.

### 3. Test Thoroughly

**Required testing:**

- Test with Test Mode (all manual buttons)
- Test with Streamer.bot (real events if applicable)
- Check browser console for errors
- Verify no regressions in existing features

**For UI changes:**

- Test at multiple resolutions (720p, 1080p, 1440p)
- Test in OBS browser source
- Verify auto-scaling works correctly

### 5. Commit Changes, Push, and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:

- **Clear title** describing the change
- **Description** explaining what and why
- **Related issues** (e.g., "Closes #400")
- **Screenshots** if UI changes or relevant otherwise
- **Testing steps** for reviewers

### 6. Code Review

Maintainers will review your PR. Be prepared to:

- Answer questions about your approach
- Make requested changes
- Discuss alternative solutions
- Update documentation if needed

## Code Conventions

### JavaScript Style

**Naming:**

- `camelCase`: Functions, variables, parameters
- `PascalCase`: Classes, constructors
- `SCREAMING_SNAKE_CASE`: Constants

**File Organization:**

```javascript
// 1. Imports
const { DEFAULTS } = require('./constants');

// 2. Constants
const MAX_RETRIES = 3;

// 3. Functions
function myFunction() {}

// 4. Exports
module.exports = { myFunction };
```

**JSDoc Comments:**

```javascript
/**
 * Brief description of what function does
 * @param {import('./types').DataType} data - Parameter description
 * @returns {ReturnType} Return value description
 */
function myFunction(data) {}
```

Keep JSDoc concise - type annotations and brief descriptions only.

### CSS Conventions

**Class Naming (BEM-lite):**

```css
.component-name {
}
.component-name__element {
}
.component-name--modifier {
}
```

**CSS Variables:**
Use CSS custom properties for colors and shared values:

```css
:root {
  --color-primary: 149, 128, 255;
}

.element {
  background: rgba(var(--color-primary), 0.2);
}
```

### Error Handling

Follow the extension error handling conventions:

**Validation Failures:**

```javascript
if (!data || !data.required) {
  logger.warn('Invalid data, skipping');
  return;
}
```

**External Errors:**

```javascript
try {
  await riskyOperation();
} catch (err) {
  logger.error('Operation failed:', err);
  // Handle gracefully
}
```

### File Structure

**Extension files** (`extension/`):

- Keep functions focused and single-purpose
- Use constants from `extension/constants.js`
- Add JSDoc type annotations
- Follow error handling conventions

**Graphics files** (`graphics/*.html`):

- Self-contained HTML files with inline CSS/JS
- Use shared utilities from `shared-logger.js` and `viewport-utils.js`
- Follow naming conventions for constants
- Keep functions well-commented

**Dashboard files** (`dashboard/*.html`):

- Use `shared.js` utilities (createAutoSave, createSettingsLoader)
- Use `shared-styles.css` for consistent styling
- Follow dashboard HTML pattern (sections, setting-items)

## Common Contribution Scenarios

### Adding a New Setting

See [Development Guide - Adding a New Setting](docs/DEVELOPMENT.md#adding-a-new-setting) for step-by-step instructions.

**Checklist:**

- [ ] Add to `schemas/settings.json` with default value
- [ ] Add constant to `extension/constants.js` (if applicable)
- [ ] Add to dashboard panel HTML with `data-settings-path`
- [ ] Use `createAutoSave()` or `createImmediateSave()`
- [ ] Read from settings replicant in extension/graphics
- [ ] Update documentation

### Adding a New Streamer.bot Event Handler

See [Development Guide - Adding a New Streamer.bot Event Handler](docs/DEVELOPMENT.md#adding-a-new-streamerbot-event-handler) for step-by-step instructions.

**Checklist:**

- [ ] Define event structure in `extension/types.js`
- [ ] Add event constant to `extension/constants.js`
- [ ] Create handler function in `extension/index.js`
- [ ] Add normalization function in `extension/validate.js`
- [ ] Subscribe to event in `connectStreamerbot()`
- [ ] Add test generation (if applicable)
- [ ] Update documentation

### Adding a New Alert Type

See [Development Guide - Adding a New Alert Type](docs/DEVELOPMENT.md#adding-a-new-alert-type) for step-by-step instructions.

**Checklist:**

- [ ] Add template to `ALERT_TEMPLATES` in `graphics/alerts.html`
- [ ] Add toggle to `schemas/settings.json`
- [ ] Add checkbox to `dashboard/alerts.html`
- [ ] Update handler in extension to call `buildAlertData()`
- [ ] Add test generation function
- [ ] Update documentation

## Documentation

### When to Update Documentation

Update documentation when you:

- Add or modify features
- Change configuration options
- Fix bugs that affect user behavior
- Add or change APIs
- Modify troubleshooting steps

### Documentation Files

- **README.md** - Overview and quick start (keep concise)
- **docs/INSTALLATION.md** - Installation instructions
- **docs/CONFIGURATION.md** - Settings and OBS setup
- **docs/FEATURES.md** - Feature descriptions
- **docs/ARCHITECTURE.md** - Technical deep-dive
- **docs/API.md** - NodeCG messages and replicants
- **docs/DEVELOPMENT.md** - Development guide
- **docs/TROUBLESHOOTING.md** - Common issues

## Testing Guidelines

### Manual Testing Checklist

**For extension changes:**

- [ ] Test with Streamer.bot connected
- [ ] Test with Streamer.bot disconnected
- [ ] Test reconnection after disconnect
- [ ] Check extension logs for errors
- [ ] Verify settings persistence

**For graphics changes:**

- [ ] Test at 720p, 1080p, 1440p
- [ ] Test in OBS browser source
- [ ] Test with Test Mode
- [ ] Check browser console for errors
- [ ] Verify 60fps performance

**For dashboard changes:**

- [ ] Test settings auto-save
- [ ] Test settings load on refresh
- [ ] Verify visual consistency with other panels
- [ ] Test with various input values

## Design Guidelines

### Visual Consistency

- Use colors from the shared palette (see `dashboard/shared-styles.css` or `graphics/danmaku.html` CSS variables)
- Follow existing dashboard layout patterns
- Maintain consistent spacing and sizing
- Use existing utility classes when possible

### Performance Considerations

- Minimize DOM manipulations
- Use hardware-accelerated CSS (`translate3d`, not `left`/`top`)
- Cache measurements when possible
- Use `requestAnimationFrame` for animations
- Avoid forced synchronous layouts

### Accessibility

- Use semantic HTML elements
- Provide keyboard navigation where applicable
- Use sufficient color contrast
- Include descriptive labels

## Dependencies

### Adding New Dependencies

Before adding a new npm dependency:

1. **Check if it's necessary** - Can you accomplish this with existing code?
2. **Consider bundle size** - Will this significantly increase bundle size?
3. **Check license compatibility** - Must be compatible with AGPL-3.0
4. **Verify maintenance** - Is the package actively maintained?

Include justification in your PR description.

### Updating Existing Dependencies

- Test thoroughly after updates
- Check for breaking changes
- Update code if API changes
- Document any migration steps needed

## Code Review Process

### For Contributors

**Before requesting review:**

- [ ] Code follows style guidelines
- [ ] All tests pass (manual testing)
- [ ] Documentation is updated
- [ ] Commit messages are descriptive
- [ ] PR description is clear

**During review:**

- Respond promptly to feedback
- Ask questions if unsure
- Be open to suggestions
- Update code based on feedback

### For Reviewers

**What to check:**

- Code follows conventions
- Logic is sound and efficient
- Edge cases are handled
- Documentation is updated
- No regressions introduced
- Performance impact is acceptable

**How to provide feedback:**

- Be constructive and specific
- Suggest improvements, don't demand
- Explain the "why" behind suggestions
- Approve when ready, request changes if needed

## Priority Areas

We're especially interested in contributions for:

- **Performance optimizations** for chat overlay
- **New alert types** (e.g., raids, channel point redemptions)
- **Visual customization options**
- **Documentation improvements**
- **Bug fixes**
- **Accessibility improvements**

## Questions?

- **GitHub Discussions**: For general questions and discussions
- **GitHub Issues**: For bugs and feature requests
- **Twitch**: Ask during stream at https://twitch.tv/shookieTea

I will help where possible, but I do not want to be tech support for this. I mainly consider this project complete unless you have a magnificent idea, something was missed, or there is an obvious issue.

## License

By contributing, you agree that your contributions will be licensed under the AGPL-3.0 license.

---

Thank you for contributing to Shookie's Stream Suite! Despite considering this complete, I am thankful for any continued development, or if this inspires you to add features or create your own bundles.
