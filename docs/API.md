# API Reference

NodeCG message events and replicant schemas for integrating with Shookie's Stream Suite.

## NodeCG Messages

### Extension -> Graphics

#### `danmaku:message`

Sends a normalized chat message to the chat overlay graphic.

**Payload:**

```javascript
{
  messageId: string,      // Unique message ID
  username: string,       // Display name
  text: string,           // Message text
  color: string,          // Username color (hex format)
  badges: Array<{         // User badges
    name: string,
    version: string,
    imageUrl: string
  }>,
  emotes: Array<{         // Emotes in message
    id: string,
    name: string,
    startIndex: number,
    endIndex: number,
    imageUrl: string
  }>
}
```

#### `danmaku:delete`

Deletes a specific message from the chat overlay.

**Payload:**

```javascript
{
  messageId: string; // ID of message to delete
}
```

#### `danmaku:deleteUser`

Deletes all messages from a specific user (timeout/ban).

**Payload:**

```javascript
{
  username: string; // Username whose messages to delete
}
```

#### `danmaku:clearAll`

Clears all messages from the chat overlay.

**Payload:** None

#### `alert:show`

Shows an alert in the alerts graphic.

**Payload:**

```javascript
{
  type: 'follow' | 'sub' | 'resub' | 'giftsub' | 'cheer',
  displayName: string,

  // For subscriptions:
  tier?: 1 | 2 | 3,       // Subscription tier
  months?: number,        // Cumulative months (resub only)
  recipient?: string,     // Gift recipient (giftsub only)
  message?: string,       // Optional message

  // For cheers:
  bits?: number,          // Bits amount
  message?: string        // Cheer message
}
```

### Dashboard -> Extension

#### Connection Control

**`streamerbot:connect`**

Initiates connection to Streamer.bot WebSocket server.

**Payload:** None

**`streamerbot:disconnect`**

Disconnects from Streamer.bot WebSocket server.

**Payload:** None

#### Test Mode

**`test:sendMessage`**

Generates and processes a test chat message.

**Payload:** None

**`test:sendSub`**

Generates a test subscription event.

**Payload:** None

**`test:sendResub`**

Generates a test resubscription event.

**Payload:** None

**`test:sendGiftSub`**

Generates a test gift subscription event.

**Payload:** None

**`test:sendFollow`**

Generates a test follow event.

**Payload:** None

**`test:sendCheer`**

Generates a test cheer event.

**Payload:** None

**`test:clearAll`**

Clears all danmaku messages (equivalent to `danmaku:clearAll`).

**Payload:** None

#### Credits Management

**`credits:show`**

Shows rolling credits.

**Payload:**

```javascript
{
  which: 'real' | 'test'; // Which stats to use
}
```

**`credits:hide`**

Hides currently displayed rolling credits.

**Payload:** None

**`credits:resetReal`**

Resets real credits statistics.

**Payload:** None

**`credits:resetTest`**

Resets test credits statistics.

**Payload:** None

**`credits:exportReal`**

Exports real credits statistics.

**Payload:** None

**Returns (via acknowledgment):**

```javascript
{
  chatCounts: { [username: string]: number },
  subMonths: { [username: string]: number },
  donoUSD: { [username: string]: number }
}
```

**`credits:exportTest`**

Exports test credits statistics.

**Payload:** None

**Returns:** Same structure as `credits:exportReal`

**`credits:importReal`**

Imports and merges real credits statistics.

**Payload:**

```javascript
{
  chatCounts: { [username: string]: number },
  subMonths: { [username: string]: number },
  donoUSD: { [username: string]: number }
}
```

**Returns (via acknowledgment):**

```javascript
{
  success: boolean;
}
```

**`credits:importTest`**

Imports and merges test credits statistics.

**Payload:** Same structure as `credits:importReal`

**Returns:** Same structure as `credits:importReal`

**`credits:estimateReal`**

Estimates duration for real credits.

**Payload:** None

**Returns (via acknowledgment):**

```javascript
{
  duration: number,       // Estimated duration in seconds
  userCount: number,      // Total users tracked
  rowEstimate: number     // Estimated number of rows
}
```

**`credits:estimateTest`**

Estimates duration for test credits.

**Payload:** None

**Returns:** Same structure as `credits:estimateReal`

## Replicants

### `settings`

**Schema:** `schemas/settings.json`

**Structure:**

