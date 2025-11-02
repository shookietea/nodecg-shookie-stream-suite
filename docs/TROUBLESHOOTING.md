# Troubleshooting Guide

Common issues and solutions for Shookie's Stream Suite.

**Restart Streamer.bot before continuing diagnostics if it was already running**

## Connection Issues

### Streamer.bot Won't Connect

**Symptoms:**

- Dashboard shows "Disconnected" with red indicator
- Error message: "Connection error" or "Disconnected"

**Solutions:**

1. **Verify Streamer.bot is Running**
   - Launch Streamer.bot application
   - Check system tray for Streamer.bot icon

2. **Enable WebSocket Server in Streamer.bot**
   - Open Streamer.bot
   - Navigate to **Servers/Clients -> WebSocket Server**
   - Enable the WebSocket server
   - Note the host and port (default: `127.0.0.1:8080`)

3. **Check Host and Port Settings**
   - In NodeCG dashboard, go to **Streamer.Bot** panel
   - Verify host matches Streamer.bot (usually `127.0.0.1`)
   - Verify port matches Streamer.bot (usually `8080`)
   - Click **Connect**

4. **Check for Port Conflicts**
   - Another application may be using port 8080
   - Change Streamer.bot WebSocket port to different value (e.g., 8081)
   - Update port in NodeCG dashboard

### Streamer.bot Connects But No Events Received

**Symptoms:**

- Dashboard shows "Connected" (green)
- No chat messages or alerts appear

**Solutions:**

1. **Verify Twitch Connection in Streamer.bot**
   - Streamer.bot must be connected to your Twitch channel
   - Check Streamer.bot logs for Twitch connection status

2. **Check Event Subscriptions**
   - The bundle auto-subscribes to events on connection
   - Check Streamer.bot WebSocket server logs for subscription confirmations
   - Required events: ChatMessage, Sub, Resub, GiftSub, Cheer, Follow, MessageDeleted, UserTimedOut, ChatCleared

3. **Enable Debug Logging**
   - Open NodeCG dashboard -> Test Mode panel
   - Toggle **Enable Testing Mode** (master toggle)
   - Check NodeCG console for errors
   - Navigate to the **Graphics** page
   - Close the existing browsers, and open these links in your default browser
   - Open up the developer console (Ctrl + Shift + I)
   - Events should show `[INFO] Chat message received:` etc.

4. **Test with Manual Twitch Events**
   - Send a chat message in your Twitch channel
   - Check if it appears in danmaku overlay
   - If not, check NodeCG console for warnings/errors
   - Add the respective Triggers, right click and select **Simulate** or **Test Trigger**

---

## Chat Overlay Issues

### Messages Not Appearing

**Symptoms:**

- Chat messages sent in Twitch don't appear on stream
- Overlay is blank

**Solutions:**

1. **Check Danmaku Enabled**
   - Dashboard -> **Danmaku** panel
   - Verify **Enabled** toggle is ON
   - Save settings

2. **Check OBS Browser Source**
   - Verify URL is correct: `http://localhost:9090/bundles/nodecg-shookie-stream-suite/graphics/danmaku.html`
   - Verify **"Local file"** is NOT checked
   - Reload graphics via `http://localhost:9090/dashboard/#graphics`

3. **Check Visibility Settings**
   - Dashboard -> **Danmaku** panel
   - Verify **Show Text** is enabled
   - At least one of: Show Usernames, Show Emotes, Show Emojis, Show Text must be enabled

4. **Check Blocklist**
   - Dashboard -> **Blocklist** panel
   - Verify your test username is not blocked
   - Blocklist is case-insensitive

5. **Check Browser Console**
   - Open graphics URL directly in browser
   - Open DevTools (F12 or Ctrl + Shift + I) -> Console tab
   - Look for error messages or warnings
   - Check for `danmaku:message` events being received

6. **Restart NodeCG**
   - Sometimes a full restart helps
   - Stop NodeCG (Ctrl+C in terminal)
   - Start NodeCG (`node .` from NodeCG root)

### Messages Appearing Too Fast/Slow

**Symptoms:**

- Messages scroll too quickly or slowly across screen

**Solutions:**

1. **Adjust Speed Multiplier**
   - Dashboard -> **Danmaku** panel
   - Decrease speed multiplier for slower messages (0.25-1.0)
   - Increase speed multiplier for faster messages (1.0-3.0)

2. **Check Adaptive Speed Scaling**
   - System automatically speeds up messages when queue is large
   - This is normal behavior to minimize latency
   - Speed returns to normal when queue drains

3. **Adjust Base Duration**
   - Messages use physics-based timing (10 seconds default duration)
   - This is calculated in graphics code (not configurable via dashboard)
   - Modify `MSG_DUR_SEC` constant in `graphics/danmaku.html` if needed

---

## Alert Issues

### Alerts Not Showing

**Symptoms:**

- Subscription/cheer/follow events don't trigger alerts

**Solutions:**

