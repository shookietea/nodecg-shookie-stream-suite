# Shookie's Stream Suite

A NodeCG bundle for Twitch streams featuring Niconico-style scrolling chat, event alerts, and weighted rolling credits with Streamer.bot integration. The main purpose of this bundle is to use for my Twitch stream. I wanted an easy to use overlay which did not rely on anything besides Streamer.bot's Websocket Server, which avoids the need to hook directly to Twitch and their moving target of APIs. This moves responsibility of handling Twitch API changes to Streamer.bot. With their v1.0.1 update, I see this to be stable long-term. This project took more brain power and time than I thought due to my need to gold-plate and let perfection get in the way of good-enough. It started as an individual .html file without a server, but that quickly grew into a multi-thousand line monstrosity. This is the result of that nightmare, shared for you to enjoy.

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![NodeCG](https://img.shields.io/badge/NodeCG-2.x-brightgreen.svg)](https://www.nodecg.dev/)

---

## Features

### Niconico-Style Scrolling Chat

- **Collision-aware placement** with three-tier queue system and 5-second delay
- **Dynamic speed scaling** adapts to chat volume
- **Auto-scaling** to any reasonable resolution
- **Hardware-accelerated animations** for smooth 60fps performance
- **Moderation support** with message deletion, timeouts, and bans
- **Configurable visual toggles** for emotes, emojis, usernames, and text

### Event Alerts

- **FIFO queue system** with sequential display
- **Supported events**: Follows, Subscriptions (all tiers), Gift Subs, Cheers/Bits
- **Per-type filtering** to show only alerts you want
- **Customizable duration** and scale
- **Smooth transitions** with fade in/out effects

### Rolling Credits

- **Weighted scoring system** combining chat activity, subscriptions, and donations
- **Hero/Cloud layout** featuring top contributors prominently
- **Auto-calculated duration** based on participant count
- **Separate test mode** for previewing without affecting real statistics
- **Export/Import functionality** for backup and restoration

### Comprehensive Test Mode

- **Auto-generation** of chat messages and alerts
- **Thematic test data** with authentic quotes and real emote URLs
- **Independent tracking** for test vs. real statistics
- **Debug logging** for development and troubleshooting

### Additional Features

- **Frosted border overlay** with decorative camera frame
- **User blocklist** for filtering unwanted users
- **Auto-scaling system** works at any viewport resolution
- **Settings persistence** with auto-save

---

## Requirements

- **NodeCG** v2.x
- **Node.js** v22+
- **Streamer.bot** v1.0.x+ with WebSocket server enabled
- **Modern browser** if you want to test outside OBS browser sources

---

## Quick Start

### 1. Install NodeCG

```bash
git clone https://github.com/nodecg/nodecg.git
cd nodecg
npm install
npm run build
```

### 2. Install the Bundle

```bash
# From NodeCG root directory
cd bundles
git clone https://github.com/shookieTea/nodecg-shookie-stream-suite.git
cd nodecg-shookie-stream-suite
npm install
```

### 3. Configure Streamer.bot

1. Launch Streamer.bot
2. Navigate to **Servers/Clients -> WebSocket Server**
3. Enable WebSocket server (default: `ws://127.0.0.1:8080`)
4. Ensure Auto-Start is enabled

### 4. Start NodeCG

```bash
# From NodeCG root directory
node .
```

Access the dashboard at `http://localhost:9090`

### 5. Add OBS Browser Sources

Add browser sources in OBS with these URLs:

- **Chat Overlay**: `http://localhost:9090/bundles/nodecg-shookie-stream-suite/graphics/danmaku.html`
- **Event Alerts**: `http://localhost:9090/bundles/nodecg-shookie-stream-suite/graphics/alerts.html`
- **Rolling Credits**: `http://localhost:9090/bundles/nodecg-shookie-stream-suite/graphics/credits.html`
- **Frosted Border**: `http://localhost:9090/bundles/nodecg-shookie-stream-suite/graphics/frosted-border.html`

Set resolution to match your stream canvas (e.g., 1920×1080).

**Important:** Do NOT check "Local file" - must use HTTP URLs.
**Recommended:** Do NOT check the options to Shutdown or Refresh the browser source if you want the Alert queue to work properly.

### 6. Configure Settings

Open the NodeCG dashboard (`http://localhost:9090`) and configure:

1. **Streamer.Bot** panel - Verify connection (should show green "Connected")
2. **Danmaku** panel - Adjust chat overlay settings (speed, scale, visibility)
3. **Alerts** panel - Configure alert duration and per-type toggles
4. **Credits** panel - Set contribution weights and timing
5. **Test Mode** panel - Generate test events to verify setup

---

## Documentation

### User Guides

- **[Installation Guide](docs/INSTALLATION.md)** - Detailed setup instructions
- **[Configuration Guide](docs/CONFIGURATION.md)** - Dashboard and OBS setup
- **[Features Guide](docs/FEATURES.md)** - In-depth feature documentation
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

### Developer Resources

- **[Architecture](docs/ARCHITECTURE.md)** - Technical deep-dive and design patterns
- **[API Reference](docs/API.md)** - NodeCG messages and replicants
- **[Development Guide](docs/DEVELOPMENT.md)** - Contributing and code conventions

---

## Key Features in Detail

### Chat Overlay (Danmaku)

**Three-Tier Queue System:**

```
Hold Queue (5s delay) -> Pending Queue -> Collision Detection -> Active Display
```

The chat overlay uses a sophisticated collision detection algorithm to prevent message overlaps while maintaining smooth 60fps animation. Messages automatically speed up when the queue grows to minimize latency. The biggest bottleneck for messages is the collision detection.

**Supported Resolutions:**

- 720p (1280×720)
- 936p (1664×936)
- 1080p (1920×1080)
- 1440p (2560×1440)
- 2160p/4K (3840×2160)
- Custom aspect ratios (16:9, 21:9, etc.)

### Event Alerts

Sequential alert queue supporting:

- **Follows**
- **Subscriptions** - New, Resub, Gift (Tier 1/2/3)
- **Cheers/Bits** with amount and message

Alerts appear in top-left corner with configurable duration (1-30 seconds) and smooth fade transitions.

### Rolling Credits

Weighted scoring combines three contribution types:

```javascript
Score = (chatCount × 1.0) + (subMonths × 2.0) + (√USD × 3.0)
```

**Hero Contributors** are pinned at the top with larger font and extra dwell time, determined by `log₂(userCount + 1)`:

- 1-3 users -> 1 hero
- 4-7 users -> 2 heroes
- 8-15 users -> 3 heroes
- 16+ users -> 4 heroes (capped)

---

## Moderation & Filtering

- **User blocklist** filters unwanted users from chat, alerts, and credits
- **Message deletion** support via Streamer.bot events:
  - Single message deletion (MessageDeleted)
  - User timeout/ban (UserTimedOut)
  - Chat clear (ChatCleared)
- All deletions include smooth fade-out transitions

---

## Test Mode

Comprehensive testing system that works without Streamer.bot connection:

- **Auto-generation** with configurable rates (1-300 messages/min, 2-60 sec/alert)
- **Manual test buttons** for individual events
- **Thematic test data** using Zelda CDI, Metal Gear, Star Fox quotes
- **Real emote URLs** from Twitch, BTTV, 7TV, FFZ
- **Separate test statistics** isolated from real stream data
- **Debug logging** for development

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch (`git switch -c feature/amazing-feature`)
3. Make your changes
4. Test thoroughly with Test Mode and Streamer.bot
5. Commit changes (`git commit -m 'feat: add amazing feature'`)
6. Push to your fork
7. Open a Pull Request

See [Development Guide](docs/DEVELOPMENT.md) for detailed development setup and code conventions.

---

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

You may use, modify, and distribute this software freely, but any modifications must also be released under AGPL-3.0. This ensures the software remains free and open for everyone.

See the [LICENSE](LICENSE) file for full license text, or visit https://www.gnu.org/licenses/agpl-3.0.en.html

---

## Credits & Acknowledgments

### Inspiration

NicoNico style messages inspired by [NicoNico Twitch for StreamElements](https://github.com/tekigg/niconico-twitch) but I had no intention of using StreamElements again in my life when open source alternatives exist that do not farm your data.

Scrolling Credits inspired by [ExcessiveProfanity](https://twitch.tv/ExcessiveProfanity)'s graveyard ending stream. This man was inspired by similar streamers as I was in the 2010-2015 Twitch Era, and he built an incredible following and community. Complete with live executions of viewers who refuse to read the room they walk into before spouting off nonsense and back-seating. When I dropped off of streaming due to lack of encouragement of family and worry that I was wasting my time, he continued and built many meaningful experiences. I am envious of him for it, and he remains my main inspiration today. Not only making a living full-time streaming, but living a life without catering to those whose opinions do not matter, those who only live to create drama and dirty the carpet. If you read this one day, thanks for all the fish.

### Built With

- **[NodeCG](https://www.nodecg.dev/)** - Broadcast graphics framework
- **[Streamer.bot](https://streamer.bot/)** - Twitch integration via WebSocket
- **[@streamerbot/client](https://www.npmjs.com/package/@streamerbot/client)** - Official WebSocket client library

---

## Links

- **GitHub Repository**: https://github.com/shookieTea/nodecg-shookie-stream-suite
- **Bug Reports**: https://github.com/shookieTea/nodecg-shookie-stream-suite/issues
- **Twitch Channel**: https://twitch.tv/shookieTea
- **NodeCG Documentation**: https://www.nodecg.dev/
- **Streamer.bot API**: https://docs.streamer.bot/

---

## Support

If you find this bundle useful:

- **Donate to your local humane societies and food banks**
- **Follow on Twitch** at https://twitch.tv/shookieTea
- **Star this repository**
- **Report bugs** via GitHub Issues
- **Suggest features** via GitHub Issues
- **Contribute** via Pull Requests

---

**Made with 🍵 by [shookieTea](https://twitch.tv/shookieTea)**
