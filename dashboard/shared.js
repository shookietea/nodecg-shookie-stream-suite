/**
 * Shared utilities for dashboard panels
 * Provides reusable functions for settings management
 * Reduces code duplication across dashboard panels
 */

// ============================================================================
// Constants
// ============================================================================

const DEBOUNCE_MS = 500; // Default debounce delay for auto-save

// ============================================================================
// Auto-Save Utilities
// ============================================================================

/**
 * Creates an auto-save function with debouncing
 * @param {NodeCG.Replicant} replicant - Settings replicant
 * @param {string} key - Settings key to update (e.g., 'danmaku', 'alerts')
 * @param {number} [debounceMs=500] - Debounce delay in milliseconds
 * @returns {Function} Auto-save function that takes a value getter
 *
 * @example
 * const autoSave = createAutoSave(settingsRep, 'danmaku');
 * document.getElementById('speed').addEventListener('input', () => {
 *   autoSave(() => ({
 *     speedMult: parseFloat(document.getElementById('speed').value)
 *   }));
 * });
 */
function createAutoSave(replicant, key, debounceMs = DEBOUNCE_MS) {
  let timeout;

  return function (getValues) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const current = replicant.value || {};
      const newValues = typeof getValues === 'function' ? getValues() : getValues;

      replicant.value = {
        ...current,
        [key]: {
          ...(current[key] || {}),
          ...newValues
        }
      };
    }, debounceMs);
  };
}

/**
 * Creates an immediate save function (no debouncing)
 * Useful for checkboxes and select dropdowns
 * @param {NodeCG.Replicant} replicant - Settings replicant
 * @param {string} key - Settings key to update
 * @returns {Function} Save function that takes a value getter
 */
function createImmediateSave(replicant, key) {
  return function (getValues) {
    const current = replicant.value || {};
    const newValues = typeof getValues === 'function' ? getValues() : getValues;

    replicant.value = {
      ...current,
      [key]: {
        ...(current[key] || {}),
        ...newValues
      }
    };
  };
}

// ============================================================================
// Settings Loading Utilities
// ============================================================================

/**
 * Creates a settings loader that updates DOM when replicant changes
 * @param {NodeCG.Replicant} replicant - Settings replicant
 * @param {string} key - Settings key to load
 * @param {Function} callback - Callback function to update DOM
 *
 * @example
 * createSettingsLoader(settingsRep, 'danmaku', (settings) => {
 *   document.getElementById('speed').value = settings.speedMult || 1.0;
 *   document.getElementById('show-badges').checked = settings.showBadges || false;
 * });
 */
function createSettingsLoader(replicant, key, callback) {
  replicant.on('change', (newValue) => {
    if (!newValue) return;
    const settings = newValue[key];
    if (settings) {
      callback(settings);
    }
  });
}

/**
 * Helper function to update a DOM element's value
 * Handles different input types automatically
 * @param {string} id - Element ID
 * @param {any} value - Value to set
 * @param {any} [fallback] - Fallback value if value is undefined
 */
function updateElement(id, value, fallback) {
  const el = document.getElementById(id);
  if (!el) return;

  const finalValue = value !== undefined ? value : fallback;

  if (el.type === 'checkbox') {
    el.checked = Boolean(finalValue);
  } else if (el.type === 'number' || el.type === 'range') {
    el.value = Number(finalValue);
  } else {
    el.value = finalValue;
  }
}

/**
 * Helper function to get a DOM element's value
 * Handles different input types automatically
 * @param {string} id - Element ID
 * @returns {any} Element value (boolean for checkboxes, number for numbers, string otherwise)
 */
function getElementValue(id) {
  const el = document.getElementById(id);
  if (!el) return null;

  if (el.type === 'checkbox') {
    return el.checked;
  } else if (el.type === 'number' || el.type === 'range') {
    return parseFloat(el.value);
  } else {
    return el.value;
  }
}

// ============================================================================
// Slider Display Utilities
// ============================================================================