1. **Check Alerts Enabled**
   - Dashboard -> **Alerts** panel
   - Verify **Enabled** toggle is ON

2. **Check Per-Type Toggles**
   - Dashboard -> **Alerts** panel
   - Verify specific alert types are enabled:
     - Show Follows
     - Show Subs
     - Show Cheers
   - Default: Follows OFF, Subs ON, Cheers ON

3. **Check OBS Browser Source**
   - Verify URL: `http://localhost:9090/bundles/nodecg-shookie-stream-suite/graphics/alerts.html`
   - Refresh browser source

4. **Test with Manual Buttons**
   - Dashboard -> **Test Mode** panel
   - Enable **Enable Testing Mode** (master toggle)
   - Click **Send Test Sub** or other alert buttons
   - If these work, Streamer.bot connection is the issue

5. **Check Browser Console**
   - Open alerts.html directly in browser
   - Check for `alert:show` events in console
   - Look for error messages

### Alerts Showing Too Long/Short

**Symptoms:**

- Alerts disappear too quickly or linger too long

**Solutions:**

1. **Adjust Alert Duration**
   - Dashboard -> **Alerts** panel
   - Set **Duration** (1000-30000 ms)
   - Default: 5000 ms (5 seconds)

2. **Check Alert Queue**
   - Multiple alerts queue sequentially
   - Each gets full duration time
   - Total time = (alert count × duration)

---

## Rolling Credits Issues

### Credits Not Tracking

**Symptoms:**

- Credit statistics show 0 users
- Stats not increasing despite stream activity

**Solutions:**

1. **Check Credits Enabled**
   - Dashboard -> **Credits** panel
   - Verify **Enabled** toggle is ON

2. **Check Event Tracking**
   - Credits track: chat messages, subscriptions, bits/cheers
   - Follows are NOT tracked (intentional)
   - Check extension logs for event processing

3. **Check Blocklist**
   - Blocked users don't get credit tracking
   - Dashboard -> **Blocklist** -> verify users aren't blocked

4. **View Statistics**
   - Dashboard -> **Credits** panel
   - Check stat boxes: Total Users, Total Messages, Total Donations
   - If these show 0, events aren't being processed

5. **Enable Debug Logging**
   - Dashboard -> **Test Mode** -> Enable Testing Mode
   - Check Credits Graphic DevTools for:
     - `[Real Credits] username: X messages`
     - `[Real Credits] username: X sub months`
     - `[Real Credits] username: $X donated`

### Credits Won't Show

**Symptoms:**

- "Show Credits" button doesn't display credits
- Graphics remain blank

**Solutions:**

1. **Check Statistics Exist**
   - Dashboard -> **Credits** panel
   - Verify Total Users > 0
   - Credits won't show if no users tracked

2. **Check OBS Browser Source**
   - Verify URL: `http://localhost:9090/bundles/nodecg-shookie-stream-suite/graphics/credits.html`
   - Refresh browser source

3. **Check Browser Console**
   - Open credits.html directly in browser
   - Click "Show Credits (Real)" from dashboard
   - Check console for errors or `credits:show` event

4. **Test with Test Credits**
   - Dashboard -> **Test Mode** -> Enable Testing Mode
   - Generate test messages/subs/cheers
   - Dashboard -> **Credits** -> Show Credits (Test)
   - If test credits work, issue is with real statistics

### Credits Timing Issues

**Symptoms:**

- Credits scroll too fast or too slow
- Not enough time to read names

**Solutions:**

1. **Use Auto Duration**
   - Dashboard -> **Credits** panel -> Timing Settings
   - Enable **Duration Auto**
   - System calculates optimal duration

2. **Adjust Duration Components**
   - **Duration Base**: Starting time (default: 12s)
   - **Duration Per Row**: Time per row (default: 850ms)
   - **Duration Per Name**: Time per name (default: 80ms)
   - Increase values for longer credits

3. **Use Manual Duration**
   - Disable **Duration Auto**
   - Set fixed **Duration** (3-120 seconds)
   - System compresses visually to fit

4. **Check Estimated Duration**
   - Dashboard -> **Credits** panel
   - Shows estimated duration before triggering
   - Adjust settings if estimate seems wrong

---

## Performance Issues

### Low FPS / Stuttering

**Symptoms:**

- Graphics appear choppy or stuttery
- Frame rate drops below 60fps

**Solutions:**

1. **Reduce Active Messages**
   - Lower message rate in Test Mode
   - Or reduce real chat activity (not practical)
   - System auto-throttles at ~100 concurrent messages

2. **Check System Resources**
   - Open Task Manager
   - Check CPU/GPU/RAM usage
   - Close unnecessary applications
   - OBS itself can be CPU-intensive

3. **Disable Hardware Acceleration** (if using integrated graphics)
   - OBS -> Settings -> Advanced
   - Renderer: Software (x264) instead of Hardware
   - Trade CPU for smoother rendering

