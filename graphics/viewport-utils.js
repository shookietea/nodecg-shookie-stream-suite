/**
 * Viewport Utilities
 * Shared utilities for responsive graphics scaling across all overlays
 *
 * Provides consistent viewport-based sizing calculations to ensure
 * overlays scale properly from 720p to 4K+ resolutions.
 */

/**
 * Get current viewport dimensions
 * @returns {{W: number, H: number}} Viewport width and height in pixels
 */
export function getViewportDimensions() {
  return {
    W: window.innerWidth,
    H: window.innerHeight
  };
}

/**
 * Calculate responsive font size based on viewport height percentage
 * Used for auto-scaling text across different resolutions
 *
 * @param {number} percentOfHeight - Base percentage (e.g., 0.035 for 3.5%)
 * @param {number} min - Minimum size in pixels (safety floor)
 * @param {number} max - Maximum size in pixels (safety ceiling)
 * @returns {number} Calculated font size in pixels
 *
 * @example
 * // Danmaku base font: 3.5% of height, clamped 24-100px
 * const fontSize = calculateResponsiveFontSize(0.035, 24, 100);
 *
 * @example
 * // Alert title: 1.5% of height, clamped 12-35px
 * const titleSize = calculateResponsiveFontSize(0.015, 12, 35);
 */
export function calculateResponsiveFontSize(percentOfHeight, min, max) {
  const { H } = getViewportDimensions();
  const autoSize = H * percentOfHeight;
  return Math.min(Math.max(autoSize, min), max);
}

/**
 * Calculate responsive font size with rounding
 * Same as calculateResponsiveFontSize but returns rounded integer
 *
 * @param {number} percentOfHeight - Base percentage (e.g., 0.022 for 2.2%)
 * @param {number} min - Minimum size in pixels
 * @param {number} max - Maximum size in pixels
 * @returns {number} Rounded font size in pixels
 *
 * @example
 * // Alert meta size: 2.2% of height, rounded, clamped 18-48px
 * const metaSize = calculateResponsiveFontSizeRounded(0.022, 18, 48);
 */
export function calculateResponsiveFontSizeRounded(percentOfHeight, min, max) {
  const size = calculateResponsiveFontSize(percentOfHeight, min, max);
  return Math.round(size);
}

/**
 * Apply scale modifier to a base dimension
 * Used for user-configurable scaling (e.g., dashboard scale slider)
 *
 * @param {number} baseValue - Base value before scaling
 * @param {number} scaleModifier - Multiplier (e.g., 1.0 = 100%, 1.5 = 150%)
 * @returns {number} Scaled value
 *
 * @example
 * const baseFontSize = calculateResponsiveFontSize(0.035, 24, 100);
 * const scaledFontSize = applyScaleModifier(baseFontSize, 1.25); // 25% larger
 */
export function applyScaleModifier(baseValue, scaleModifier) {
  return baseValue * scaleModifier;
}

/**
 * Calculate multiple alert font sizes at once
 * Convenience function for alerts.html pattern
 *
 * @returns {{titleSize: number, metaSize: number, messageSize: number}}
 *
 * @example
 * const { titleSize, metaSize, messageSize } = calculateAlertFontSizes();
 */
export function calculateAlertFontSizes() {
  // Base font sizes as percentages of viewport height
  // Title: 1.5% of height (small, uppercase label)
  // Meta: 2.2% of height (main content, largest)
  // Message: 1.5% of height (secondary content)
  // Scaled for visibility at 4K (2160px) and 1080p
  const titleSize = calculateResponsiveFontSizeRounded(0.015, 12, 35);
  const metaSize = calculateResponsiveFontSizeRounded(0.022, 18, 48);
  const messageSize = calculateResponsiveFontSizeRounded(0.015, 12, 35);

  return { titleSize, metaSize, messageSize };
}

/**
 * Calculate danmaku base font size
 * Convenience function for danmaku.html pattern
 *
 * @returns {number} Base font size for danmaku messages
 *
 * @example
 * const baseFontSize = calculateDanmakuBaseFontSize();
 * const scaledSize = applyScaleModifier(baseFontSize, scaleModifier);
 */
export function calculateDanmakuBaseFontSize() {
  // Auto-scaling: 3.5% of viewport height
  // Clamped between 24px and 100px for safety
  return calculateResponsiveFontSize(0.035, 24, 100);
}