/**
 * Creates a slider value updater for live display
 * @param {string} sliderId - Slider input ID
 * @param {string} displayId - Display span ID
 * @param {Function} formatter - Formatter function (value => string)
 *
 * @example
 * createSliderUpdater('speed-slider', 'speed-value', (val) => `${val.toFixed(2)}x`);
 */
function createSliderUpdater(sliderId, displayId, formatter) {
  const slider = document.getElementById(sliderId);
  const display = document.getElementById(displayId);

  if (!slider || !display) return;

  slider.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    display.textContent = formatter(value);
  });

  // Initialize display
  const initialValue = parseFloat(slider.value);
  display.textContent = formatter(initialValue);
}

// ============================================================================
// Event Listener Helpers
// ============================================================================

/**
 * Adds event listeners to multiple elements
 * @param {string[]} ids - Array of element IDs
 * @param {string} event - Event name (e.g., 'input', 'change')
 * @param {Function} handler - Event handler
 */
function addListeners(ids, event, handler) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener(event, handler);
    }
  });
}

/**
 * Sets disabled state for multiple elements
 * Useful for batch-disabling controls based on feature toggles
 * @param {string[]} ids - Array of element IDs
 * @param {boolean} disabled - Disabled state to apply
 *
 * @example
 * // Disable all subscription-related buttons
 * DashboardUtils.setDisabledState(
 *   ['test-send-sub', 'test-send-resub', 'test-send-giftsub'],
 *   true
 * );
 */
function setDisabledState(ids, disabled) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.disabled = disabled;
    }
  });
}

// ============================================================================
// Credits Countdown Timer
// ============================================================================

/**
 * Creates a credits countdown timer manager
 * @param {string} countdownId - ID of countdown display element
 * @param {string} statusId - ID of status message element
 * @param {string} creditsType - Type of credits ('real' or 'test')
 * @returns {Object} Countdown timer controller with start/stop methods
 *
 * @example
 * const countdown = DashboardUtils.createCreditsCountdown('credits-countdown', 'countdown-status', 'real');
 * countdown.start(30); // Start 30 second countdown
 * countdown.stop();    // Stop countdown
 */
function createCreditsCountdown(countdownId, statusId, creditsType) {
  let countdownInterval = null;
  let countdownStartTime = null;
  let countdownExpectedDuration = 0;

  function updateCountdownDisplay() {
    const elapsed = Date.now() - countdownStartTime;
    const remaining = countdownExpectedDuration - elapsed;
    const remainingSeconds = remaining / 1000;

    const countdownEl = document.getElementById(countdownId);
    const statusEl = document.getElementById(statusId);

    if (!countdownEl || !statusEl) return;

    if (remaining > 0) {
      countdownEl.textContent = remainingSeconds.toFixed(1) + 's';
      countdownEl.style.color = '#4fc3f7';
      statusEl.textContent = 'Running...';
      statusEl.style.color = '#4fc3f7';
    } else {
      countdownEl.textContent = remainingSeconds.toFixed(1) + 's';
      countdownEl.style.color = '#f44336';
      statusEl.textContent = 'Overtime (waiting for close)';
      statusEl.style.color = '#f44336';
    }
  }

  function start(durationSeconds) {
    // Clear any existing countdown
    stop();

    countdownStartTime = Date.now();
    countdownExpectedDuration = durationSeconds * 1000; // Convert to ms

    updateCountdownDisplay();

    countdownInterval = setInterval(() => {
      updateCountdownDisplay();
    }, 100); // Update every 100ms for smooth display
  }

  function stop() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }

    const countdownEl = document.getElementById(countdownId);
    const statusEl = document.getElementById(statusId);

    if (!countdownEl || !statusEl) return;

    countdownEl.textContent = '—';
    countdownEl.style.color = '';
    statusEl.textContent = 'Waiting...';
    statusEl.style.color = '#666';
  }

  function onHidden() {
    stop();
    const statusEl = document.getElementById(statusId);
    if (!statusEl) return;

    statusEl.textContent = 'Closed successfully';
    statusEl.style.color = '#4caf50';

    setTimeout(() => {
      statusEl.textContent = 'Waiting...';
      statusEl.style.color = '#666';
    }, 3000);
  }

  // Listen for credits:hidden events
  nodecg.listenFor('credits:hidden', (data) => {
    if (data?.which === creditsType) {
      onHidden();
    }
  });

  return {
    start,
    stop
  };
}

