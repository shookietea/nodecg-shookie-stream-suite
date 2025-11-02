/**
 * Test alert generation utilities
 * Generates Streamer.bot-compatible event structures for testing
 */

const { getRandomGame, generateTestUsername, getRandomQuote } = require('./test-data');

/**
 * Generates a test subscription event matching Streamer.bot structure
 * @param {Object} [options] - Optional override values
 * @returns {Object} Streamer.bot Sub event structure
 */
function generateTestSub(options = {}) {
  const game = getRandomGame();
  const username = generateTestUsername(game);
  const tier = options.tier || (Math.floor(Math.random() * 3) + 1); // 1, 2, or 3
  const subTierStr = (tier * 1000).toString(); // "1000", "2000", or "3000"

  return {
    sub_tier: subTierStr,
    is_prime: options.isPrime || false,
    duration_months: options.durationMonths || 1,
    user: {
      role: 1,
      badges: [
        {
          name: 'subscriber',
          version: '0',
          imageUrl: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/3',
          info: '1'
        }
      ],
      subscribed: true,
      monthsSubscribed: 1,
      id: Math.floor(Math.random() * 999999999).toString(),
      login: username.toLowerCase(),
      name: username,
      type: 'twitch'
    },
    messageId: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    systemMessage: `${username} subscribed at tier ${tier}.`,
    is_test: true,
    isInSharedChat: false,
    isSharedChatHost: false,
    isFromSharedChatGuest: false
  };
}

/**
 * Generates a test resubscription event matching Streamer.bot structure
 * @param {Object} [options] - Optional override values
 * @returns {Object} Streamer.bot Resub event structure
 */
function generateTestResub(options = {}) {
  const game = getRandomGame();
  const username = generateTestUsername(game);
  const tier = options.tier || (Math.floor(Math.random() * 3) + 1);
  const subTierStr = (tier * 1000).toString();
  const months = options.months || (Math.floor(Math.random() * 24) + 1);
  const message = options.message !== undefined ? options.message : (Math.random() < 0.5 ? getRandomQuote(game) : '');

  return {
    cumulativeMonths: months,
    durationMonths: options.durationMonths || 0,
    streakMonths: options.streakMonths || 0,
    subTier: subTierStr,
    isPrime: options.isPrime || false,
    isGift: options.isGift || false,
    gifterIsAnonymous: false,
    text: message,
    parts: message ? [{ type: 'text', text: message }] : [],
    user: {
      role: 1,
      badges: [
        {
          name: 'subscriber',
          version: months.toString(),
          imageUrl: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/3',
          info: months.toString()
        }
      ],
      subscribed: true,
      monthsSubscribed: months,
      id: Math.floor(Math.random() * 999999999).toString(),
      login: username.toLowerCase(),
      name: username,
      type: 'twitch'
    },
    systemMessage: `${username} subscribed at tier ${tier}. They've subscribed for ${months} months!`,
    is_test: true,
    isInSharedChat: false,
    isSharedChatHost: false,
    isFromSharedChatGuest: false
  };
}

/**
 * Generates a test gift subscription event matching Streamer.bot structure
 * @param {Object} [options] - Optional override values
 * @returns {Object} Streamer.bot GiftSub event structure
 */
function generateTestGiftSub(options = {}) {
  const gifterGame = getRandomGame();
  const recipientGame = getRandomGame();
  const gifterUsername = generateTestUsername(gifterGame);
  const recipientUsername = generateTestUsername(recipientGame);
  const tier = options.tier || (Math.floor(Math.random() * 3) + 1);
  const subTierStr = (tier * 1000).toString();

  return {
    durationMonths: options.durationMonths || 1,
    cumlativeTotal: options.cumulativeTotal || 1, // Note: typo in Streamer.bot
    recipient: {
      id: Math.floor(Math.random() * 999999999).toString(),
      login: recipientUsername.toLowerCase(),
      name: recipientUsername,
      type: 'twitch'
    },
    subTier: subTierStr,
    fromCommunitySubGift: false,
    randomCommunitySubGift: false,
    communitySubGiftCount: 0,
    communitySubGiftCumulativeTotal: 0,
    user: {
      role: 1,
      badges: [
        {
          name: 'subscriber',
          version: '0',
          imageUrl: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/3',
          info: '1'
        }
      ],
      subscribed: true,
      monthsSubscribed: 0,
      id: Math.floor(Math.random() * 999999999).toString(),
      login: gifterUsername.toLowerCase(),
      name: gifterUsername,
      type: 'twitch'
    },
    systemMessage: `${gifterUsername} gifted a tier ${tier} to ${recipientUsername}!`,
    is_test: true,
    isInSharedChat: false,
    isSharedChatHost: false,
    isFromSharedChatGuest: false
  };
}

/**
 * Generates a test cheer event matching Streamer.bot structure
 * @param {Object} [options] - Optional override values
 * @returns {Object} Streamer.bot Cheer event structure
 */
function generateTestCheer(options = {}) {
  const game = getRandomGame();
  const username = generateTestUsername(game);
  const bits = options.bits || (Math.floor(Math.random() * 900) + 100);
  const message = options.message !== undefined ? options.message : (Math.random() < 0.5 ? getRandomQuote(game) : '');

  return {
    message: {
      badges: [
        {
          name: 'subscriber',
          version: '6',
          imageUrl: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/3',
          info: '6'
        }
      ],
      bits: bits,
      channel: 'test_channel',
      cheerEmotes: [
        {
          name: 'Cheer',
          amount: bits,
          color: '#9c3ee8',
          startIndex: 0,
          endIndex: `Cheer${bits}`.length - 1
        }
      ],
      displayName: username,
      emotes: [],
      firstMessage: false,
      hasBits: true,
      internal: false,
      isAnonymous: false,
      isCustomReward: false,
      isFromSharedChatGuest: false,
      isHighlighted: false,
      isInSharedChat: false,
      isMe: false,
      isReply: false,
      is_test: true,
      message: message || `Cheer${bits}`,
      monthsSubscribed: 6,
      msgId: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      returningChatter: false,
      role: 1,
      sourceBadges: [],
      subscriber: true,
      userId: Math.floor(Math.random() * 999999999).toString(),
      username: username.toLowerCase()
    },
    is_test: true
  };
}

/**
 * Generates a test follow event matching Streamer.bot structure
 * @param {Object} [options] - Optional override values
 * @returns {Object} Streamer.bot Follow event structure
 */
function generateTestFollow(options = {}) {
  const game = getRandomGame();
  const username = generateTestUsername(game);

  return {
    user_id: Math.floor(Math.random() * 999999999).toString(),
    user_login: username.toLowerCase(),
    user_name: username,
    followed_at: new Date().toISOString(),
    is_test: true
  };
}

module.exports = {
  generateTestSub,
  generateTestResub,
  generateTestGiftSub,
  generateTestCheer,
  generateTestFollow
};
