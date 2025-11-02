/**
 * Shared logger utility for graphics files
 * Provides consistent logging behavior across all graphics with Test Mode control
 *
 * Usage in graphics HTML files:
 *   <script src="shared-logger.js"></script>
 *   <script>
 *     const settingsRep = nodecg.Replicant('settings');
 *     const logger = createLogger('Danmaku', settingsRep);
 *     logger.debug('Debug message');
 *     logger.info('Info message');
 *   </script>
 */

/**
 * Creates a logger instance for a graphics file
 * @param {string} prefix - Prefix for log messages (e.g., 'Danmaku', 'Credits', 'Alerts')
 * @param {Object} settingsRep - NodeCG settings replicant
 * @returns {Object} Logger object with debug, info, warn, error methods
 */
function createLogger(prefix, settingsRep) {
  /**
   * Checks if debug logging is enabled via Test Mode
   * @returns {boolean}
   */
  function isDebugEnabled() {
    return settingsRep.value?.testMode?.masterEnabled === true;
  }

  return {
    /**
     * Debug level logging - only shown when Test Mode is enabled
     * @param {string} msg - Log message
     * @param {...any} args - Additional arguments
     */
    debug: (msg, ...args) => {
      if (isDebugEnabled()) {
        console.log(`[${prefix}][DEBUG] ${msg}`, ...args);
      }
    },

    /**
     * Info level logging - always shown
     * @param {string} msg - Log message
     * @param {...any} args - Additional arguments
     */
    info: (msg, ...args) => {
      console.log(`[${prefix}] ${msg}`, ...args);
    },

    /**
     * Warning level logging - always shown
     * @param {string} msg - Log message
     * @param {...any} args - Additional arguments
     */
    warn: (msg, ...args) => {
      console.warn(`[${prefix}] ${msg}`, ...args);
    },

    /**
     * Error level logging - always shown
     * @param {string} msg - Log message
     * @param {...any} args - Additional arguments
     */
    error: (msg, ...args) => {
      console.error(`[${prefix}] ${msg}`, ...args);
    }
  };
}
