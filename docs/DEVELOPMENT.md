# Development Guide

Guide for contributing to Shookie's Stream Suite.

## Development Setup

### Prerequisites

- Node.js v22+
- NodeCG 2.x installed and running
- Git
- Code editor (VS Code recommended)

### Clone and Setup

```bash
# Clone the repository
git clone https://github.com/shookieTea/nodecg-shookie-stream-suite.git
cd nodecg-shookie-stream-suite

# Install dependencies
npm install

# Start NodeCG (from NodeCG root directory)
cd ../..
node .
```

### Development Workflow

1. Make changes to extension/graphics/dashboard files
2. Refresh NodeCG dashboard in browser
3. Refresh OBS browser sources (or use Test Mode)
4. Test with Streamer.bot or Test Mode
5. Commit changes with descriptive messages

## Project Structure

```
nodecg-shookie-stream-suite/
├── extension/          Extension code (server-side)
│   ├── index.js        Main entry point
│   ├── constants.js    Magic numbers, event names, defaults
│   ├── types.js        JSDoc type definitions
│   ├── validate.js     Validation and normalization
│   ├── logger.js       Conditional debug logger
│   ├── test-data.js    Test data generation
│   └── test-alerts.js  Test alert generation
├── graphics/           OBS browser source overlays
│   ├── danmaku.html    Chat overlay
│   ├── alerts.html     Event alerts
│   ├── credits.html    Rolling credits
│   ├── frosted-border.html  Decorative border
│   ├── shared-logger.js     Shared logging utility
│   ├── shared-utils.js      Shared utility functions
│   └── viewport-utils.js    Viewport scaling calculations
├── dashboard/          NodeCG dashboard panels
│   ├── connection.html Streamer.bot connection
│   ├── danmaku.html    Chat overlay settings
│   ├── credits.html    Rolling credits settings
│   ├── alerts.html     Event alert settings
│   ├── blocklist.html  User blocklist
│   ├── test-mode.html  Test mode controls
│   ├── shared.js       Shared dashboard utilities
│   └── shared-styles.css  Shared CSS styles
├── schemas/            JSON schemas for replicants
│   ├── settings.json
│   └── creditsStats.json
├── docs/               Documentation
├── package.json        Bundle metadata and dependencies
└── README.md           Main documentation
```

## Code Conventions

### JavaScript Style

**Naming Conventions:**

- **camelCase**: Functions, variables, parameters
- **PascalCase**: Classes, constructors
- **SCREAMING_SNAKE_CASE**: Constants

**Examples:**

```javascript
// Good
const MAX_ACTIVE = 100;
function handleChatMessage() {}
class TestModeManager {}

// Bad
const max_active = 100;
function HandleChatMessage() {}
class testModeManager {}
```

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

### JSDoc Comments

Use JSDoc for type safety without TypeScript:

```javascript
/**
 * Validates chat message data
 * @param {import('./types').ChatMessageEvent} data - Raw event data
 * @returns {import('./types').NormalizedMessage|null} Normalized message or null
 */
function normalizeChatMessage(data) {
  // ...
}
```

**Keep JSDoc concise:**

- Single-line description
- @param and @returns types
- Avoid restating what code already shows

### Error Handling

Follow extension error handling conventions:

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

**Critical Failures:**

```javascript
if (!requiredModule) {
  throw new Error('Required module failed to load');
}
```

### CSS Conventions

**Use BEM-lite for class names:**

```css
.danmaku-message {
}
.danmaku-username {
}
.danmaku-emote {
}
```

**Use CSS custom properties for colors:**

```css
:root {
  --color-alert-follow: 149, 128, 255;
}

.alert-follow {
  background: rgba(var(--color-alert-follow), 0.2);
}
```

## Common Modification Scenarios

### Adding a New Setting

1. **Add to schema** (`schemas/settings.json`):

```json
{
  "newSetting": {
    "type": "boolean",
    "default": true
  }
}
```

2. **Add constant** (`extension/constants.js`):

```javascript
const DEFAULTS = {
  NEW_SETTING: true,
};
```

3. **Add to dashboard panel** (`dashboard/example.html`):

```html
<label class="inline">
  <input type="checkbox" data-settings-path="section.newSetting" checked />
  Enable New Feature
</label>
```

4. **Use `createImmediateSave()`** for checkboxes:

```javascript
createImmediateSave(settingsRep, 'section.newSetting', checkbox);
```

5. **Read in extension/graphics**:

```javascript
const enabled = settingsRep.value?.section?.newSetting;
```

### Adding a New Streamer.bot Event Handler

1. **Define event structure** (`extension/types.js`):

```javascript
/**
 * @typedef {Object} RaidEvent
 * @property {number} viewerCount - Raider count
 * @property {TwitchUser} user - Raider user
 */
```

2. **Add event constant** (`extension/constants.js`):

```javascript
const STREAMERBOT_EVENTS = {
  RAID: 'Twitch.Raid',
};
```

3. **Create handler** (`extension/index.js`):

```javascript
function handleRaid({ event, data }) {
  logger.info('[Raid] Received:', JSON.stringify(data, null, 2));

  const username = extractUsername(data);
  const viewerCount = data.viewerCount || 0;

  // Process raid...
}
```

4. **Subscribe to event** (`extension/index.js` in `connectStreamerbot()`):

```javascript
sbClient.on(STREAMERBOT_EVENTS.RAID, handleRaid);
```

5. **Add normalization** (`extension/validate.js`):