```javascript
{
  streamerBot: {
    host: string,         // Default: "127.0.0.1"
    port: number          // Default: 8080
  },

  danmaku: {
    enabled: boolean,     // Default: true
    speedMult: number,    // Range: 0.25-3.0, Default: 1.0
    scaleModifier: number,// Range: 0.5-2.0, Default: 1.0
    showUsernames: boolean,// Default: false
    showEmotes: boolean,  // Default: true
    showEmojis: boolean,  // Default: false
    showText: boolean     // Default: true
  },

  credits: {
    enabled: boolean,     // Default: true
    chatWeight: number,   // Default: 1.0
    subWeight: number,    // Default: 2.0
    donoWeight: number,   // Default: 3.0
    durationAuto: boolean,// Default: true
    duration: number,     // Range: 3-120, Default: 60
    durationBaseSec: number,// Default: 12
    durationPerRowMs: number,// Default: 850
    durationPerNameMs: number,// Default: 80
    showTitle: boolean,   // Default: true
    title: string,        // Default: "Stream Credits"
    showUserCount: boolean,// Default: true
    density: number,      // Range: 0.6-2.0, Default: 1.0
    cloudGap: number,     // Range: 0-50, Default: 8
    heroSizeMult: number  // Range: 1-3, Default: 1.6
  },

  alerts: {
    enabled: boolean,     // Default: true
    paused: boolean,      // Default: false
    duration: number,     // Range: 1000-30000, Default: 5000
    scaleModifier: number,// Range: 0.5-2.0, Default: 1.0
    showFollows: boolean, // Default: false
    showSubs: boolean,    // Default: true
    showCheers: boolean   // Default: true
  },

  blockList: {
    usernames: string[]   // Default: []
  },

  testMode: {
    masterEnabled: boolean,// Default: false
    autoGenMessages: boolean,// Default: false
    messagesPerMinute: number,// Range: 1-300, Default: 60
    autoGenSubs: boolean, // Default: false
    autoGenFollows: boolean,// Default: false
    autoGenCheers: boolean,// Default: false
    alertInterval: number // Range: 2-60, Default: 6
  }
}
```

### `creditsStats`

**Schema:** `schemas/creditsStats.json`

**Purpose:** Real stream statistics for rolling credits

**Structure:**

```javascript
{
  chatCounts: {
    [username: string]: number  // Chat message count per user
  },
  subMonths: {
    [username: string]: number  // Cumulative sub months per user
  },
  donoUSD: {
    [username: string]: number  // Total USD donated per user
  }
}
```

**Notes:**

- Usernames are stored in lowercase
- Automatically updated by extension on stream events
- Persisted to disk by NodeCG

### `testCreditsStats`

**Schema:** `schemas/creditsStats.json` (same as creditsStats)

**Purpose:** Test mode statistics (isolated from real data)

**Structure:** Same as `creditsStats`

### `connectionStatus`

**Purpose:** Streamer.bot WebSocket connection state

**Structure:**

```javascript
{
  connected: boolean,     // Connection state
  error: string | null,   // Error message or null
  host: string,           // Current host
  port: number            // Current port
}
```

**Notes:**

- Not persisted (runtime state only)
- Updated by extension
- Read by dashboard connection panel

## Streamer.bot Event Structures

These are the event structures received from Streamer.bot WebSocket.

### `Twitch.ChatMessage`

```javascript
{
  messageId: string,
  text: string,
  user: {
    id: string,
    login: string,
    name: string,
    role: 0 | 1 | 2 | 3 | 4,
    badges: Array<{ name, version, imageUrl }>,
    color: string
  },
  emotes: Array<{
    id, name, startIndex, endIndex, imageUrl
  }>
}
```

### `Twitch.ChatMessageDeleted`

```javascript
{
  messageId: string,
  targetUser: { id, login, name }
}
```

### `Twitch.UserTimedOut`

```javascript
{
  targetUser: { id, login, name },
  duration: number,
  reason: string
}
```

### `Twitch.Sub`

```javascript
{
  sub_tier: "1000" | "2000" | "3000",
  is_prime: boolean,
  user: { id, login, name }
}
```

### `Twitch.ReSub`

```javascript
{
  cumulativeMonths: number,
  subTier: "1000" | "2000" | "3000",
  text: string,
  user: { id, login, name }
}
```

### `Twitch.GiftSub`

```javascript
{
  subTier: "1000" | "2000" | "3000",
  recipient: { id, login, name },
  user: { id, login, name }  // Gifter
}
```

### `Twitch.Cheer`

```javascript
{
  message: {
    bits: number,
    displayName: string,
    message: string
  }
}
```

### `Twitch.Follow`

```javascript
{
  user_id: string,
  user_login: string,
  user_name: string,
  followed_at: string  // ISO timestamp
}
```

## Usage Examples

### Sending a Custom Message to Danmaku

```javascript
nodecg.sendMessage('danmaku:message', {
  messageId: 'custom-123',
  username: 'TestUser',
  text: 'Hello from custom code!',
  color: '#FF0000',
  badges: [],
  emotes: [],
});
```

### Triggering Credits Programmatically

```javascript
nodecg.sendMessage('credits:show', { which: 'real' });
```

### Reading Settings from Graphics

```javascript
const settingsRep = nodecg.Replicant('settings');

settingsRep.on('change', (newValue) => {
  const danmakuEnabled = newValue?.danmaku?.enabled;
  console.log('Danmaku enabled:', danmakuEnabled);
});
```

### Updating Settings from Extension

```javascript
const settingsRep = nodecg.Replicant('settings');

// Read current settings
const currentSettings = settingsRep.value;

// Update specific setting
settingsRep.value = {
  ...currentSettings,
  danmaku: {
    ...currentSettings.danmaku,
    speedMult: 1.5,
  },
};
```

## Next Steps

- **[Architecture](ARCHITECTURE.md)** - Technical deep-dive
- **[Development](DEVELOPMENT.md)** - Contributing guide