4. **Reduce Graphics Quality**
   - Dashboard -> **Danmaku** -> Scale Modifier
   - Reduce to 0.8x or 0.9x for smaller text
   - Smaller text = less GPU rendering

### High Memory Usage

**Symptoms:**

- Memory usage grows over time
- NodeCG or OBS becomes slow

**Solutions:**

1. **Refresh Browser Sources Periodically**
   - Clears accumulated memory

2. **Check for Memory Leaks**
   - Open graphics directly in browser
   - DevTools -> Performance -> Memory
   - Profile over time to identify leaks
   - Report if consistent leak found

3. **Restart NodeCG**
   - Full restart clears extension memory
   - Replicants are persisted, no data loss

---

## Test Mode Issues

### Test Buttons Not Working

**Symptoms:**

- Clicking test buttons does nothing
- No test messages or alerts appear

**Solutions:**

1. **Enable Master Toggle**
   - Dashboard -> **Test Mode** panel
   - Toggle **Enable Testing Mode** ON
   - Master toggle gates ALL test functionality

2. **Check Graphics**
   - Test messages use same code path as real events
   - If test messages work, Streamer.bot connection is the issue
   - If test messages don't work, check graphics console

### Auto-Generation Not Working

**Symptoms:**

- Enabled auto-generation but nothing happens

**Solutions:**

1. **Verify Master Toggle**
   - Must enable **Enable Testing Mode** first

2. **Enable Specific Toggles**
   - Auto-generation requires both:
     - Master toggle ON
     - Specific feature toggle ON (e.g., Auto-Generate Messages)

3. **Check Interval Settings**
   - **Messages Per Minute**: Must be > 0
   - **Alert Interval**: Must be > 0
   - Too low values may appear inactive

4. **Verify Feature Enabled**
   - Auto-Generate Messages requires Danmaku enabled
   - Auto-Generate Subs requires Alerts enabled + Show Subs enabled

---

## Miscellaneous

### Settings Not Saving

**Symptoms:**

- Settings reset after refreshing dashboard or restarting NodeCG

**Solutions:**

1. **Check NodeCG Replicant Persistence**
   - Settings should auto-save after 500ms debounce
   - Check `nodecg/db/replicants/` for settings file

2. **Check File Permissions**
   - NodeCG must have write access to `nodecg/db/` directory
   - Check folder permissions (Windows: Security tab, Linux: `chmod`)

3. **Check for Errors**
   - NodeCG console may show replicant save errors
   - Check for disk space issues

### OBS Browser Source Shows Blank Page

**Symptoms:**

- Browser source is visible in OBS but shows nothing
- No errors, just blank

**Solutions:**

1. **Verify NodeCG is Running**
   - Open `http://localhost:9090` in regular browser
   - Should show NodeCG dashboard
   - If not, start NodeCG

2. **Check URL Format**
   - Must start with `http://localhost:9090/bundles/...`
   - Do NOT use file:// or relative paths
   - Do NOT check "Local file" option

3. **Restart OBS Browser Source**
   - Remove browser source
   - Add new browser source
   - Enter URL fresh

4. **Check OBS Browser Source Cache**
   - Right-click browser source -> Interact
   - Press Ctrl+Shift+R (force refresh with cache clear)

### Bundle Won't Load in NodeCG

**Symptoms:**

- NodeCG starts but bundle doesn't appear in dashboard

**Solutions:**

1. **Check Bundle Directory Name**
   - Must be in `nodecg/bundles/nodecg-shookie-stream-suite/`
   - Directory name must match `package.json` name `nodecg-shookie-stream-suite/`

2. **Check package.json**
   - Must have `nodecg.compatibleRange` field
   - Must be valid JSON (no trailing commas)

3. **Run npm install**
   - From bundle directory: `npm install`
   - Ensure dependencies are installed

4. **Check NodeCG Logs**
   - NodeCG console shows bundle loading errors
   - Look for syntax errors or missing dependencies

5. **Verify NodeCG Version**
   - Bundle requires NodeCG 2.x
   - Check with `nodecg --version`

---

## Getting Help

If none of these solutions work:

1. **Enable Debug Logging**
   - Test Mode -> Enable Testing Mode
   - Collect logs from:
     - NodeCG console
     - Graphics browser console (open graphics URLs directly)
     - OBS log files

2. **Test with Test Mode**
   - Determine if issue is with bundle or Streamer.bot connection
   - Test Mode bypasses Streamer.bot

3. **Report Issue**
   - GitHub Issues: https://github.com/shookieTea/nodecg-shookie-stream-suite/issues
   - Include:
     - NodeCG version
     - Streamer.bot version
     - OBS version
     - Steps to reproduce
     - Error messages / logs
     - Screenshots

4. **Stream for Direct Help**
   - https://twitch.tv/shookieTea
   - Ask during stream (respectfully)

---

## Next Steps

- **[Features Guide](FEATURES.md)** - Understand how features work
- **[Configuration Guide](CONFIGURATION.md)** - Review settings
- **[Development Guide](DEVELOPMENT.md)** - Debug and contribute