```javascript
function normalizeRaid(data) {
  if (!data || !data.user) return null;
  return {
    username: extractUsername(data),
    viewerCount: data.viewerCount || 0,
  };
}
```

### Adding a New Alert Type

1. **Add template** (`graphics/alerts.html`):

```javascript
const ALERT_TEMPLATES = {
  raid: (data) =>
    `${esc(data.displayName)} raided with ${data.viewerCount} viewers!`,
};
```

2. **Add setting** (`schemas/settings.json`):

```json
{
  "showRaids": {
    "type": "boolean",
    "default": true
  }
}
```

3. **Add dashboard toggle** (`dashboard/alerts.html`):

```html
<label class="inline">
  <input type="checkbox" data-settings-path="alerts.showRaids" checked />
  Show Raid Alerts
</label>
```

4. **Update handler** (`extension/index.js`):

```javascript
function handleRaid({ event, data }) {
  if (!isAlertEnabled('raids')) return;

  const alertData = buildAlertData('raid', {
    displayName: username,
    viewerCount: viewerCount,
  });

  nodecg.sendMessage(EVENTS.ALERT_SHOW, alertData);
}
```

### Modifying Collision Detection

All collision logic is in `graphics/danmaku.html`:

- `tryPlace()` - Main collision detection function
- `hasVerticalOverlap()` - Vertical gap check
- `hasInitialSpawnGap()` - Horizontal spawn check
- `wouldOvertake()` - Faster message catch-up check

**Testing collision changes:**

1. Enable Test Mode in dashboard
2. Set Messages Per Minute to 120-180
3. Observe message placement behavior
4. Adjust constants (H_GAP, V_GAP, OVERLAP_TOLERANCE)

## Debugging

### Enable Debug Logging

1. Open NodeCG dashboard
2. Navigate to **Test Mode** panel
3. Toggle **Enable Testing Mode** (master toggle)
4. Check browser console for detailed logs

### Graphics Console Access

Open graphics directly in browser to access console:

- **Chat Overlay**: `http://localhost:9090/bundles/nodecg-shookie-stream-suite/graphics/danmaku.html`
- **Alerts**: `http://localhost:9090/bundles/nodecg-shookie-stream-suite/graphics/alerts.html`
- **Credits**: `http://localhost:9090/bundles/nodecg-shookie-stream-suite/graphics/credits.html`

### Extension Logs

Extension logs appear in NodeCG console/terminal:

```bash
# From NodeCG root
node . | grep "nodecg-shookie-stream-suite"
```

### Common Debug Scenarios

**Messages not appearing:**

- Check `settings.danmaku.enabled`
- Verify Streamer.bot connection
- Check browser console for errors
- Verify `danmaku:message` events being sent

**Credits not tracking:**

- Check `settings.credits.enabled`
- Verify events are being received
- Check `creditsStats` replicant in NodeCG dashboard
- Check blocklist

**Alerts not showing:**

- Check `settings.alerts.enabled`
- Verify per-type toggles
- Check alert queue state in console
- Test with manual buttons

## Testing

### Manual Testing with Test Mode

**Chat Messages:**

1. Enable Test Mode (master toggle)
2. Use "Send Test Message" button
3. Or enable Auto-Generate Messages (1-300 msg/min)

**Alerts:**

1. Enable Test Mode
2. Use individual alert test buttons
3. Or enable Auto-Generate Alerts

**Credits:**

1. Enable Test Mode
2. Generate test data (messages/subs/cheers)
3. Click "Show Credits (Test)"

### Testing with Streamer.bot

1. Configure Streamer.bot WebSocket (default: 127.0.0.1:8080)
2. Connect in dashboard
3. Trigger events via Twitch chat
4. Monitor extension logs and graphics console

## Performance Profiling

### Chat Overlay Performance

Open `danmaku.html` in browser and use Chrome DevTools:

1. **Performance Tab**: Record while messages are flowing
2. **Check frame rate**: Should maintain 60fps with ~100 messages
3. **Identify bottlenecks**: Look for long tasks or forced layouts
4. **Profile JavaScript**: Check for hot paths in collision detection

### Memory Leaks

1. Open graphics in browser
2. DevTools -> Memory -> Take heap snapshot
3. Generate many test messages
4. Take another snapshot
5. Compare snapshots for growing objects

## Contributing

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly with Test Mode and Streamer.bot
5. Commit with descriptive messages
6. Push to your fork
7. Open a Pull Request with detailed description

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

**Example:**

```
feat: add raid alert support

- Add Streamer.bot raid event handler
- Create raid alert template
- Add dashboard toggle for raid alerts
- Add raid test generation

Closes #42
```

### Code Review Guidelines

**For reviewers:**

- Test changes with Test Mode
- Verify documentation updates
- Check for potential performance impacts
- Ensure code follows conventions

**For contributors:**

- Add JSDoc comments for new functions
- Update relevant documentation
- Test with both Test Mode and Streamer.bot
- Ensure no console errors or warnings

## Resources

- **NodeCG Documentation**: https://www.nodecg.dev/
- **Streamer.bot API**: https://docs.streamer.bot/
- **Twitch EventSub**: https://dev.twitch.tv/docs/eventsub/

## Next Steps

- **[API Reference](API.md)** - NodeCG messages and replicants
- **[Architecture](ARCHITECTURE.md)** - Technical deep-dive
- **[Features](FEATURES.md)** - Feature documentation
