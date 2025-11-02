/**
 * Type definitions for nodecg-shookie-stream-suite bundle
 * Using JSDoc annotations for type safety without TypeScript compilation
 * Based on TECHNICAL_SPEC.md and Streamer.bot WebSocket API
 */

// ============================================================================
// Streamer.bot Event Types
// ============================================================================

/**
 * @typedef {Object} TwitchUser
 * @property {string} id - Twitch user ID
 * @property {string} login - Twitch login (lowercase)
 * @property {string} name - Display name
 * @property {0|1|2|3|4} role - User role (0=None, 1=Viewer, 2=VIP, 3=Moderator, 4=Broadcaster)
 * @property {TwitchBadge[]} badges - User badges
 * @property {('1000'|'2000'|'3000'|null)} subscriptionTier - Sub tier (Tier 1/2/3) or null
 * @property {string} color - Username color (hex format)
 */

/**
 * @typedef {Object} TwitchBadge
 * @property {string} name - Badge name
 * @property {string} version - Badge version
 * @property {string} imageUrl - Badge image URL
 */

/**
 * @typedef {Object} TwitchEmote
 * @property {string} id - Emote ID
 * @property {string} name - Emote name
 * @property {number} startIndex - Start index in message text
 * @property {number} endIndex - End index in message text
 * @property {string} imageUrl - Emote image URL
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} userId - User ID
 * @property {string} username - Username (lowercase)
 * @property {string} displayName - Display name
 * @property {string} message - Message text
 * @property {TwitchBadge[]} badges - User badges
 * @property {TwitchEmote[]} emotes - Emotes in message
 * @property {number} bits - Bits amount (0 if none)
 * @property {number} role - User role
 * @property {boolean} subscriber - Is subscriber
 * @property {string} channel - Channel name
 */

/**
 * @typedef {Object} ChatMessageEvent
 * @property {string} messageId - Unique message ID
 * @property {string} text - Message text
 * @property {boolean} anonymous - Is anonymous message
 * @property {boolean} isTest - Is test message
 * @property {boolean} isReply - Is reply to another message
 * @property {boolean} isFromSharedChatGuest - From shared chat guest
 * @property {boolean} isInSharedChat - In shared chat
 * @property {boolean} isSharedChatHost - Is shared chat host
 * @property {TwitchUser} user - User info
 * @property {ChatMessage} message - Message details
 * @property {TwitchEmote[]} emotes - Emotes
 * @property {any[]} parts - Message parts
 */

/**
 * @typedef {Object} MessageDeletedEvent
 * @property {string} messageId - Message ID to delete
 * @property {TwitchUser} targetUser - User whose message was deleted
 * @property {TwitchUser} moderator - Moderator who deleted
 * @property {boolean} isTest - Is test event
 * @property {boolean} isFromSharedChatGuest - From shared chat guest
 * @property {boolean} isInSharedChat - In shared chat
 * @property {boolean} isSharedChatHost - Is shared chat host
 */

/**
 * @typedef {Object} UserTimedOutEvent
 * @property {TwitchUser} targetUser - User who was timed out
 * @property {number} duration - Timeout duration in seconds
 * @property {string} reason - Timeout reason
 */

/**
 * Streamer.bot Subscription Event
 * @typedef {Object} SubscriptionEvent
 * @property {('1000'|'2000'|'3000')} sub_tier - Subscription tier ("1000", "2000", or "3000")
 * @property {boolean} is_prime - Is Prime Gaming subscription
 * @property {number} duration_months - Duration in months
 * @property {TwitchUser} user - User who subscribed
 * @property {string} messageId - Message ID
 * @property {string} systemMessage - System-generated message
 * @property {boolean} isTest - Is test event
 * @property {boolean} isInSharedChat - Is in shared chat
 * @property {boolean} isSharedChatHost - Is shared chat host
 * @property {boolean} isFromSharedChatGuest - Is from shared chat guest
 */

