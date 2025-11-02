/**
 * Shared test data for generating fake messages and events
 * Used by test mode for both danmaku messages and alerts
 */

// ============================================================================
// Username Pools (will have 00-99 suffix added)
// ============================================================================

const USERNAME_POOLS = {
  zeldaCDI: ['Morshu', 'KingHarkinian', 'LinkCDI', 'ZeldaCDI', 'Gwonam', 'Ganon'],
  metalGear: ['SolidSnake', 'Raiden', 'Otacon', 'Meryl', 'PsychoMantis', 'LiquidSnake', 'BigBoss'],
  starFox: ['FoxMcCloud', 'PeppyHare', 'SlippyToad', 'FalcoLombardi', 'Andross', 'Wolf'],
  classic: ['AllYourBase', 'ErrorGuy', 'MarioFan', 'SpoonyBard', 'BarrelRoll']
};

// ============================================================================
// Quotes by Game (for matching usernames to messages)
// ============================================================================

const QUOTES_BY_GAME = {
  zeldaCDI: [
    "Lamp oil, rope, bombs? You want it? It's yours my friend, as long as you have enough rupees",
    "Come back when you're a little... mmm... richer!",
    "Sorry Link, I can't give credit!",
    "My boy, this peace is what all true warriors strive for!",
    "I wonder what's for dinner?",
    "Great! I'll grab my stuff!",
    "Squadala! We're off!",
    "You've saved me!",
  ],
  metalGear: [
    "Snake? Snake?! SNAAAAKE!",
    "!",
    "Kept you waiting, huh?",
    "A Hind D?",
    "Metal Gear!?",
    "You're that ninja...",
    "This is just like one of my Japanese animes!",
    "Nanomachines, son!",
  ],
  starFox: [
    "Do a barrel roll!",
    "Use bombs wisely!",
    "Try a somersault!",
    "Can't let you do that, Star Fox!",
    "Cocky little freaks!",
    "You're becoming more like your father!",
    "Use the boost to get through!",
    "Never give up! Trust your instincts!",
  ],
  classic: [
    "All your base are belong to us",
    "A winner is you!",
    "You spoony bard!",
    "It's dangerous to go alone! Take this.",
    "I am Error",
    "Thank you Mario! But our princess is in another castle!",
    "Hey! Listen!",
    "Well excuuuuse me, princess!",
  ]
};

// ============================================================================
// Emote Sources
// ============================================================================

const EMOTES = [
  // 7TV emotes
  { name: 'MorshuPls', imageUrl: 'https://cdn.7tv.app/emote/01FECN31HG000FR0PC38FM24ED/4x.webp' },
  { name: 'LinkPls', imageUrl: 'https://cdn.7tv.app/emote/01FPC03SF8000FZADBM40VTNTB/4x.webp' },
  { name: 'KATA', imageUrl: 'https://cdn.7tv.app/emote/01FQWCT6KR000C9WD6RQDF1J82/4x.webp' },

  // BTTV
  { name: 'catJAM', imageUrl: 'https://cdn.betterttv.net/emote/5f1b0186cf6d2144653d2970/3x' },
  { name: 'D:', imageUrl: 'https://cdn.betterttv.net/emote/55028cd2135896936880fdd7/3x' },
  { name: 'GoodBoy', imageUrl: 'https://cdn.betterttv.net/emote/5c783f4c109c241e4e38624e/3x' },
  { name: 'Clap', imageUrl: 'https://cdn.betterttv.net/emote/55b6f480e66682f576dd94f5/3x' },

  // FFZ
  { name: 'KEKW', imageUrl: 'https://cdn.frankerfacez.com/emote/381875/4' },
  { name: 'SourPls', imageUrl: 'https://cdn.frankerfacez.com/emote/68856/4' },

  // Twitch
  { name: 'Kappa', imageUrl: 'https://static-cdn.jtvnw.net/emoticons/v2/25/default/dark/3.0' },
  { name: 'LUL', imageUrl: 'https://static-cdn.jtvnw.net/emoticons/v2/425618/default/dark/3.0' },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generates random HSL color for test usernames
 * @returns {string} HSL color string
 */
function generateTestColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 85%, 60%)`;
}

/**
 * Picks a random game key
 * @returns {string} Game key (zeldaCDI, metalGear, starFox, classic)
 */
function getRandomGame() {
  const games = Object.keys(QUOTES_BY_GAME);
  return games[Math.floor(Math.random() * games.length)];
}

/**
 * Generates username with game-specific base name and 00-99 suffix
 * @param {string} game - Game key (zeldaCDI, metalGear, starFox, classic)
 * @returns {string} Username with suffix (e.g., "Morshu42")
 */
function generateTestUsername(game) {
  const pool = USERNAME_POOLS[game];
  const baseName = pool[Math.floor(Math.random() * pool.length)];
  const suffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${baseName}${suffix}`;
}

/**
 * Gets a random quote for a specific game
 * @param {string} game - Game key
 * @returns {string} Random quote
 */
function getRandomQuote(game) {
  const quotes = QUOTES_BY_GAME[game];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

/**
 * Gets a random emote
 * @returns {Object} Emote object { name, imageUrl }
 */
function getRandomEmote() {
  return EMOTES[Math.floor(Math.random() * EMOTES.length)];
}

/**
 * Generates a random message with optional emotes
 * @param {string} game - Game key
 * @param {number} [maxEmotes=3] - Maximum number of emotes to append
 * @returns {Object} { text, emotes[] }
 */
function generateRandomMessage(game, maxEmotes = 3) {
  let text = getRandomQuote(game);
  const emotes = [];

  // Random emotes (0-maxEmotes) appended to end of text
  const emoteCount = Math.floor(Math.random() * (maxEmotes + 1));

  for (let i = 0; i < emoteCount; i++) {
    const emote = getRandomEmote();

    // Append emote name to text with space
    const startIndex = text.length + 1; // +1 for space
    text += ' ' + emote.name;

    emotes.push({
      name: emote.name,
      imageUrl: emote.imageUrl,
      startIndex: startIndex,
      endIndex: text.length - 1
    });
  }

  return { text, emotes };
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  USERNAME_POOLS,
  QUOTES_BY_GAME,
  EMOTES,
  generateTestColor,
  getRandomGame,
  generateTestUsername,
  getRandomQuote,
  getRandomEmote,
  generateRandomMessage
};
