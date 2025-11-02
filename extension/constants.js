/**
 * Constants for nodecg-shookie-stream-suite bundle
 * Centralizes all magic numbers, event names, and default values
 */

// ============================================================================
// Timing Constants
// ============================================================================

const DEBOUNCE_MS = 500; // Dashboard auto-save debounce delay

// ============================================================================
// Default Values
// ============================================================================

const DEFAULTS = {
  // Streamer.bot connection
  STREAMERBOT_HOST: '127.0.0.1',
  STREAMERBOT_PORT: 8080,

  // Danmaku settings
  SPEED_MULT: 1.0, // Speed multiplier (0.25-3.0)
  SCALE_MODIFIER: 1.0, // Text scale (0.5-2.0)
  SHOW_USERNAMES: false, // Show username before message
  SHOW_EMOTES: true, // Show image emotes
  SHOW_EMOJIS: false, // Show Unicode emoji
  SHOW_TEXT: true, // Show message text
  // Note: Message density is now always adaptive (auto-adjusts based on queue depth)

  // Credits settings
  CHAT_WEIGHT: 1.0, // Chat message weight
  SUB_WEIGHT: 2.0, // Subscription weight
  DONO_WEIGHT: 3.0, // Donation weight (applied to sqrt(USD))
  SCROLL_SPEED: 3, // Scroll speed (1-10)
  CREDITS_DURATION_AUTO: true, // Auto-calculate duration
  CREDITS_DURATION: 60, // Manual duration (seconds, 3-120)
  CREDITS_DURATION_BASE_SEC: 12, // Auto-duration base (seconds)
  CREDITS_DURATION_PER_ROW_MS: 850, // Auto-duration per row (ms)
  CREDITS_DURATION_PER_NAME_MS: 80, // Auto-duration per name (ms)
  CREDITS_DENSITY: 1.0, // Font density (0.6-2.0)
  CREDITS_CLOUD_GAP: 8, // Cloud tag gap (px)
  CREDITS_HERO_SIZE_MULT: 1.6, // Hero size multiplier

  // Alert settings
  ALERTS_ENABLED: true, // Master enable toggle
  ALERT_DURATION: 5000, // Display duration (ms, 1000-30000)
  ALERT_SCALE_MODIFIER: 1.0, // Alert scale (0.5-2.0)

  // Test mode
  TEST_MODE_ENABLED: false, // Auto-generation toggle
  TEST_MESSAGES_PER_MINUTE: 60, // Messages per minute (1-300)
  TEST_ALERT_INTERVAL: 6, // Seconds between alerts (2-60)
};

// ============================================================================
// Value Ranges (for validation)
// ============================================================================

const RANGES = {
  SPEED_MULT: { min: 0.25, max: 3.0 },
  SCALE_MODIFIER: { min: 0.5, max: 2.0 },
  SCROLL_SPEED: { min: 1, max: 10 },
  CREDITS_DURATION: { min: 3, max: 120 },
  CREDITS_DURATION_BASE_SEC: { min: 1, max: 120 },
  CREDITS_DURATION_PER_ROW_MS: { min: 0, max: 5000 },
  CREDITS_DURATION_PER_NAME_MS: { min: 0, max: 1000 },
  CREDITS_DENSITY: { min: 0.6, max: 2.0 },
  CREDITS_CLOUD_GAP: { min: 0, max: 50 },
  CREDITS_HERO_SIZE_MULT: { min: 1, max: 3 },
  ALERT_DURATION: { min: 1000, max: 30000 },
  ALERT_SCALE_MODIFIER: { min: 0.5, max: 2.0 },
  TEST_MESSAGES_PER_MINUTE: { min: 1, max: 300 },
  TEST_ALERT_INTERVAL: { min: 2, max: 60 },
};


// ============================================================================
// NodeCG Message Events
// ============================================================================

const EVENTS = {
  // Streamer.bot connection control
  STREAMERBOT_CONNECT: 'streamerbot:connect',
  STREAMERBOT_DISCONNECT: 'streamerbot:disconnect',

  // Danmaku messages
  DANMAKU_MESSAGE: 'danmaku:message',
  DANMAKU_DELETE: 'danmaku:delete',
  DANMAKU_DELETE_USER: 'danmaku:deleteUser',
  DANMAKU_CLEAR_ALL: 'danmaku:clearAll',

  // Alert messages
  ALERT_SHOW: 'alert:show',
  ALERT_CLEAR: 'alert:clear',

  // Credits messages
  CREDITS_SHOW: 'credits:show',
  CREDITS_HIDE: 'credits:hide',
  CREDITS_UPDATE: 'credits:update',
  CREDITS_RESET_REAL: 'credits:resetReal',
  CREDITS_RESET_TEST: 'credits:resetTest',
  CREDITS_EXPORT_REAL: 'credits:exportReal',
  CREDITS_EXPORT_TEST: 'credits:exportTest',
  CREDITS_IMPORT_REAL: 'credits:importReal',
  CREDITS_IMPORT_TEST: 'credits:importTest',
  CREDITS_ESTIMATE_REAL: 'credits:estimateReal',
  CREDITS_ESTIMATE_TEST: 'credits:estimateTest',

  // Test mode messages
  TEST_SEND_MESSAGE: 'test:sendMessage',
  TEST_SEND_SUB: 'test:sendSub',
  TEST_SEND_RESUB: 'test:sendResub',
  TEST_SEND_GIFTSUB: 'test:sendGiftSub',
  TEST_SEND_CHEER: 'test:sendCheer',
  TEST_SEND_FOLLOW: 'test:sendFollow',
  TEST_CLEAR_ALL: 'test:clearAll',
};

// ============================================================================
// Streamer.bot WebSocket Event Names
// ============================================================================

const STREAMERBOT_EVENTS = {
  // Chat & Moderation
  CHAT_MESSAGE: 'Twitch.ChatMessage',
  MESSAGE_DELETED: 'Twitch.ChatMessageDeleted',
  USER_TIMED_OUT: 'Twitch.UserTimedOut',
  CHAT_CLEARED: 'Twitch.ChatCleared',

  // Subscriptions
  SUB: 'Twitch.Sub',
  RESUB: 'Twitch.ReSub',
  GIFT_SUB: 'Twitch.GiftSub',

  // Bits & Follow
  CHEER: 'Twitch.Cheer',
  FOLLOW: 'Twitch.Follow',
};

// ============================================================================
// Replicant Names
// ============================================================================

const REPLICANTS = {
  SETTINGS: 'settings',
  CREDITS_STATS: 'creditsStats',
  TEST_CREDITS_STATS: 'testCreditsStats',
  CONNECTION_STATUS: 'connectionStatus',
};

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  DEBOUNCE_MS,
  DEFAULTS,
  RANGES,
  EVENTS,
  STREAMERBOT_EVENTS,
  REPLICANTS,
};
