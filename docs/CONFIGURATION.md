# Configuration Guide

This guide covers dashboard settings configuration and OBS browser source setup.

## Dashboard Configuration

Access the NodeCG dashboard at `http://localhost:9090` to configure all settings.

### Streamer.Bot Connection

**Panel: Streamer.Bot**

Configure the WebSocket connection to Streamer.bot:

- **Host**: `127.0.0.1` (default, change if Streamer.bot is on another machine)
- **Port**: `8080` (default, must match Streamer.bot WebSocket server port)

Click **Connect** to establish connection. A green status indicator shows successful connection.

### Chat Overlay (Danmaku)

**Panel: Danmaku**

| Setting              | Range      | Default | Description                            |
| -------------------- | ---------- | ------- | -------------------------------------- |
| **Enabled**          | toggle     | ON      | Master toggle for chat overlay         |
| **Speed Multiplier** | 0.25 - 3.0 | 1.0     | Message scroll speed (higher = faster) |
| **Scale Modifier**   | 0.5 - 2.0  | 1.0     | Text size multiplier                   |
| **Show Usernames**   | toggle     | OFF     | Display username before message        |
| **Show Emotes**      | toggle     | ON      | Display image emotes (Twitch/BTTV/7TV) |
| **Show Emojis**      | toggle     | OFF     | Display Unicode emoji                  |
| **Show Text**        | toggle     | ON      | Display message text                   |

### Event Alerts

**Panel: Alerts**

| Setting            | Range         | Default | Description                                  |
| ------------------ | ------------- | ------- | -------------------------------------------- |
| **Enabled**        | toggle        | ON      | Master toggle for alerts                     |
| **Duration**       | 1000-30000 ms | 5000 ms | How long each alert displays                 |
| **Scale Modifier** | 0.5 - 2.0     | 1.0     | Alert box size multiplier                    |
| **Show Follows**   | toggle        | OFF     | Display follow alerts                        |
| **Show Subs**      | toggle        | ON      | Display subscription alerts (new/resub/gift) |
| **Show Cheers**    | toggle        | ON      | Display cheer/bits alerts                    |

### Rolling Credits

**Panel: Credits**

#### General Settings

| Setting             | Range  | Default          | Description                        |
| ------------------- | ------ | ---------------- | ---------------------------------- |
| **Enabled**         | toggle | ON               | Master toggle for credits tracking |
| **Show Title**      | toggle | ON               | Display credits title              |
| **Title**           | text   | "Stream Credits" | Custom title text                  |
| **Show User Count** | toggle | ON               | Display participant count          |

#### Weighting System

Configure how different contributions are scored:

| Setting             | Range | Default | Description                                |
| ------------------- | ----- | ------- | ------------------------------------------ |
| **Chat Weight**     | 0+    | 1.0     | Points per chat message                    |
| **Sub Weight**      | 0+    | 2.0     | Points per subscription month (cumulative) |
| **Donation Weight** | 0+    | 3.0     | Multiplier for √(USD) from bits/cheers     |

**Example Calculation:**

```
User with 50 messages, 12 sub months, $25 in bits:
  (50 × 1.0) + (12 × 2.0) + (√25 × 3.0) = 89 points
```

#### Timing Settings

| Setting               | Range     | Default | Description                                   |
| --------------------- | --------- | ------- | --------------------------------------------- |
| **Duration Auto**     | toggle    | ON      | Auto-calculate duration based on participants |
| **Duration**          | 3-120 sec | 60      | Manual duration (when auto is OFF)            |
| **Duration Base**     | 1-120 sec | 12      | Base time for auto-calculation                |
| **Duration Per Row**  | 0-5000 ms | 850     | Time added per row in auto-calculation        |
| **Duration Per Name** | 0-1000 ms | 80      | Time added per name in auto-calculation       |

#### Visual Tuning

| Setting                  | Range   | Default | Description                   |
| ------------------------ | ------- | ------- | ----------------------------- |
| **Density**              | 0.6-2.0 | 1.0     | Font density multiplier       |
| **Cloud Gap**            | 0-50 px | 8       | Spacing between cloud names   |
| **Hero Size Multiplier** | 1-3     | 1.6     | Size multiplier for hero rows |

