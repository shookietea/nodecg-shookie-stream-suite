# Features Guide

Detailed documentation for each feature in Shookie's Stream Suite.

## Chat Overlay (Danmaku)

Niconico-style scrolling messages with advanced collision detection and performance optimization.

### How It Works

Messages scroll from right to left across your stream in a style popularized by Niconico video comments. Each message is positioned to avoid overlapping with other messages using a sophisticated three-tier queue system.

### Three-Tier Queue System

```
Hold Queue (5s delay) -> Pending Queue -> Active Display -> Off-screen Removal
```

1. **Hold Queue (5 seconds)**: Messages wait here before appearing, allowing time for moderation (deletions, timeouts) to take effect
2. **Pending Queue**: Messages ready for collision detection and placement
3. **Active Messages**: Currently animating on screen

### Collision Detection

The system uses a three-part algorithm to prevent message overlaps:

1. **Vertical Gap Check**: Ensures messages don't overlap vertically (with V_GAP buffer)
2. **Initial Spawn Gap Check**: Ensures horizontal separation at spawn point (with H_GAP buffer)
3. **Overtake Prevention**: Prevents faster messages from catching slower ones before they exit

### Dynamic Speed Scaling

Messages automatically speed up as the queue grows to minimize latency:

| Pending Messages | Speed Multiplier | Description          |
| ---------------- | ---------------- | -------------------- |
| 0-2              | 1.0x             | Normal speed         |
| 3-7              | 1.2x             | Slight boost (20%)   |
| 8-14             | 1.4x             | Moderate boost (40%) |
| 15-24            | 1.7x             | High boost (70%)     |
| 25+              | 2.0x             | Maximum boost (2x)   |

User-configured speed multiplier stacks with automatic scaling.

### Performance

**Screen Capacity:**

- At 1080p: ~23 rows × 3-4 messages per row = ~69-92 concurrent messages
- At 4K: ~46 rows × 3-4 messages per row = ~138-184 concurrent messages
- MAX_ACTIVE calculated dynamically based on viewport resolution

**Optimizations:**

- Hardware-accelerated CSS transforms (`translate3d`)
- `requestAnimationFrame` with delta-time for smooth 60fps animation
- O(1) message lookups via `messageMap` and `userMessages` data structures
- Cached width measurements to avoid layout recalculations

### Moderation Support

Messages can be deleted in three ways:

1. **Single Message Deletion**: Removes one message by ID (via MessageDeleted event)
2. **User Timeout/Ban**: Removes all messages from a user (via UserTimedOut event)
3. **Clear All**: Removes all messages (via ChatCleared event)

Deleted messages fade out smoothly over 300ms.

---

## Event Alerts

Sequential queued alerts for stream events.

### Supported Alert Types

#### Follows

- Displays follower's username
- Default: **OFF**

#### Subscriptions

- **New Subscription**: Shows tier badge + username
- **Resubscription**: Shows tier badge + username + cumulative months
- **Gift Subscription**: Shows gifter -> recipient with tier badge
- Supports Tier 1/2/3 badges
- Default: **ON**

#### Cheers/Bits

- Shows bits amount + username + optional message
- Default: **ON**

### Queue Behavior

- **FIFO Queue**: One alert at a time, sequential display
- **Configurable Duration**: 1-30 seconds (default: 5 seconds)
- **Fade Transitions**: 200ms smooth fade in/out
- **Bottom-Right Positioning**: Fixed position with responsive sizing

### Per-Type Filtering

Each alert type can be independently toggled in the dashboard. Disabled alert types are silently dropped (not queued).

---

## Rolling Credits

End-of-stream credits with weighted contribution scoring and hero/cloud layout.

### Weighted Scoring System

Credits are calculated using three contribution types:

```javascript
Score = (chatCount × chatWeight) + (subMonths × subWeight) + (√USD × donoWeight)
```

**Default Weights:**

- Chat messages: 1.0 point per message
- Subscription months: 2.0 points per month (cumulative)
- Donations (bits): 3.0 × √(USD)

**Fairness via Square Root:**
The donation score uses square root scaling to prevent single large donations from dominating. A $100 donation (√100 = 10) scores 30 points, not 300 points.

### Hero vs Cloud Layout

Contributors are divided into two visual groups:

**Hero Rows:**

- Top contributors pinned at top during entire sequence
- Larger font size (default: 1.6x multiplier)
- Extra dwell time (default: 14% of total duration)
- Count calculated using: `min(4, max(0, round(log₂(userCount + 1))))`

**Examples:**

- 1-3 users -> 1 hero
- 4-7 users -> 2 heroes
- 8-15 users -> 3 heroes
- 16+ users -> 4 heroes (capped)

**Cloud Tags:**

- Remaining contributors displayed as word cloud
- Font size scaled by contribution weight
- Randomized positioning for visual variety

### Animation Modes

Dependent on number of users in credit stats:

**Snap Mode (default):**

- Row-by-row transitions with CSS
- Each row gets individual dwell time
- Used when transitions ≥ 180ms

**Smooth Scroll Mode:**

- Continuous smooth scrolling
- Automatically activates when snap transitions < 180ms
- Provides fluid motion for short credit sequences

### Duration Calculation

**Auto-Calculate Mode (default ON):**

```javascript
duration = base + (rows × perRowMs) + (names × perNameMs)
// Clamped to 3-120 seconds
```