// ============================================================================
// Stat Box Toggles
// ============================================================================

/**
 * Initializes stat box toggles for hiding/showing sensitive data
 * Adds click handlers to toggle visibility with blur effect
 * Saves state to localStorage
 */
function initStatBoxToggles() {
  const statBoxes = document.querySelectorAll('[data-stat-toggle]');

  statBoxes.forEach(box => {
    const statId = box.dataset.statToggle;
    const storageKey = `dashboard-stat-${statId}`;

    // Create toggle icon
    const toggle = document.createElement('span');
    toggle.className = 'stat-box-toggle';
    toggle.innerHTML = '👁️'; // Eye emoji
    toggle.title = 'Click to hide/show';
    box.appendChild(toggle);

    // Load hidden state from localStorage
    const isHidden = localStorage.getItem(storageKey) === 'true';
    if (isHidden) {
      box.classList.add('hidden');
    }

    // Toggle on icon click
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const nowHidden = box.classList.toggle('hidden');
      localStorage.setItem(storageKey, nowHidden);
    });

    // Also toggle when clicking the blurred value
    const valueEl = box.querySelector('.stat-value');
    if (valueEl) {
      valueEl.addEventListener('click', () => {
        if (box.classList.contains('hidden')) {
          box.classList.remove('hidden');
          localStorage.setItem(storageKey, 'false');
        }
      });
    }
  });
}

// ============================================================================
// Collapsible Sections
// ============================================================================

/**
 * Initializes collapsible sections
 * Adds click handlers to section headers with data-collapsible attribute
 *
 * @example HTML:
 * <div class="section collapsible" data-collapsible>
 *   <h3 class="section-header">
 *     <span class="section-title">Display Settings</span>
 *     <span class="section-toggle">▼</span>
 *   </h3>
 *   <div class="section-content">
 *     <!-- settings here -->
 *   </div>
 * </div>
 */
function initCollapsibleSections() {
  const sections = document.querySelectorAll('[data-collapsible]');

  sections.forEach(section => {
    const header = section.querySelector('.section-header');
    const content = section.querySelector('.section-content');
    const toggle = section.querySelector('.section-toggle');

    if (!header || !content) return;

    // Load collapsed state from localStorage
    const sectionId = section.id || section.querySelector('.section-title')?.textContent;
    const storageKey = `dashboard-section-${sectionId}`;
    const isCollapsed = localStorage.getItem(storageKey) === 'true';

    if (isCollapsed) {
      section.classList.add('collapsed');
      if (toggle) toggle.textContent = '▶';
    }

    header.style.cursor = 'pointer';
    header.addEventListener('click', () => {
      const nowCollapsed = section.classList.toggle('collapsed');
      if (toggle) {
        toggle.textContent = nowCollapsed ? '▶' : '▼';
      }
      // Save state to localStorage
      localStorage.setItem(storageKey, nowCollapsed);
    });
  });
}

// ============================================================================
// Exports
// ============================================================================

// Expose utilities globally for dashboard panels
window.DashboardUtils = {
  // Auto-save
  createAutoSave,
  createImmediateSave,

  // Settings loading
  createSettingsLoader,
  updateElement,
  getElementValue,

  // Slider utilities
  createSliderUpdater,

  // Event helpers
  addListeners,
  setDisabledState,

  // Credits countdown
  createCreditsCountdown,

  // Collapsible sections
  initCollapsibleSections,

  // Stat box toggles
  initStatBoxToggles,

  // Constants
  DEBOUNCE_MS
};