/**
 * Streamer.bot Resubscription Event
 * @typedef {Object} ResubscriptionEvent
 * @property {number} cumulativeMonths - Total months subscribed
 * @property {number} durationMonths - Duration months
 * @property {number} streakMonths - Streak months
 * @property {('1000'|'2000'|'3000')} subTier - Subscription tier
 * @property {boolean} isPrime - Is Prime Gaming subscription
 * @property {boolean} isGift - Is gifted subscription
 * @property {boolean} gifterIsAnonymous - Is gifter anonymous
 * @property {string} text - Resub message text
 * @property {any[]} parts - Message parts
 * @property {TwitchUser} user - User who resubscribed
 * @property {string} systemMessage - System-generated message
 * @property {boolean} isTest - Is test event
 * @property {boolean} isInSharedChat - Is in shared chat
 * @property {boolean} isSharedChatHost - Is shared chat host
 * @property {boolean} isFromSharedChatGuest - Is from shared chat guest
 */

/**
 * Streamer.bot Gift Subscription Event
 * @typedef {Object} GiftSubscriptionEvent
 * @property {number} durationMonths - Duration in months
 * @property {number} cumlativeTotal - Cumulative total (typo in Streamer.bot)
 * @property {Object} recipient - Gift recipient
 * @property {string} recipient.id - Recipient Twitch ID
 * @property {string} recipient.login - Recipient login (lowercase)
 * @property {string} recipient.name - Recipient display name
 * @property {string} recipient.type - Account type (always 'twitch')
 * @property {('1000'|'2000'|'3000')} subTier - Subscription tier
 * @property {boolean} fromCommunitySubGift - From community sub gift
 * @property {boolean} randomCommunitySubGift - Random community sub gift
 * @property {number} communitySubGiftCount - Community sub gift count
 * @property {number} communitySubGiftCumulativeTotal - Community sub gift cumulative total
 * @property {TwitchUser} user - User who gifted (the gifter)
 * @property {string} systemMessage - System-generated message
 * @property {boolean} isTest - Is test event
 * @property {boolean} isInSharedChat - Is in shared chat
 * @property {boolean} isSharedChatHost - Is shared chat host
 * @property {boolean} isFromSharedChatGuest - Is from shared chat guest
 */

/**
 * Streamer.bot Cheer Event (nested structure)
 * @typedef {Object} CheerEvent
 * @property {Object} message - Message object containing cheer data
 * @property {TwitchBadge[]} message.badges - User badges
 * @property {number} message.bits - Bits amount
 * @property {string} message.channel - Channel name
 * @property {any[]} message.cheerEmotes - Cheer emote data
 * @property {string} message.displayName - Display name
 * @property {any[]} message.emotes - Emotes
 * @property {boolean} message.firstMessage - Is first message
 * @property {boolean} message.hasBits - Has bits
 * @property {boolean} message.internal - Is internal
 * @property {boolean} message.isAnonymous - Is anonymous
 * @property {boolean} message.isCustomReward - Is custom reward
 * @property {boolean} message.isFromSharedChatGuest - From shared chat guest
 * @property {boolean} message.isHighlighted - Is highlighted
 * @property {boolean} message.isInSharedChat - In shared chat
 * @property {boolean} message.isMe - Is /me command
 * @property {boolean} message.isReply - Is reply
 * @property {boolean} message.isTest - Is test
 * @property {string} message.message - Message text
 * @property {number} message.monthsSubscribed - Months subscribed
 * @property {string} message.msgId - Message ID
 * @property {boolean} message.returningChatter - Returning chatter
 * @property {number} message.role - User role
 * @property {any[]} message.sourceBadges - Source badges
 * @property {boolean} message.subscriber - Is subscriber
 * @property {string} message.userId - User ID
 * @property {string} message.username - Username (lowercase)
 * @property {boolean} isTest - Is test event (root level)
 */

/**
 * Streamer.bot Follow Event
 * @typedef {Object} FollowEvent
 * @property {string} user_id - Twitch user ID
 * @property {string} user_login - Username (lowercase)
 * @property {string} user_name - Display name
 * @property {string} followed_at - ISO timestamp of follow
 * @property {boolean} is_test - Is test event
 */

// ============================================================================
// Settings Types
// ============================================================================

/**
 * @typedef {Object} StreamerbotSettings
 * @property {string} host - Streamer.bot host (default: '127.0.0.1')
 * @property {number} port - Streamer.bot port (default: 8080)
 */

/**
 * @typedef {Object} DanmakuSettings
 * @property {boolean} enabled - Master enable toggle (default: true)
 * @property {number} speedMult - Speed multiplier (0.25-3.0, default: 1.0)
 * @property {number} scaleModifier - Text scale (0.5-2.0, default: 1.0)
 * @property {boolean} showUsernames - Show username before message (default: false)
 * @property {boolean} showEmotes - Show image emotes (default: true)
 * @property {boolean} showEmojis - Show Unicode emoji (default: false)
 * @property {boolean} showText - Show message text (default: true)
 */

