const { StreamerbotClient } = require('@streamerbot/client');
const {
  DEFAULTS,
  EVENTS,
  STREAMERBOT_EVENTS,
  REPLICANTS,
} = require('./constants');
const { normalizeChatMessage, isBlocked } = require('./validate');
const {
  getRandomGame,
  generateTestUsername,
  generateRandomMessage,
  generateTestColor,
} = require('./test-data');
const {
  generateTestSub,
  generateTestResub,
  generateTestGiftSub,
  generateTestCheer,
  generateTestFollow,
} = require('./test-alerts');

/**
 * NodeCG extension entry point
 * @param {import('./types').NodeCGServerAPI} nodecg - NodeCG server API
 */
module.exports = function (nodecg) {
  const logger = require('./logger')(nodecg);

  logger.info('nodecg-shookie-stream-suite extension loaded');

  /**
   * ERROR HANDLING CONVENTIONS
   *
   * This extension follows these error handling patterns for consistency:
   *
   * 1. VALIDATION FAILURES (invalid/missing data from external sources):
   *    - Use logger.warn() to log the issue
   *    - Return early (don't throw)
   *    - Example: Invalid Streamer.bot event data
   *
   * 2. EXTERNAL ERRORS (network, WebSocket, file I/O):
   *    - Use try/catch blocks
   *    - Use logger.error() to log the error
   *    - Handle gracefully (don't crash)
   *    - Example: WebSocket connection failures
   *
   * 3. CRITICAL FAILURES (should never happen in normal operation):
   *    - Throw exceptions
   *    - Let NodeCG handle crash/restart
   *    - Example: Failed to load required module
   *
   * 4. USER ERRORS (blocked by master toggle, settings validation):
   *    - Use logger.warn() for rejected actions
   *    - Provide clear message about why
   *    - Example: Test mode disabled, rejecting manual test
   */

  // ============================================================================
  // Initialize Replicants
  // ============================================================================

  // Replicants initialized without defaultValue (except connectionStatus, creditsStats, and testCreditsStats)
  // This allows the dashboard to be the single source of truth for defaults
  // Dashboard HTML contains the canonical default values (e.g., checked attributes, value="1.0")
  // On first load, dashboard reads undefined values and saves its HTML defaults
  // This prevents extension/graphics from having conflicting default definitions
  const settingsRep = nodecg.Replicant(REPLICANTS.SETTINGS);
  const creditsStatsRep = nodecg.Replicant(REPLICANTS.CREDITS_STATS, {
    defaultValue: {
      chatCounts: {},
      subMonths: {},
      donoUSD: {},
    },
    persistent: true,
  });
  const testCreditsStatsRep = nodecg.Replicant(REPLICANTS.TEST_CREDITS_STATS, {
    defaultValue: {
      chatCounts: {},
      subMonths: {},
      donoUSD: {},
    },
    persistent: true,
  });
  const connectionStatusRep = nodecg.Replicant(REPLICANTS.CONNECTION_STATUS, {
    defaultValue: { connected: false, error: null },
    persistent: false,
  });

  // Streamer.bot client instance
  let sbClient = null;

  // Log when replicants are ready
  settingsRep.on('change', (newValue) => {
    nodecg.log.debug('Settings updated:', newValue);
  });

  creditsStatsRep.on('change', (newValue) => {
    nodecg.log.debug('Credits stats updated');
  });

  // ============================================================================
  // Connection Status Helper
  // ============================================================================

  /**
   * Updates connection status replicant
   * @param {boolean} connected - Connection state
   * @param {string|null} [error=null] - Error message or null
   */
  function updateConnectionStatus(connected, error = null) {
    connectionStatusRep.value = { connected, error };
  }

  // ============================================================================
  // Helper Functions
  // ============================================================================

  /**
   * Checks if a specific alert type is enabled in settings
   * @param {string} alertType - 'subs', 'follows', or 'cheers'
   * @returns {boolean} True if alert should be shown
   */
  function isAlertEnabled(alertType) {
    const alerts = settingsRep.value?.alerts;

    // Check global alerts toggle
    if (!alerts?.enabled) {
      nodecg.log.debug(`[Alerts] Alerts disabled globally`);
      return false;
    }

    // Check specific alert type
    const typeEnabledMap = {
      subs: alerts.showSubs !== false,
      follows: alerts.showFollows === true,
      cheers: alerts.showCheers !== false,
    };

    const enabled = typeEnabledMap[alertType];
    if (!enabled) {
      nodecg.log.debug(`[Alerts] ${alertType} alerts disabled`);
    }

    return enabled;
  }

  /**
   * Routes credit tracking to test or real stats based on event flag
   * @param {string} type - 'chat', 'subscription', or 'donation'
   * @param {Object} data - Event data with is_test flag
   * @param {Object} params - Type-specific parameters
   */
  function trackCredits(type, data, params) {
    const isTest = data.is_test || false;
    const tracker = isTest ? testCredits : realCredits;

    const methods = {
      chat: 'trackChat',
      subscription: 'trackSubscription',
      donation: 'trackDonation',
    };

    const method = methods[type];
    tracker[method](...Object.values(params));
  }

  /**
   * Extracts username from various Streamer.bot event structures
   * Handles defensive programming for field name variations
   * @param {Object} data - Event data
   * @param {string} [userField='user'] - Field containing user object ('user' or 'targetUser')
   * @returns {string} Username
   */
  function extractUsername(data, userField = 'user') {
    // Handle nested user object
    if (data[userField]) {
      return data[userField].name || data[userField].login || 'Unknown';
    }
    // Handle flat user_name/user_login fields (used by some Streamer.bot events)
    return (
      data.user_name ||
      data.user_login ||
      data.userName ||
      data.username ||
      'Unknown'
    );
  }

  /**
   * Extracts normalized tier from Streamer.bot subscription event
   * @param {Object} data - Subscription event data
   * @returns {number} Tier number (1, 2, or 3)
   */
  function extractSubTier(data) {
    const tierStr = data.subTier || data.sub_tier || '1000';
    return parseInt(tierStr) / 1000;
  }

  /**
   * Builds alert data object for different alert types
   * @param {string} type - Alert type ('sub', 'resub', 'giftsub', 'cheer', 'follow')
   * @param {Object} params - Type-specific parameters
   * @returns {Object} Formatted alert data
   */
  function buildAlertData(type, params) {
    const baseData = {
      type,
      displayName: params.displayName,
    };

    // Add type-specific fields
    switch (type) {
      case 'sub':
        return {
          ...baseData,
          tier: params.tier,
          message: params.message || '',
        };

      case 'resub':
        return {
          ...baseData,
          tier: params.tier,
          months: params.months,
          message: params.message || '',
        };

      case 'giftsub':
        return {
          ...baseData,
          tier: params.tier,
          recipient: params.recipient,
          message: params.message || '',
        };

      case 'cheer':
        return {
          ...baseData,
          bits: params.bits,
          message: params.message || '',
        };

      case 'follow':
        return baseData;

      default:
        return baseData;
    }
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Handles incoming chat messages from Streamer.bot
   * Tracks credits, normalizes, checks blocklist, and forwards to graphics
   * Single source of truth for all chat message processing (test and real)
   *
   * @param {Object} payload - Event payload from Streamer.bot
   * @param {import('./types').ChatMessageEvent} payload.data - Message data
   */
  function handleChatMessage({ event, data }) {
    nodecg.log.debug('Chat message received:', data);

    // Normalize message data
    const normalized = normalizeChatMessage(data);
    if (!normalized) {
      logger.warn('Invalid chat message data, skipping');
      return;
    }

    // Track credits using unified dispatcher
    trackCredits('chat', data, { username: normalized.username });

    // Check blocklist
    const blocklist = settingsRep.value?.blockList?.usernames || [];
    if (isBlocked(normalized.username, blocklist)) {
      nodecg.log.debug(`Blocked message from ${normalized.username}`);
      return;
    }

    // Forward to graphics
    nodecg.sendMessage(EVENTS.DANMAKU_MESSAGE, normalized);
  }

  /**
   * Handles message deletion events from Streamer.bot
   * Forwards message ID to graphics for removal
   * @param {Object} payload - Event payload
   * @param {import('./types').MessageDeletedEvent} payload.data - Deletion data
   */
  function handleMessageDeleted({ event, data }) {
    logger.debug(
      '[Deletion] Message deletion event received:',
      JSON.stringify(data, null, 2)
    );

    if (!data || !data.messageId) {
      logger.warn('[Deletion] Invalid message deletion data, skipping');
      return;
    }

    logger.debug(
      `[Deletion] Forwarding delete request for messageId: ${data.messageId}`
    );

    // Forward deletion request to graphics
    nodecg.sendMessage(EVENTS.DANMAKU_DELETE, { messageId: data.messageId });
  }

  /**
   * Handles user timeout events from Streamer.bot
   * Removes all messages from timed-out user
   * @param {Object} payload - Event payload
   * @param {import('./types').UserTimedOutEvent} payload.data - Timeout data
   */
  function handleUserTimedOut({ event, data }) {
    nodecg.log.debug('User timed out:', data);

    if (!data || !data.targetUser) {
      logger.warn('Invalid user timeout data, skipping');
      return;
    }

    const username = extractUsername(data, 'targetUser');
    if (!username || username === 'Unknown') {
      logger.warn('Timeout event missing username, skipping');
      return;
    }

    // Forward user deletion request to graphics
    nodecg.sendMessage(EVENTS.DANMAKU_DELETE_USER, { username });
  }

  /**
   * Handles chat clear events from Streamer.bot
   * Removes all messages from overlay
   * @param {Object} payload - Event payload
   */
  function handleChatCleared({ event, data }) {
    nodecg.log.debug('Chat cleared:', data);

    // Forward clear request to graphics
    nodecg.sendMessage(EVENTS.DANMAKU_CLEAR_ALL);
  }

  /**
   * Handles subscription events from Streamer.bot
   * Tracks credits and shows alert
   * Single source of truth for all subscription processing (test and real)
   *
   * @param {Object} payload - Event payload
   * @param {import('./types').SubscriptionEvent} payload.data - Subscription data
   */
  function handleSubscription({ event, data }) {
    nodecg.log.debug('Subscription received:', data);

    // Extract username and track credits
    const username = extractUsername(data);
    trackCredits('subscription', data, { username, months: 1 });

    // Check if subscription alerts are enabled
    if (!isAlertEnabled('subs')) {
      return;
    }

    // Build and send alert
    const alertData = buildAlertData('sub', {
      displayName: username,
      tier: extractSubTier(data),
      message: data.message || data.text,
    });

    nodecg.sendMessage(EVENTS.ALERT_SHOW, alertData);
    logger.info(
      `[Alerts] Subscription: ${alertData.displayName} (Tier ${alertData.tier}) [test: ${data.is_test || false}]`
    );
  }

  /**
   * Handles resubscription events from Streamer.bot
   * Tracks credits and shows alert
   * Single source of truth for all resubscription processing (test and real)
   *
   * @param {Object} payload - Event payload
   * @param {import('./types').ResubscriptionEvent} payload.data - Resubscription data
   */
  function handleResubscription({ event, data }) {
    nodecg.log.debug('Resubscription received:', data);

    // Extract username, months and track credits
    const username = extractUsername(data);
    const months = data.cumulativeMonths || 1;
    trackCredits('subscription', data, { username, months });

    // Check if subscription alerts are enabled
    if (!isAlertEnabled('subs')) {
      return;
    }

    // Build and send alert
    const alertData = buildAlertData('resub', {
      displayName: username,
      tier: extractSubTier(data),
      months: months,
      message: data.text || data.message,
    });

    nodecg.sendMessage(EVENTS.ALERT_SHOW, alertData);
    logger.info(
      `[Alerts] Resubscription: ${alertData.displayName} (${alertData.months} months, Tier ${alertData.tier}) [test: ${data.is_test || false}]`
    );
  }

  /**
   * Handles gift subscription events from Streamer.bot
   * Tracks credits and shows alert
   * Single source of truth for all gift sub processing (test and real)
   *
   * @param {Object} payload - Event payload
   * @param {import('./types').GiftSubscriptionEvent} payload.data - Gift sub data
   */
  function handleGiftSubscription({ event, data }) {
    nodecg.log.debug('Gift subscription received:', data);

    // Extract gifter username and track credits
    // Note: We credit the gifter, not the recipient
    const gifterUsername = extractUsername(data);
    trackCredits('subscription', data, { username: gifterUsername, months: 1 });

    // Check if subscription alerts are enabled
    if (!isAlertEnabled('subs')) {
      return;
    }

    // Build and send alert
    const alertData = buildAlertData('giftsub', {
      displayName: gifterUsername,
      tier: extractSubTier(data),
      recipient: extractUsername(data, 'recipient'),
      message: data.message || data.text,
    });

    nodecg.sendMessage(EVENTS.ALERT_SHOW, alertData);
    logger.info(
      `[Alerts] Gift Sub: ${alertData.displayName} -> ${alertData.recipient} (Tier ${alertData.tier}) [test: ${data.is_test || false}]`
    );
  }

  /**
   * Handles cheer events from Streamer.bot
   * Tracks credits and shows alert
   * Single source of truth for all cheer processing (test and real)
   *
   * @param {Object} payload - Event payload
   * @param {import('./types').CheerEvent} payload.data - Cheer data (nested structure)
   */
  function handleCheer({ event, data }) {
    nodecg.log.debug('Cheer received:', data);

    // Streamer.bot cheer event has nested structure: data.message contains the actual data
    const msg = data.message || data;

    // Extract username and bits, track credits
    const username = msg.displayName || data.displayName || 'Unknown';
    const bits = msg.bits || data.bits || 0;
    const usd = bits / 100; // 100 bits = $1 USD
    trackCredits('donation', data, { username, usd });

    // Check if cheer alerts are enabled
    if (!isAlertEnabled('cheers')) {
      return;
    }

    // Build and send alert
    const alertData = buildAlertData('cheer', {
      displayName: username,
      bits: bits,
      message: msg.message,
    });

    nodecg.sendMessage(EVENTS.ALERT_SHOW, alertData);
    logger.info(
      `[Alerts] Cheer: ${alertData.displayName} (${alertData.bits} bits) [test: ${data.is_test || false}]`
    );
  }

  /**
   * Handles follow events from Streamer.bot
   * Shows alert (no credits tracking per TECHNICAL_SPEC.md)
   * Single source of truth for all follow processing (test and real)
   *
   * @param {Object} payload - Event payload
   * @param {import('./types').FollowEvent} payload.data - Follow data
   */
  function handleFollow({ event, data }) {
    nodecg.log.debug('Follow received:', data);

    // Note: Follows are not tracked in credits (per TECHNICAL_SPEC.md)

    // Check if follow alerts are enabled
    if (!isAlertEnabled('follows')) {
      return;
    }

    // Build and send alert
    const alertData = buildAlertData('follow', {
      displayName: extractUsername(data),
    });

    nodecg.sendMessage(EVENTS.ALERT_SHOW, alertData);
    logger.info(`[Alerts] Follow: ${alertData.displayName}`);
  }

  // ============================================================================
  // Streamer.bot Connection Management
  // ============================================================================

  /**
   * Connect to Streamer.bot WebSocket server
   * Creates new StreamerbotClient with settings from replicant
   * Registers event handlers for all Twitch events (9 total)
   * Uses auto-subscribe feature - each .on() handler subscribes to that event
   */
  function connectStreamerbot() {
    const settings = settingsRep.value?.streamerBot || {
      host: DEFAULTS.STREAMERBOT_HOST,
      port: DEFAULTS.STREAMERBOT_PORT,
    };

    logger.info(
      `Connecting to Streamer.bot at ${settings.host}:${settings.port}`
    );

    try {
      // Disconnect existing client if any
      if (sbClient) {
        try {
          sbClient.disconnect();
        } catch (err) {
          logger.warn('Error disconnecting existing client:', err.message);
        }
      }

      // Create new client with connection callbacks
      sbClient = new StreamerbotClient({
        host: settings.host,
        port: settings.port,
        immediate: false, // Don't auto-connect, we'll call connect() manually
        autoReconnect: true,
        retries: -1, // Unlimited retries

        // Note: Don't use subscribe: '*' here - it subscribes to ALL 465+ events
        // Instead, .on() handlers below will auto-subscribe to only the 9 events we need
        // This keeps Streamer.bot subscription count minimal (9 instead of 465+)
        // See: https://docs.streamer.bot/api/websocket/requests/subscribe

        // Connection lifecycle callbacks
        onConnect: (data) => {
          logger.info('Connected to Streamer.bot:', data);
          updateConnectionStatus(true);
        },
        onDisconnect: () => {
          logger.warn('Disconnected from Streamer.bot');
          updateConnectionStatus(false, 'Disconnected');
        },
        onError: (error) => {
          logger.error('Streamer.bot connection error:', error);
          updateConnectionStatus(
            false,
            error.message || error.toString() || 'Connection error'
          );
        },
      });

      // Register event handlers
      // Chat & Moderation Events
      sbClient.on(STREAMERBOT_EVENTS.CHAT_MESSAGE, handleChatMessage);
      sbClient.on(STREAMERBOT_EVENTS.MESSAGE_DELETED, handleMessageDeleted);
      sbClient.on(STREAMERBOT_EVENTS.USER_TIMED_OUT, handleUserTimedOut);
      sbClient.on(STREAMERBOT_EVENTS.CHAT_CLEARED, handleChatCleared);

      // Subscription Events
      sbClient.on(STREAMERBOT_EVENTS.SUB, handleSubscription);
      sbClient.on(STREAMERBOT_EVENTS.RESUB, handleResubscription);
      sbClient.on(STREAMERBOT_EVENTS.GIFT_SUB, handleGiftSubscription);

      // Bits & Follow Events
      sbClient.on(STREAMERBOT_EVENTS.CHEER, handleCheer);
      sbClient.on(STREAMERBOT_EVENTS.FOLLOW, handleFollow);

      // Actually connect
      sbClient.connect();
    } catch (err) {
      logger.error('Failed to create Streamer.bot client:', err);
      updateConnectionStatus(false, `Failed to connect: ${err.message}`);
    }
  }

  /**
   * Disconnect from Streamer.bot WebSocket server
   * Cleans up client instance and updates connection status replicant
   */
  function disconnectStreamerbot() {
    logger.info('Disconnecting from Streamer.bot');

    if (sbClient) {
      try {
        sbClient.disconnect();
        sbClient = null;
        updateConnectionStatus(false);
      } catch (err) {
        logger.error('Error disconnecting:', err);
        updateConnectionStatus(false, `Disconnect error: ${err.message}`);
      }
    } else {
      updateConnectionStatus(false);
    }
  }

  // ============================================================================
  // NodeCG Message Listeners
  // ============================================================================

  // Handle connect/disconnect messages from dashboard
  nodecg.listenFor(EVENTS.STREAMERBOT_CONNECT, () => {
    connectStreamerbot();
  });

  nodecg.listenFor(EVENTS.STREAMERBOT_DISCONNECT, () => {
    disconnectStreamerbot();
  });

  // ============================================================================
  // Test Mode System
  // ============================================================================

  /**
   * Generates test message matching Streamer.bot ChatMessage structure
   * Structure: { messageId, text, user{name, color, badges}, emotes[], is_test }
   * @returns {Object} Message object matching Streamer.bot format
   */
  function generateTestMessage() {
    // Pick random game
    const game = getRandomGame();

    // Get matching username and message from same game
    const username = generateTestUsername(game);
    const { text, emotes } = generateRandomMessage(game);
    const color = generateTestColor();

    // Return structure matching Streamer.bot ChatMessage event
    return {
      messageId: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      user: {
        name: username,
        color: color,
        badges: [],
      },
      emotes,
      is_test: true,
    };
  }

  // ============================================================================
  // Credits Tracking (Phase 5)
  // ============================================================================

  /**
   * Creates a credits tracker for a specific stats replicant
   * Eliminates duplication between test and real credits tracking
   * @param {Object} statsReplicant - NodeCG replicant to track stats in
   * @param {string} label - Label for debug logging (e.g., "Test Credits", "Real Credits")
   * @returns {Object} Tracker object with trackChat, trackSubscription, trackDonation methods
   */
  function createCreditsTracker(statsReplicant, label) {
    return {
      /**
       * Tracks a chat message
       * @param {string} username - Username to track
       */
      trackChat(username) {
        const stats = statsReplicant.value;
        const userKey = username.toLowerCase();

        stats.chatCounts[userKey] = (stats.chatCounts[userKey] || 0) + 1;
        statsReplicant.value = stats;

        logger.debug(
          `[${label}] ${username}: ${stats.chatCounts[userKey]} messages`
        );
      },

      /**
       * Tracks a subscription
       * @param {string} username - Username to track
       * @param {number} [months=1] - Subscription months
       */
      trackSubscription(username, months = 1) {
        const stats = statsReplicant.value;
        const userKey = username.toLowerCase();

        stats.subMonths[userKey] = (stats.subMonths[userKey] || 0) + months;
        statsReplicant.value = stats;

        logger.debug(
          `[${label}] ${username}: ${stats.subMonths[userKey]} sub months`
        );
      },

      /**
       * Tracks a donation
       * @param {string} username - Username to track
       * @param {number} usd - USD amount
       */
      trackDonation(username, usd) {
        const stats = statsReplicant.value;
        const userKey = username.toLowerCase();

        stats.donoUSD[userKey] = (stats.donoUSD[userKey] || 0) + usd;
        statsReplicant.value = stats;

        logger.debug(
          `[${label}] ${username}: $${stats.donoUSD[userKey].toFixed(2)} donated`
        );
      },
    };
  }

  // Create tracker instances for test and real credits
  const testCredits = createCreditsTracker(testCreditsStatsRep, 'Test Credits');
  const realCredits = createCreditsTracker(creditsStatsRep, 'Real Credits');

  // ============================================================================
  // Test Mode Manager
  // ============================================================================

  /**
   * Manages test mode auto-generation intervals and settings
   * Encapsulates all test mode logic for better testability and separation of concerns
   */
  class TestModeManager {
    constructor() {
      this.chatInterval = null;
      this.alertInterval = null;
    }

    /**
     * Updates test mode based on new settings
     * @param {Object} settings - Full settings object
     */
    update(settings) {
      if (!settings) return;

      const testCfg = settings.testMode || {};
      logger.debug(
        `[Test Mode] Settings changed:`,
        JSON.stringify(testCfg, null, 2)
      );

      // Stop all existing intervals
      this.stopAll();

      // Start new intervals if master enabled
      if (testCfg.masterEnabled) {
        this.startChatAutoGen(testCfg, settings.danmaku);
        this.startAlertAutoGen(testCfg, settings.alerts);
      }
    }

    /**
     * Starts chat auto-generation
     * @param {Object} testCfg - Test mode configuration
     * @param {Object} danmakuSettings - Danmaku settings
     */
    startChatAutoGen(testCfg, danmakuSettings) {
      const danmakuEnabled = danmakuSettings?.enabled !== false;

      if (
        !testCfg.autoGenMessages ||
        !testCfg.messagesPerMinute ||
        testCfg.messagesPerMinute <= 0
      ) {
        logger.debug('[Test Mode] Chat auto-generation disabled');
        return;
      }

      if (!danmakuEnabled) {
        logger.debug(
          '[Test Mode] Chat auto-generation disabled - danmaku globally disabled'
        );
        return;
      }

      const intervalMs = Math.round(60000 / testCfg.messagesPerMinute);
      logger.debug(
        `[Test Mode] Chat auto-generation enabled: ${testCfg.messagesPerMinute} msg/min (${intervalMs}ms interval)`
      );

      this.chatInterval = setInterval(() => {
        const testMsg = generateTestMessage();
        handleChatMessage({
          event: STREAMERBOT_EVENTS.CHAT_MESSAGE,
          data: testMsg,
        });
      }, intervalMs);
    }

    /**
     * Starts alert auto-generation
     * @param {Object} testCfg - Test mode configuration
     * @param {Object} alertSettings - Alert settings
     */
    startAlertAutoGen(testCfg, alertSettings) {
      const alertsEnabled = alertSettings?.enabled !== false;
      const hasAlerts =
        testCfg.autoGenSubs || testCfg.autoGenFollows || testCfg.autoGenCheers;

      if (!hasAlerts || !testCfg.alertInterval || testCfg.alertInterval <= 0) {
        logger.debug('[Test Mode] Alert auto-generation disabled');
        return;
      }

      if (!alertsEnabled) {
        logger.debug(
          '[Test Mode] Alert auto-generation disabled - alerts globally disabled'
        );
        return;
      }

      const intervalMs = Math.round(testCfg.alertInterval * 1000);
      logger.debug(
        `[Test Mode] Alert auto-generation enabled: every ${testCfg.alertInterval}s (${intervalMs}ms)`
      );

      this.alertInterval = setInterval(() => {
        this.generateRandomAlert(testCfg);
      }, intervalMs);
    }

    /**
     * Generates a random alert based on enabled types
     * @param {Object} testCfg - Test mode configuration
     */
    generateRandomAlert(testCfg) {
      const enabledAlerts = [];
      if (testCfg.autoGenSubs) enabledAlerts.push('sub', 'resub', 'giftsub');
      if (testCfg.autoGenFollows) enabledAlerts.push('follow');
      if (testCfg.autoGenCheers) enabledAlerts.push('cheer');

      if (enabledAlerts.length === 0) return;

      const alertType =
        enabledAlerts[Math.floor(Math.random() * enabledAlerts.length)];

      switch (alertType) {
        case 'sub':
          handleSubscription({
            event: STREAMERBOT_EVENTS.SUB,
            data: generateTestSub(),
          });
          break;
        case 'resub':
          handleResubscription({
            event: STREAMERBOT_EVENTS.RESUB,
            data: generateTestResub(),
          });
          break;
        case 'giftsub':
          handleGiftSubscription({
            event: STREAMERBOT_EVENTS.GIFT_SUB,
            data: generateTestGiftSub(),
          });
          break;
        case 'follow':
          handleFollow({
            event: STREAMERBOT_EVENTS.FOLLOW,
            data: generateTestFollow(),
          });
          break;
        case 'cheer':
          handleCheer({
            event: STREAMERBOT_EVENTS.CHEER,
            data: generateTestCheer(),
          });
          break;
      }
    }

    /**
     * Stops all auto-generation intervals
     */
    stopAll() {
      if (this.chatInterval) {
        clearInterval(this.chatInterval);
        this.chatInterval = null;
      }
      if (this.alertInterval) {
        clearInterval(this.alertInterval);
        this.alertInterval = null;
      }
    }
  }

  // Create test mode manager instance
  const testModeManager = new TestModeManager();

  /**
   * Watch settings for test mode changes
   */
  settingsRep.on('change', (newValue) => {
    testModeManager.update(newValue);
  });

  // ============================================================================
  // Manual Test Event Handlers
  // ============================================================================

  /**
   * Creates a test event handler that enforces master toggle check
   * Factory function eliminates duplication across all manual test handlers
   *
   * @param {string} eventName - Human-readable event name for logging
   * @param {Function} generator - Function that generates test event data
   * @param {Function} handler - Event handler function to call with generated data
   * @param {string} streamerBotEvent - Streamer.bot event type constant
   * @returns {Function} Handler function for nodecg.listenFor
   */
  function createTestEventHandler(
    eventName,
    generator,
    handler,
    streamerBotEvent
  ) {
    return () => {
      // Check if master test mode is enabled
      const testCfg = settingsRep.value?.testMode || {};
      if (!testCfg.masterEnabled) {
        logger.warn(
          `[Test Mode] ${eventName} rejected - master test mode disabled`
        );
        return;
      }

      logger.debug(`[Test Mode] ${eventName}`);

      // Generate event and process through real handler
      const testEvent = generator();
      handler({
        event: streamerBotEvent,
        data: testEvent,
      });
    };
  }

  /**
   * Manual test message button
   * Generates Streamer.bot-compatible ChatMessage event and processes through real handler
   */
  nodecg.listenFor(
    EVENTS.TEST_SEND_MESSAGE,
    createTestEventHandler(
      'Manual test message',
      generateTestMessage,
      handleChatMessage,
      STREAMERBOT_EVENTS.CHAT_MESSAGE
    )
  );

  /**
   * Test subscription button
   * Generates Streamer.bot-compatible Sub event and processes through real handler
   */
  nodecg.listenFor(
    EVENTS.TEST_SEND_SUB,
    createTestEventHandler(
      'Test subscription',
      generateTestSub,
      handleSubscription,
      STREAMERBOT_EVENTS.SUB
    )
  );

  /**
   * Test resubscription button
   * Generates Streamer.bot-compatible Resub event and processes through real handler
   */
  nodecg.listenFor(
    EVENTS.TEST_SEND_RESUB,
    createTestEventHandler(
      'Test resubscription',
      generateTestResub,
      handleResubscription,
      STREAMERBOT_EVENTS.RESUB
    )
  );

  /**
   * Test gift subscription button
   * Generates Streamer.bot-compatible GiftSub event and processes through real handler
   */
  nodecg.listenFor(
    EVENTS.TEST_SEND_GIFTSUB,
    createTestEventHandler(
      'Test gift subscription',
      generateTestGiftSub,
      handleGiftSubscription,
      STREAMERBOT_EVENTS.GIFT_SUB
    )
  );

  /**
   * Test follow button
   * Generates Streamer.bot-compatible Follow event and processes through real handler
   */
  nodecg.listenFor(
    EVENTS.TEST_SEND_FOLLOW,
    createTestEventHandler(
      'Test follow',
      generateTestFollow,
      handleFollow,
      STREAMERBOT_EVENTS.FOLLOW
    )
  );

  /**
   * Test cheer button
   * Generates Streamer.bot-compatible Cheer event and processes through real handler
   */
  nodecg.listenFor(
    EVENTS.TEST_SEND_CHEER,
    createTestEventHandler(
      'Test cheer',
      generateTestCheer,
      handleCheer,
      STREAMERBOT_EVENTS.CHEER
    )
  );

  /**
   * Clear all messages button
   * Special case: doesn't need event generation, just master toggle check
   */
  nodecg.listenFor(EVENTS.TEST_CLEAR_ALL, () => {
    // Check if master test mode is enabled
    const testCfg = settingsRep.value?.testMode || {};
    if (!testCfg.masterEnabled) {
      logger.warn('[Test Mode] Clear all rejected - master test mode disabled');
      return;
    }

    logger.debug('[Test Mode] Clear all');
    nodecg.sendMessage(EVENTS.DANMAKU_CLEAR_ALL);
  });

  // ============================================================================
  // Credits Management
  // ============================================================================

  /**
   * Reset real credits stats
   */
  nodecg.listenFor(EVENTS.CREDITS_RESET_REAL, () => {
    logger.info('[Credits] Resetting real credits stats');
    creditsStatsRep.value = {
      chatCounts: {},
      subMonths: {},
      donoUSD: {},
    };
  });

  /**
   * Reset test credits stats
   */
  nodecg.listenFor(EVENTS.CREDITS_RESET_TEST, () => {
    logger.info('[Credits] Resetting test credits stats');
    testCreditsStatsRep.value = {
      chatCounts: {},
      subMonths: {},
      donoUSD: {},
    };
  });

  /**
   * Export real credits stats
   * Returns a deep copy of the real credits data
   */
  nodecg.listenFor(EVENTS.CREDITS_EXPORT_REAL, (data, ack) => {
    logger.info('[Credits] Exporting real credits stats');
    if (ack && !ack.handled) {
      const stats = creditsStatsRep.value || {
        chatCounts: {},
        subMonths: {},
        donoUSD: {},
      };
      ack(null, JSON.parse(JSON.stringify(stats)));
    }
  });

  /**
   * Export test credits stats
   * Returns a deep copy of the test credits data
   */
  nodecg.listenFor(EVENTS.CREDITS_EXPORT_TEST, (data, ack) => {
    logger.info('[Credits] Exporting test credits stats');
    if (ack && !ack.handled) {
      const stats = testCreditsStatsRep.value || {
        chatCounts: {},
        subMonths: {},
        donoUSD: {},
      };
      ack(null, JSON.parse(JSON.stringify(stats)));
    }
  });

  /**
   * Validates credits import data structure
   * @param {Object} data - Data to validate
   * @returns {Object} Validated data with chatCounts, subMonths, donoUSD
   * @throws {Error} If validation fails
   */
  function validateCreditsImport(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format');
    }

    const { chatCounts, subMonths, donoUSD } = data;

    if (
      typeof chatCounts !== 'object' ||
      typeof subMonths !== 'object' ||
      typeof donoUSD !== 'object'
    ) {
      throw new Error('Invalid credits data structure');
    }

    return { chatCounts, subMonths, donoUSD };
  }

  /**
   * Merges imported credits data with existing data
   * @param {Object} current - Current credits stats
   * @param {Object} imported - Imported credits stats
   * @returns {Object} Merged credits data
   */
  function mergeCreditsData(current, imported) {
    return {
      chatCounts: { ...current.chatCounts, ...imported.chatCounts },
      subMonths: { ...current.subMonths, ...imported.subMonths },
      donoUSD: { ...current.donoUSD, ...imported.donoUSD },
    };
  }

  /**
   * Generic credits import handler
   * @param {Object} statsReplicant - Replicant to import into
   * @param {string} label - Label for logging
   * @param {Object} data - Import data
   * @param {Function} ack - Acknowledgment callback
   */
  function handleCreditsImport(statsReplicant, label, data, ack) {
    logger.info(`[Credits] Importing ${label} credits stats`);

    try {
      const validated = validateCreditsImport(data);
      const current = statsReplicant.value || {
        chatCounts: {},
        subMonths: {},
        donoUSD: {},
      };

      statsReplicant.value = mergeCreditsData(current, validated);

      if (ack && !ack.handled) {
        ack(null, { success: true });
      }

      logger.info(`[Credits] ${label} credits imported successfully`);
    } catch (err) {
      logger.error('[Credits] Import failed:', err);
      if (ack && !ack.handled) {
        ack(err.message);
      }
    }
  }

  /**
   * Import real credits stats
   * Validates and merges imported data with existing data
   */
  nodecg.listenFor(EVENTS.CREDITS_IMPORT_REAL, (data, ack) => {
    handleCreditsImport(creditsStatsRep, 'real', data, ack);
  });

  /**
   * Import test credits stats
   * Validates and merges imported data with existing data
   */
  nodecg.listenFor(EVENTS.CREDITS_IMPORT_TEST, (data, ack) => {
    handleCreditsImport(testCreditsStatsRep, 'test', data, ack);
  });

  /**
   * Calculate estimated duration for credits animation
   * @param {string} which - 'real' or 'test'
   * @returns {Object} Estimation result with duration, userCount, and rowEstimate
   */
  function estimateCreditsDuration(which = 'real') {
    const settings = settingsRep.value?.credits || {};
    const srcStats =
      which === 'test' ? testCreditsStatsRep.value : creditsStatsRep.value;

    if (!srcStats) {
      return { duration: 0, userCount: 0, rowEstimate: 0 };
    }

    // Compute user list using same algorithm as graphics
    const wChat = settings.chatWeight ?? 1.0;
    const wSub = settings.subWeight ?? 2.0;
    const wDon = settings.donoWeight ?? 3.0;

    const entries = new Map();

    function add(map, weight, transform) {
      if (!map) return;
      Object.entries(map).forEach(([username, value]) => {
        if (!entries.has(username)) entries.set(username, 0);
        const addVal = transform ? transform(value) : value;
        entries.set(username, entries.get(username) + addVal * weight);
      });
    }

    add(srcStats.chatCounts, wChat, null);
    add(srcStats.subMonths, wSub, null);
    add(srcStats.donoUSD, wDon, (v) => Math.sqrt(Math.max(0, v)));

    const arr = [];
    entries.forEach((w, name) => {
      if (w > 0) arr.push({ name, w });
    });

    const userCount = arr.length;

    if (userCount === 0) {
      return { duration: 0, userCount: 0, rowEstimate: 0 };
    }

    // Hero count using formula from spec: min(4, max(0, round(log2(userCount + 1))))
    const heroCount = Math.min(
      4,
      Math.max(0, Math.round(Math.log2(userCount + 1)))
    );
    const cloudCount = userCount - heroCount;

    // Estimate rows (rough approximation: 5 names per row for cloud tags, 1 per hero)
    const cloudRows = cloudCount > 0 ? Math.ceil(cloudCount / 5) : 0;
    const rowEstimate = heroCount + cloudRows;

    // Calculate duration using formula from TECHNICAL_SPEC.md
    let durMs = Math.max(3000, (settings.duration || 60) * 1000);

    if (settings.durationAuto !== false) {
      // Default to auto
      const base = Math.max(4000, (settings.durationBaseSec || 12) * 1000);
      const perRow = Math.max(0, settings.durationPerRowMs || 850);
      const perName = Math.max(0, settings.durationPerNameMs || 80);

      durMs = base + rowEstimate * perRow + userCount * perName;
      durMs = Math.min(Math.max(3000, durMs), 120000); // Clamp 3-120s
    }

    // Note: heroExitMs is already budgeted within durMs by the graphics code
    // (graphics subtracts heroExitMs from remaining time for cloud scroll)
    // So we don't add it here to avoid inflating the estimate

    return {
      duration: Math.round(durMs / 1000), // Return in seconds
      userCount,
      rowEstimate,
    };
  }

  /**
   * Get estimated duration for real credits
   */
  nodecg.listenFor(EVENTS.CREDITS_ESTIMATE_REAL, (data, ack) => {
    if (ack && !ack.handled) {
      const estimate = estimateCreditsDuration('real');
      ack(null, estimate);
    }
  });

  /**
   * Get estimated duration for test credits
   */
  nodecg.listenFor(EVENTS.CREDITS_ESTIMATE_TEST, (data, ack) => {
    if (ack && !ack.handled) {
      const estimate = estimateCreditsDuration('test');
      ack(null, estimate);
    }
  });

  // ============================================================================
  // Startup
  // ============================================================================

  // Auto-connect on startup
  connectStreamerbot();
};
