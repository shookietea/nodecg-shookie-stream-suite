# Architecture

Technical deep-dive into the bundle's architecture and design patterns.

## System Overview

Shookie's Stream Suite is a **NodeCG 2.0 bundle** that connects to Streamer.bot via WebSocket to receive Twitch events and displays them as animated overlays.

### Message-Driven Architecture

The architecture follows a **unidirectional message flow pattern**:

```
Streamer.bot Events -> Extension (normalize/validate) -> Replicants (state) -> Graphics/Dashboard (render)
                                   ↓
                            Track Credits Stats
```

### Three Core Systems

1. **Extension** (`extension/index.js`) - Event processor and state manager
2. **Graphics** (`graphics/*.html`) - OBS browser source overlays
3. **Dashboard** (`dashboard/*.html`) - Configuration panels in NodeCG dashboard

## Detailed Architecture Diagram

```
┌─────────────────────────────────┐
│   Streamer.bot (WebSocket)      │
└────────────┬────────────────────┘
             │ (9 Twitch events)
             ↓
┌─────────────────────────────────┐
│  Extension (extension/index.js) │
│  - Normalizes & validates       │
│  - Tracks credits               │
│  - Routes to graphics           │
└─┬──────────┬────────────┬───────┘
  │ Updates  │ Sends      │ Sends
  ↓          ↓            ↓
Replicants   danmaku:msg  alert:show
             credits:show
             ↓            ↓
┌────────────────────────────────┐
│    Graphics (OBS Browser)       │
├────────────────────────────────┤
│ danmaku.html        - 3-tier   │
│ alerts.html         - FIFO     │
│ credits.html        - Hero+Cld │
│ frosted-border.html - Frame    │
└────────────────────────────────┘
  ↑
  │ Reads/Controls
┌────────────────────────────────┐
│   Dashboard (NodeCG panels)    │
├────────────────────────────────┤
│ connection.html - WebSocket    │
│ danmaku.html    - Chat Settings│
│ credits.html    - Credits Ctrl │
│ alerts.html     - Alert Config │
│ blocklist.html  - User Filter  │
│ test-mode.html  - Testing      │
└────────────────────────────────┘
```

## Extension System

### Entry Point (`extension/index.js`)

Single orchestrator for all three overlay systems.

**Responsibilities:**

1. **WebSocket Management**
   - Connects to Streamer.bot using `@streamerbot/client`
   - Auto-subscribes to 9 specific Twitch events (not all 465+)
   - Handles reconnection with unlimited retries
   - Updates `connectionStatus` replicant

2. **Event Processing Pipeline**
   - Receives events from Streamer.bot
   - Normalizes data to consistent schema (`extension/validate.js`)
   - Validates required fields
   - Applies blocklist filtering

3. **Rolling Credits Tracking**
   - Updates `creditsStats` replicant for real events
   - Updates `testCreditsStats` replicant for test events
   - Tracks: chat counts, subscription months, donation amounts
   - Uses factory pattern (`createCreditsTracker`) for code reuse

4. **Message Routing to Overlays**
   - Sends `danmaku:message` to Chat Overlay graphic
   - Sends `alert:show` to Alerts graphic
   - Sends `credits:show` to Rolling Credits graphic
   - Respects enabled/disabled settings before routing

5. **Test Mode Management**
   - `TestModeManager` class handles auto-generation
   - Master toggle gates all test functionality
   - Generates test data matching real Streamer.bot structures
   - Routes test events through same handlers as real events

6. **Dashboard Command Handling**
   - Listens for credits control messages (show/hide/reset/export/import)
   - Processes manual test buttons
   - Manages connection control (connect/disconnect)

### Code Organization

```
extension/
├── index.js              Main entry point, Streamer.bot client, event handlers
├── constants.js          All magic numbers, event names, defaults
├── types.js              JSDoc type definitions for IDE autocomplete
├── validate.js           Validation and normalization functions
├── logger.js             Conditional debug logger (gated by test mode)
├── test-data.js          Test username/message generation
└── test-alerts.js        Test alert event generation
```

### Event Normalization Pattern

All Streamer.bot events follow this flow:

1. **Handler** (e.g., `handleChatMessage`) - Extracts relevant fields
2. **Normalize** - Standardizes to known schema
3. **Validate** - Checks for required fields
4. **Process** - Routes to tracker/sender

**Example:**

