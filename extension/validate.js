/**
 * Validation and normalization functions for nodecg-shookie-stream-suite bundle
 * Ensures data integrity and provides type-safe defaults
 */

const { DEFAULTS, RANGES } = require('./constants');

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clamps a number between min and max values
 * @param {number} val - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Safely parses a number with fallback
 * @param {any} val - Value to parse
 * @param {number} fallback - Fallback value
 * @returns {number}
 */
function parseNumber(val, fallback) {
  const num = Number(val);
  return Number.isFinite(num) ? num : fallback;
}

/**
 * Safely parses a boolean with fallback
 * @param {any} val - Value to parse
 * @param {boolean} fallback - Fallback value
 * @returns {boolean}
 */
function parseBoolean(val, fallback) {
  if (typeof val === 'boolean') return val;
  if (val === 'true') return true;
  if (val === 'false') return false;
  return fallback;
}

// ============================================================================
// Settings Validation
// ============================================================================

/**
 * Validates and normalizes Streamer.bot settings
 * @param {any} settings - Raw settings object
 * @returns {import('./types').StreamerbotSettings}
 */
function validateStreamerbotSettings(settings) {
  return {
    host: settings?.host || DEFAULTS.STREAMERBOT_HOST,
    port: parseNumber(settings?.port, DEFAULTS.STREAMERBOT_PORT),
  };
}

/**
 * Validates and normalizes danmaku settings
 * @param {any} settings - Raw settings object
 * @returns {import('./types').DanmakuSettings}
 */
function validateDanmakuSettings(settings) {
  return {
    enabled: parseBoolean(settings?.enabled, true), // Default to true
    speedMult: clamp(
      parseNumber(settings?.speedMult, DEFAULTS.SPEED_MULT),
      RANGES.SPEED_MULT.min,
      RANGES.SPEED_MULT.max
    ),
    scaleModifier: clamp(
      parseNumber(settings?.scaleModifier, DEFAULTS.SCALE_MODIFIER),
      RANGES.SCALE_MODIFIER.min,
      RANGES.SCALE_MODIFIER.max
    ),
    showUsernames: parseBoolean(
      settings?.showUsernames,
      DEFAULTS.SHOW_USERNAMES
    ),
    showEmotes: parseBoolean(settings?.showEmotes, DEFAULTS.SHOW_EMOTES),
    showEmojis: parseBoolean(settings?.showEmojis, DEFAULTS.SHOW_EMOJIS),
    showText: parseBoolean(settings?.showText, DEFAULTS.SHOW_TEXT),
  };
}

/**
 * Validates and normalizes credits settings
 * @param {any} settings - Raw settings object
 * @returns {import('./types').CreditsSettings}
 */
function validateCreditsSettings(settings) {
  return {
    enabled: parseBoolean(settings?.enabled, true), // Default to true
    chatWeight: parseNumber(settings?.chatWeight, DEFAULTS.CHAT_WEIGHT),
    subWeight: parseNumber(settings?.subWeight, DEFAULTS.SUB_WEIGHT),
    donoWeight: parseNumber(settings?.donoWeight, DEFAULTS.DONO_WEIGHT),
    scrollSpeed: clamp(
      parseNumber(settings?.scrollSpeed, DEFAULTS.SCROLL_SPEED),
      RANGES.SCROLL_SPEED.min,
      RANGES.SCROLL_SPEED.max
    ),
  };
}

/**
 * Validates and normalizes alert settings
 * @param {any} settings - Raw settings object
 * @returns {import('./types').AlertSettings}
 */
function validateAlertSettings(settings) {
  return {
    enabled: parseBoolean(settings?.enabled, DEFAULTS.ALERTS_ENABLED),
    duration: clamp(
      parseNumber(settings?.duration, DEFAULTS.ALERT_DURATION),
      RANGES.ALERT_DURATION.min,
      RANGES.ALERT_DURATION.max
    ),
    scaleModifier: clamp(
      parseNumber(settings?.scaleModifier, DEFAULTS.ALERT_SCALE_MODIFIER),
      RANGES.ALERT_SCALE_MODIFIER.min,
      RANGES.ALERT_SCALE_MODIFIER.max
    ),
  };
}

/**
 * Validates and normalizes blocklist settings
 * @param {any} settings - Raw settings object
 * @returns {import('./types').BlocklistSettings}
 */
function validateBlocklistSettings(settings) {
  const usernames = settings?.usernames;
  return {
    usernames: Array.isArray(usernames)
      ? usernames.map((u) => String(u).toLowerCase())
      : [],
  };
}

/**
 * Validates and normalizes test mode settings
 * @param {any} settings - Raw settings object
 * @returns {import('./types').TestModeSettings}
 */
function validateTestModeSettings(settings) {
  return {
    enabled: parseBoolean(settings?.enabled, DEFAULTS.TEST_MODE_ENABLED),
    messagesPerMinute: clamp(
      parseNumber(
        settings?.messagesPerMinute,
        DEFAULTS.TEST_MESSAGES_PER_MINUTE
      ),
      RANGES.TEST_MESSAGES_PER_MINUTE.min,
      RANGES.TEST_MESSAGES_PER_MINUTE.max
    ),
  };
}

/**
 * Validates and normalizes entire settings object
 * @param {any} settings - Raw settings from replicant
 * @returns {import('./types').Settings}
 */
function validateSettings(settings) {
  return {
    streamerBot: validateStreamerbotSettings(settings?.streamerBot),
    danmaku: validateDanmakuSettings(settings?.danmaku),
    credits: validateCreditsSettings(settings?.credits),
    alerts: validateAlertSettings(settings?.alerts),
    blockList: validateBlocklistSettings(settings?.blockList),
    testMode: validateTestModeSettings(settings?.testMode),
  };
}

// ============================================================================
// Event Data Validation
// ============================================================================

/**
 * Normalizes chat message from Streamer.bot event
 * @param {import('./types').ChatMessageEvent} data - Raw event data
 * @returns {import('./types').NormalizedMessage|null} Normalized message or null if invalid
 */
function normalizeChatMessage(data) {
  // Validate required fields
  if (!data || !data.messageId || !data.text) {
    return null;
  }

  // Extract username (prefer user.name, fallback to message.displayName)
  const username = data.user?.name || data.message?.displayName || 'Unknown';

  // Extract color (user.color or fallback to generated color)
  const color = data.user?.color || '#FFFFFF';

  // Normalize badges
  const badges = Array.isArray(data.user?.badges) ? data.user.badges : [];

  // Normalize emotes
  const emotes = Array.isArray(data.emotes) ? data.emotes : [];

  return {
    messageId: data.messageId,
    username,
    text: data.text,
    color,
    badges,
    emotes,
  };
}

/**
 * Checks if a username is blocked
 * @param {string} username - Username to check
 * @param {string[]} blocklist - Blocked usernames (lowercase)
 * @returns {boolean} True if blocked
 */
function isBlocked(username, blocklist) {
  if (!Array.isArray(blocklist) || blocklist.length === 0) {
    return false;
  }
  return blocklist.includes(username.toLowerCase());
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // Utility functions
  clamp,
  parseNumber,
  parseBoolean,

  // Settings validation
  validateSettings,
  validateStreamerbotSettings,
  validateDanmakuSettings,
  validateCreditsSettings,
  validateAlertSettings,
  validateBlocklistSettings,
  validateTestModeSettings,

  // Event validation
  normalizeChatMessage,
  isBlocked,
};