**Manual Mode:**
Fixed duration with visual density adjustments to fit all names.

### Timing Allocation

- **Frontloaded**: More time at top for high contributors
- **Hero Extra Dwell**: Additional time allocated to hero rows
- **Token-Based Cancellation**: Prevents race conditions when triggering credits rapidly

### Real vs Test Statistics

**Two Separate Tracking Systems:**

- **Real Credits**: Tracks live stream data
- **Test Credits**: Isolated test statistics

Each system has independent:

- Export/import functionality
- Reset capability
- Statistics display
- Credits roll trigger

### Credits Control

From the dashboard Credits panel:

- **Show Credits**: Trigger credits roll (choose real or test)
- **Reset Stats**: Clear all statistics
- **Export**: Download statistics as JSON backup
- **Import**: Restore statistics from JSON file
- **Estimated Duration**: Preview calculated duration before triggering

---

## Test Mode

Comprehensive testing system that works without Streamer.bot connection.

### Master Toggle System

**Enable Testing Mode** - Gates ALL test functionality:

- Enables debug logging across entire bundle
- Required for auto-generation features
- Required for manual test buttons
- When disabled, all test features are blocked

### Auto-Generation Features

**Auto-Generate Messages:**

- Frequency: 1-300 messages per minute
- Uses thematic test data (Zelda CDI, Metal Gear, Star Fox quotes)
- Real emote URLs (Twitch/BTTV/7TV/FFZ)
- Random colors via HSL generation

**Auto-Generate Alerts:**

- Interval: 2-60 seconds between alerts
- Randomly selects from enabled alert types
- Matches Streamer.bot event structures exactly
- Realistic tier/months/bits values

### Test Data Sources

**Thematic Usernames:**

- Zelda CDI: Morshu, King Harkinian, Link, Zelda, Gwonam
- Metal Gear: Solid Snake, Raiden, Otacon, Psycho Mantis
- Star Fox: Fox McCloud, Peppy Hare, Slippy Toad, Falco
- Classic: AllYourBase, ErrorGuy, SpoonyBard

**Matching Quotes:**
Each username pool has authentic quotes from its universe for realistic message content.

**Real Emotes:**
Test messages include actual emote URLs from 7TV, BTTV, FFZ, and Twitch for authentic rendering.

### Test Credits Isolation

Test events route to separate `testCreditsStats` replicant:

- No cross-contamination with real statistics
- Independent export/import/reset
- Separate credits roll trigger

### Manual Test Buttons

Work independently of auto-generation toggles:

- Send Test Message
- Send Test Sub/Resub/Gift Sub
- Send Test Follow
- Send Test Cheer
- Clear All Messages

**All manual buttons still require master toggle enabled.**

### Debug Logging

When test mode master toggle is enabled:

- Extension logs detailed event processing
- Graphics log queue states, collision detection, animation timing
- Accessible via browser console when graphics opened directly

---

## Frosted Border Overlay

Decorative camera frame overlay with frosted glass effect.

### Features

- **Fixed 3vw border width** on all edges
- **Frosted glass effect** with backdrop blur and saturation boost
- **Multi-color gradient** using alert color palette (purple, pink, green, yellow)
- **Auto-scales** to any resolution
- **Zero configuration** - works immediately

### Usage

Layer the frosted-border.html browser source over your camera source in OBS for a polished decorative frame.

---

## Moderation & Filtering

### User Blocklist

Filter unwanted users from all systems:

- Blocks chat overlay messages
- Blocks event alerts
- Blocks credits tracking

**Features:**

- One username per line in dashboard
- Case-insensitive matching
- Applied at extension layer (before graphics/credits)
- Takes effect immediately

### Message Deletion

**Single Message Deletion:**
Searches hold -> pending -> active queues to remove specific message by ID.

**User Timeout/Ban:**
Removes all messages from timed-out user across all queues.

**Chat Clear:**
Immediately empties all queues and fades out all active messages.

All deletions use fade-out transitions (300ms) for smooth removal.

---

## Auto-Scaling System

All graphics automatically adapt to viewport resolution.

### Chat Overlay Text Scaling

```javascript
fontSize = min(max(H × 0.035, 24), 100) × scaleModifier
```

**Formula Breakdown:**

- Base: 3.5% of viewport height
- Minimum: 24px (prevents illegibility)
- Maximum: 100px (prevents absurd sizes)
- Modifier: 0.5x-2.0x from dashboard slider

**Examples (before modifier):**

- 720p (720px height): 25.2px base
- 1080p (1080px height): 37.8px base
- 2160p (2160px height): 75.6px base

### Alert Scaling

Uses CSS `transform: scale(scaleModifier)` to scale entire alert box:

- 0.5x - 2.0x from dashboard slider
- Scales text, padding, borders proportionally

### Emote & Badge Sizing

- Emotes: 85% of calculated base font
- Badges: 90% of calculated base font
- Auto-scales with danmaku text

### Viewport Clearance

Chat overlay maintains 5% clearance from top and bottom of viewport, using 90% of screen height for message placement.

---

## Next Steps

- **[API Reference](API.md)** - NodeCG messages and replicant structures
- **[Architecture](ARCHITECTURE.md)** - Technical deep-dive
- **[Development](DEVELOPMENT.md)** - Contributing guide