#### Credits Management

- **Show Credits (Real)**: Display rolling credits using live stream statistics
- **Show Credits (Test)**: Display rolling credits using test statistics
- **Reset Real Stats**: Clear all real stream statistics
- **Reset Test Stats**: Clear all test statistics
- **Export/Import**: Backup and restore credit statistics as JSON

### Blocklist

**Panel: Blocklist**

Add usernames (one per line) to block from:

- Chat overlay messages
- Event alerts
- Rolling credits tracking

Blocklist is case-insensitive. Changes apply immediately.

### Test Mode

**Panel: Test Mode**

#### Master Toggle

**Enable Testing Mode** - Gates ALL test functionality and debug logging

#### Auto-Generation

| Setting                    | Range    | Default | Description                              |
| -------------------------- | -------- | ------- | ---------------------------------------- |
| **Auto-Generate Messages** | toggle   | OFF     | Enable automatic test message generation |
| **Messages Per Minute**    | 1-300    | 60      | Test message frequency                   |
| **Auto-Generate Subs**     | toggle   | OFF     | Auto-generate test subscriptions         |
| **Auto-Generate Follows**  | toggle   | OFF     | Auto-generate test follows               |
| **Auto-Generate Cheers**   | toggle   | OFF     | Auto-generate test cheers                |
| **Alert Interval**         | 2-60 sec | 6       | Time between auto-generated alerts       |

#### Manual Test Buttons

- **Send Test Message**: Generate single test chat message
- **Send Test Sub**: Generate test subscription
- **Send Test Resub**: Generate test resubscription
- **Send Test Gift Sub**: Generate test gift subscription
- **Send Test Follow**: Generate test follow
- **Send Test Cheer**: Generate test cheer
- **Clear All Messages**: Clear all messages from overlay

**Note:** Manual test buttons work independently of auto-generation toggles, but master toggle must be enabled.

## OBS Browser Source Setup

### 1. Chat Overlay

Add a **Browser Source** to your OBS scene:

- **URL**: `http://localhost:9090/bundles/nodecg-shookie-stream-suite/graphics/danmaku.html`
- **Width**: Your stream canvas width (e.g., 1920)
- **Height**: Your stream canvas height (e.g., 1080)
- **Shutdown source when not visible**: OFF
- **Refresh browser when scene becomes active**: OFF

**Important:** Do NOT check "Local file" - must use the HTTP URL.

### 2. Event Alerts

Add a **Browser Source** to your OBS scene:

- **URL**: `http://localhost:9090/bundles/nodecg-shookie-stream-suite/graphics/alerts.html`
- **Width**: Your stream canvas width
- **Height**: Your stream canvas height

Alerts appear in the bottom-right corner and scale automatically.

### 3. Rolling Credits

Add a **Browser Source** to your OBS scene:

- **URL**: `http://localhost:9090/bundles/nodecg-shookie-stream-suite/graphics/credits.html`
- **Width**: Your stream canvas width
- **Height**: Your stream canvas height

Trigger credits from the dashboard Credits panel.

### 4. Frosted Border (Optional)

Add a **Browser Source** for decorative camera overlay:

- **URL**: `http://localhost:9090/bundles/nodecg-shookie-stream-suite/graphics/frosted-border.html`
- **Width**: Your stream canvas width
- **Height**: Your stream canvas height

Layer this over your camera source for a frosted glass frame effect.

## Resolution & Scaling

All graphics auto-scale to any viewport size. Supported resolutions:

- 720p (1280×720)
- 936p (1664×936)
- 1080p (1920×1080)
- 1440p (2560×1440)
- 2160p/4K (3840×2160)

Works with 16:9, 21:9, and other aspect ratios. Use dashboard sliders to fine-tune sizing.

## Settings Persistence

All settings are automatically saved and persist between NodeCG restarts. No manual save required.

## Next Steps

- **[Features Guide](FEATURES.md)** - Learn how each feature works
- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues and solutions
