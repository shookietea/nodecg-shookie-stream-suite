/**
 * Centralized logging utility for nodecg-shookie-stream-suite
 * Provides consistent log levels with Test Mode toggle control
 *
 * NodeCG has built-in log levels (trace, debug, info, warn, error) but they are
 * controlled globally via NodeCG config. This wrapper allows us to toggle debug
 * logging specifically for this bundle via the Test Mode setting.
 *
 * Log levels:
 * - debug: Detailed information for debugging (only shown when Test Mode enabled)
 * - info: General informational messages (always shown)
 * - warn: Warning messages for potential issues (always shown)
 * - error: Error messages for failures (always shown)
 */

module.exports = (nodecg) => {
  const settingsRep = nodecg.Replicant('settings');

  /**
   * Checks if debug logging is enabled (controlled by Test Mode master toggle)
   * @returns {boolean}
   */
  function isDebugEnabled() {
    return settingsRep.value?.testMode?.masterEnabled === true;
  }

  return {
    /**
     * Debug level logging - only shown when Test Mode is enabled
     * Uses NodeCG's built-in debug level if available, falls back to info with [DEBUG] prefix
     * @param {string} message - Log message
     * @param  {...any} args - Additional arguments
     */
    debug: (message, ...args) => {
      if (isDebugEnabled()) {
        // Use NodeCG's native debug if available, otherwise use info with prefix
        if (typeof nodecg.log.debug === 'function') {
          nodecg.log.debug(message, ...args);
        } else {
          nodecg.log.info(`[DEBUG] ${message}`, ...args);
        }
      }
    },

    /**
     * Info level logging - always shown
     * @param {string} message - Log message
     * @param  {...any} args - Additional arguments
     */
    info: (message, ...args) => {
      nodecg.log.info(message, ...args);
    },

    /**
     * Warning level logging - always shown
     * @param {string} message - Log message
     * @param  {...any} args - Additional arguments
     */
    warn: (message, ...args) => {
      nodecg.log.warn(message, ...args);
    },

    /**
     * Error level logging - always shown
     * @param {string} message - Log message
     * @param  {...any} args - Additional arguments
     */
    error: (message, ...args) => {
      nodecg.log.error(message, ...args);
    },
  };
};