/**
 * @typedef {Object} CreditsSettings
 * @property {boolean} enabled - Master enable toggle (default: true)
 * @property {number} chatWeight - Chat message weight (default: 1.0)
 * @property {number} subWeight - Subscription weight (default: 2.0)
 * @property {number} donoWeight - Donation weight (default: 3.0)
 * @property {number} scrollSpeed - Scroll speed (1-10, default: 3)
 */

/**
 * @typedef {Object} AlertSettings
 * @property {boolean} enabled - Master enable toggle (default: true)
 * @property {number} duration - Alert display duration in ms (1000-30000, default: 5000)
 * @property {number} scaleModifier - Alert scale (0.5-2.0, default: 1.0)
 */

/**
 * @typedef {Object} BlocklistSettings
 * @property {string[]} usernames - Blocked usernames (lowercase, default: [])
 */

/**
 * @typedef {Object} TestModeSettings
 * @property {boolean} enabled - Enable test mode auto-generation (default: false)
 * @property {number} messagesPerMinute - Test messages per minute (1-180, default: 30)
 */

/**
 * @typedef {Object} Settings
 * @property {StreamerbotSettings} streamerBot - Streamer.bot connection settings
 * @property {DanmakuSettings} danmaku - Danmaku overlay settings (includes collision settings)
 * @property {CreditsSettings} credits - Credits system settings
 * @property {AlertSettings} alerts - Alert settings
 * @property {BlocklistSettings} blockList - Blocklist settings
 * @property {TestModeSettings} testMode - Test mode settings
 */

// ============================================================================
// Replicant Types
// ============================================================================

/**
 * @typedef {Object} ConnectionStatus
 * @property {boolean} connected - Connection state
 * @property {string|null} error - Error message or null
 */

/**
 * @typedef {Object} CreditsEntry
 * @property {string} username - Username
 * @property {number} chatMessages - Chat message count
 * @property {number} subscriptions - Subscription count
 * @property {number} donations - Donation total (USD)
 * @property {number} weight - Calculated weight
 */

/**
 * @typedef {Object} CreditsStats
 * @property {CreditsEntry[]} entries - Credits entries
 * @property {number} lastUpdated - Last update timestamp
 */

// ============================================================================
// Graphics/Overlay Types
// ============================================================================

/**
 * @typedef {Object} DanmakuMessage
 * @property {string} id - Message ID
 * @property {string} username - Display name
 * @property {string} text - Message text
 * @property {string} color - Username color
 * @property {TwitchBadge[]} badges - User badges
 * @property {TwitchEmote[]} emotes - Emotes in message
 * @property {boolean} [burst] - Is burst message (for testing)
 */

/**
 * @typedef {Object} ActiveMessage
 * @property {string} id - Message ID
 * @property {HTMLElement} el - DOM element
 * @property {number} x - X position (pixels)
 * @property {number} y - Y position (pixels)
 * @property {number} w - Width (pixels)
 * @property {number} h - Height (pixels)
 * @property {number} speed - Scroll speed (px/s)
 * @property {string} userKey - Username (for deletion)
 */

/**
 * @typedef {Object} AlertData
 * @property {('follow'|'sub'|'resub'|'giftsub'|'cheer')} type - Alert type
 * @property {string} displayName - Display name
 * @property {number} [tier] - Subscription tier (1/2/3)
 * @property {number} [months] - Cumulative months
 * @property {number} [bits] - Bits amount
 * @property {string} [message] - Optional message
 * @property {string} [recipient] - Gift sub recipient
 */

// ============================================================================
// Validation/Normalization Types
// ============================================================================

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Is valid
 * @property {string} [error] - Error message if invalid
 * @property {any} [data] - Validated/normalized data
 */

/**
 * @typedef {Object} NormalizedMessage
 * @property {string} messageId - Message ID
 * @property {string} username - Display name
 * @property {string} text - Message text
 * @property {string} color - Username color (hex)
 * @property {TwitchBadge[]} badges - Normalized badges
 * @property {TwitchEmote[]} emotes - Normalized emotes
 */

// ============================================================================
// Exports (for IDE autocomplete)
// ============================================================================

module.exports = {};