```javascript
function handleChatMessage({ event, data }) {
  // 1. Normalize
  const normalized = normalizeChatMessage(data);
  if (!normalized) return;

  // 2. Track credits
  trackCredits('chat', data, { username: normalized.username });

  // 3. Check blocklist
  if (isBlocked(normalized.username, blocklist)) return;

  // 4. Forward to graphics
  nodecg.sendMessage(EVENTS.DANMAKU_MESSAGE, normalized);
}
```

### Credits Tracking Pattern

**Factory Function** (`createCreditsTracker`):

- Eliminates duplication between test and real stats
- Single implementation: `trackChat()`, `trackSubscription()`, `trackDonation()`
- All events routed through unified dispatcher

```javascript
const realCredits = createCreditsTracker(creditsStatsRep, 'Real Credits');
const testCredits = createCreditsTracker(testCreditsStatsRep, 'Test Credits');

// Route based on event flag
function trackCredits(type, data, params) {
  const tracker = data.is_test ? testCredits : realCredits;
  tracker[methods[type]](...Object.values(params));
}
```

### Error Handling Conventions

From `extension/index.js`:33-57:

1. **Validation Failures** (invalid/missing data):
   - Use `logger.warn()` to log the issue
   - Return early (don't throw)
   - Example: Invalid Streamer.bot event data

2. **External Errors** (network, WebSocket):
   - Use try/catch blocks
   - Use `logger.error()` to log the error
   - Handle gracefully (don't crash)
   - Example: WebSocket connection failures

3. **Critical Failures** (should never happen):
   - Throw exceptions
   - Let NodeCG handle crash/restart
   - Example: Failed to load required module

4. **User Errors** (blocked by settings):
   - Use `logger.warn()` for rejected actions
   - Provide clear message about why
   - Example: Test mode disabled, rejecting manual test

## Graphics System

### Chat Overlay (`graphics/danmaku.html`)

**Three-Tier Queue System:**

```
Hold Queue (5s delay) -> Pending Queue -> Collision Detection -> Active Display
```

**Collision Detection Algorithm:**
All collision logic in three functions:

- `tryPlace()` - Main collision detection coordinator
- `hasVerticalOverlap()` - Vertical gap check
- `hasInitialSpawnGap()` - Horizontal spawn check
- `wouldOvertake()` - Faster message catch-up check

**Data Structures:**

```javascript
const holdQueue = []; // Messages waiting 5s
const pendingQueue = []; // Ready for placement
const activeMessages = []; // Currently animating

const messageMap = new Map(); // messageId -> message (O(1) deletion)
const userMessages = new Map(); // username -> Set<messageId> (O(1) user deletion)
```

**Performance Optimizations:**

- `requestAnimationFrame` with delta-time animation
- Fixed drain budget: 6 messages per frame
- Hardware-accelerated transforms (`translate3d`)
- O(1) deletions via lookup structures
- Cached width measurements

### Event Alerts (`graphics/alerts.html`)

**Simple FIFO Queue:**

- Sequential display (one at a time)
- Configurable duration (1-30 seconds)
- Fade in/out transitions (200ms)

**Alert Templates:**
Centralized `ALERT_TEMPLATES` object for templating:

```javascript
const ALERT_TEMPLATES = {
  follow: (data) => `${esc(data.displayName)} followed!`,
  sub: (data) => `${esc(data.displayName)} subscribed (Tier ${data.tier})!`,
  // ...
};
```

XSS protection via `escapeHTML()`.

### Rolling Credits (`graphics/credits.html`)

**Weighted Scoring:**

```javascript
Weight = (chatCount × wChat) + (subMonths × wSub) + (√USD × wDon)
```

**Hero Determination:**

```javascript
heroCount = Math.min(4, Math.max(0, Math.round(Math.log2(list.length + 1))));
```

**Animation Timing:**

- Snap Mode: Row-by-row transitions (default)
- Smooth Mode: Continuous scroll (when transitions < 180ms)
- Token-based cancellation prevents race conditions

## Dashboard Panels

### Shared Utilities (`dashboard/shared.js`)

**Core Functions:**

- `createAutoSave()` - Debounced replicant updates (500ms)
- `createImmediateSave()` - Instant updates for checkboxes
- `createSettingsLoader()` - Two-way binding of settings to DOM
- `createCreditsCountdown()` - Rolling credits timer/progress tracking

**Dashboard as Source of Truth Pattern:**

- Dashboard HTML defaults (`checked`, `value="1.0"`) are canonical
- On first load, dashboard reads `undefined` from replicant and saves its HTML defaults
- Extension never has conflicting default definitions
- Eliminates synchronization bugs between extension and dashboard

## Replicants

### State Management

Four NodeCG replicants for shared state:

#### `settings`

- **Schema**: `schemas/settings.json`
- **Purpose**: All configuration settings
- **Access**: Read/write from dashboard, read-only from graphics
- **Persistence**: Auto-saved to disk by NodeCG

#### `creditsStats`

- **Schema**: `schemas/creditsStats.json`
- **Purpose**: Real stream statistics for rolling credits
- **Structure**:
  ```json
  {
    "chatCounts": { "username": count },
    "subMonths": { "username": months },
    "donoUSD": { "username": amount }
  }
  ```
- **Access**: Updated by extension, read by dashboard/graphics
- **Persistence**: Auto-saved to disk by NodeCG

#### `testCreditsStats`

- **Schema**: `schemas/creditsStats.json` (same as creditsStats)
- **Purpose**: Test mode statistics (isolated from real data)
- **Structure**: Same as `creditsStats`
- **Access**: Updated by extension (test mode), read by dashboard/graphics
- **Persistence**: Auto-saved to disk by NodeCG

#### `connectionStatus`

- **Purpose**: Streamer.bot WebSocket connection state
- **Structure**:
  ```json
  {
    "connected": boolean,
    "error": string | null,
    "host": string,
    "port": number
  }
  ```
- **Access**: Updated by extension, read by dashboard
- **Persistence**: Not persisted (runtime state only)

### Settings Propagation Flow

```
User changes dashboard input
    ↓
Auto-save to replicant (debounced 500ms)
    ↓
settingsRep.on('change') listener fires in extension & graphics
    ↓
Extension: TestModeManager updates timers
    ↓
Graphics: Re-read settings and apply (e.g., speed multiplier)
```

## Message Flow Examples

### Chat Message Flow

```
Streamer.bot Event (Twitch.ChatMessage)
    ↓
Extension: handleChatMessage()
    ↓
Normalize & validate data
    ↓
trackCredits('chat', username)
    ↓
Check blocklist (reject if blocked)
    ↓
nodecg.sendMessage('danmaku:message', normalizedData)
    ↓
Graphics: addMessage()
    ↓
Hold Queue (5s delay for moderation)
    ↓
Pending Queue (collision detection)
    ↓
Active Messages (animating on screen)
    ↓
Off-screen removal
```

### Subscription Flow

```
Streamer.bot Event (Twitch.Sub/ReSub/GiftSub)
    ↓
Extension: handleSubscription()
    ↓
Extract username, tier, months
    ↓
trackCredits('subscription', username, months)
    ↓
Check if subs enabled in alerts settings
    ↓
buildAlertData('sub', {...})
    ↓
nodecg.sendMessage('alert:show', alertData)
    ↓
Graphics: Enqueue alert
    ↓
Sequential display with fade animation
```

## Design Patterns

### Factory Pattern

Used for credits tracking to eliminate code duplication:

```javascript
function createCreditsTracker(statsReplicant, label) {
  return {
    trackChat(username) {
      /* ... */
    },
    trackSubscription(username, months) {
      /* ... */
    },
    trackDonation(username, usd) {
      /* ... */
    },
  };
}
```

### Observer Pattern

NodeCG replicants act as observable state:

```javascript
settingsRep.on('change', (newValue) => {
  testModeManager.update(newValue);
});
```

### Command Pattern

Dashboard sends commands to extension via NodeCG messages:

```javascript
nodecg.listenFor(EVENTS.CREDITS_SHOW, (data) => {
  // Handle show credits command
});
```

## Performance Considerations

### Chat Overlay Capacity Limits

The real limit is **screen space and collision detection**, not raw performance:

**At 1080p:**

- Estimated rows: ~23
- Messages per row: 3-4
- Realistic max: ~69-92 concurrent messages

**Dynamic MAX_ACTIVE:**

```javascript
const rowHeight = BASE_FONT_SIZE * ROW_STEP_FACTOR + V_GAP;
const estimatedRows = Math.floor((H * 0.9) / rowHeight);
MAX_ACTIVE = Math.max(50, estimatedRows * 4);
```

### Processing Budget

- **DRAIN_BUDGET**: 6 messages processed per frame (constant)
- **MAX_PENDING**: 600 maximum pending queue size
- **Dynamic Speed Scaling**: 1.0x to 2.0x based on queue depth

### DOM Optimizations

- CSS containment on stage and messages
- Hardware acceleration via `translate3d()`
- `will-change: transform` hints
- Cached width/height measurements
- Batch DOM appends with DocumentFragment

## Next Steps

- **[API Reference](API.md)** - NodeCG messages and replicant schemas
- **[Development Guide](DEVELOPMENT.md)** - Contributing and code conventions
