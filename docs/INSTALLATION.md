# Installation Guide

This guide will help you install and set up Shookie's Stream Suite for NodeCG.

## Requirements

### Runtime Dependencies

- **NodeCG** v2.x (recommended: latest stable)
- **Node.js** v22+
- **Streamer.bot** v1.0.x+ with WebSocket server enabled
- **Modern browser** for dashboard configuration

## Installation Steps

### 1. Install NodeCG

If you haven't already installed NodeCG:
https://www.nodecg.dev/docs/installing

```bash
# Clone NodeCG repository
git clone https://github.com/nodecg/nodecg.git
cd nodecg

# Install dependencies
npm install

# Build NodeCG
npm run build
```

### 2. Install the Bundle

Navigate to the NodeCG bundles directory and clone this repository:

```bash
# From NodeCG root directory
cd bundles

# Clone the bundle
git clone https://github.com/shookieTea/nodecg-shookie-stream-suite.git

# Navigate into bundle
cd nodecg-shookie-stream-suite

# Install bundle dependencies
npm install
```

You may also download these files manually via GitHub and place the files inside of a folder named `nodecg-shookie-stream-suite` within the nodecg/bundles folder.

### 3. Configure Streamer.bot

Streamer.bot must have its WebSocket server enabled to send events to NodeCG.

**Enable WebSocket Server:**

1. Open Streamer.bot
2. Navigate to **Servers/Clients -> WebSocket Server**
3. Enable the WebSocket server
4. Note the host and port (default: `127.0.0.1:8080`)
5. Ensure Auto-Start is enabled (recommended)

**Subscribe to Twitch Events:**

The bundle requires these Twitch events from Streamer.bot:

- `Twitch.ChatMessage`
- `Twitch.ChatMessageDeleted`
- `Twitch.UserTimedOut`
- `Twitch.ChatCleared`
- `Twitch.Sub`
- `Twitch.ReSub`
- `Twitch.GiftSub`
- `Twitch.Cheer`
- `Twitch.Follow`

**Note:** Streamer.bot handles event subscriptions automatically when the bundle connects. You don't need to manually subscribe to these events.

### 4. Start NodeCG

From the NodeCG root directory:

```bash
# Start NodeCG
node .

# Or if you have nodecg-cli installed:
nodecg start
```

NodeCG will start on `http://localhost:9090` by default.

### 5. Verify Installation

1. Open the NodeCG dashboard: `http://localhost:9090`
2. Look for the bundle panels:
   - Streamer.Bot (connection status)
   - Danmaku (chat overlay settings)
   - Credits (rolling credits settings)
   - Alerts (event alert settings)
   - Blocklist (user filtering)
   - Test Mode (testing tools)

3. Check the **Streamer.Bot** panel for connection status
   - If Streamer.bot is running with WebSocket enabled, you should see a green "Connected" status
   - If not connected, verify host/port settings and click "Connect"

## Next Steps

- **[Configuration Guide](CONFIGURATION.md)** - Configure settings and add OBS browser sources
- **[Features Guide](FEATURES.md)** - Learn about each feature in detail
- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues and solutions

## Updating the Bundle

To update to the latest version:

```bash
# From bundle directory
git pull origin main
npm install
```

Restart NodeCG for changes to take effect.

## Uninstalling

To remove the bundle:

```bash
# From NodeCG bundles directory
rm -rf nodecg-shookie-stream-suite
```

Restart NodeCG to complete removal.
