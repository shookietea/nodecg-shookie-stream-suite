/**
 * Shared Utility Functions
 * Common utilities used across all graphics overlays
 *
 * Provides centralized security and DOM manipulation functions
 * to ensure consistent behavior and easier security auditing.
 */

/**
 * Escape HTML special characters to prevent XSS attacks
 * Uses browser's built-in text node escaping for safety
 *
 * @param {string} text - Raw text that may contain HTML
 * @returns {string} HTML-safe string with special characters escaped
 *
 * @example
 * escapeHTML('<script>alert("xss")</script>')
 * // Returns: "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
 *
 * @example
 * // Safe user input rendering
 * const username = escapeHTML(userInput);
 * element.innerHTML = `<span>${username}</span>`;
 */
export function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Strip all HTML tags from a string
 * Leaves only plain text content
 *
 * @param {string} html - HTML string
 * @returns {string} Plain text with all tags removed
 *
 * @example
 * stripHTML('<b>Hello</b> <i>World</i>')
 * // Returns: "Hello World"
 *
 * @example
 * // Extract text from potentially malicious input
 * const safeText = stripHTML(untrustedHTML);
 */
export function stripHTML(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || '';
}

/**
 * Sanitize HTML by allowing only specific safe tags
 * More permissive than stripHTML but still secure
 *
 * @param {string} html - HTML string to sanitize
 * @param {string[]} allowedTags - Array of allowed tag names (lowercase)
 * @returns {string} Sanitized HTML with only allowed tags
 *
 * @example
 * sanitizeHTML('<b>Bold</b> <script>alert("xss")</script>', ['b', 'i', 'em', 'strong'])
 * // Returns: "<b>Bold</b> "
 *
 * @example
 * // Allow only basic formatting tags
 * const safe = sanitizeHTML(userHTML, ['b', 'i', 'em', 'strong', 'u']);
 */
export function sanitizeHTML(html, allowedTags = []) {
  const div = document.createElement('div');
  div.innerHTML = html;

  // Convert to lowercase for case-insensitive comparison
  const allowed = allowedTags.map(tag => tag.toLowerCase());

  // Remove disallowed tags recursively
  function removeDisallowedTags(node) {
    const nodesToRemove = [];

    for (const child of node.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const tagName = child.tagName.toLowerCase();
        if (!allowed.includes(tagName)) {
          // Keep content but remove tag
          nodesToRemove.push(child);
        } else {
          // Recursively check children
          removeDisallowedTags(child);
        }
      }
    }

    // Remove disallowed nodes (keeping their text content)
    for (const node of nodesToRemove) {
      while (node.firstChild) {
        node.parentNode.insertBefore(node.firstChild, node);
      }
      node.remove();
    }
  }

  removeDisallowedTags(div);
  return div.innerHTML;
}

/**
 * Create a text node safely (XSS-proof alternative to innerHTML)
 * Best practice for rendering user-generated text
 *
 * @param {string} text - Text content
 * @returns {Text} Text DOM node
 *
 * @example
 * // Safest way to render user input
 * const textNode = createTextNode(userInput);
 * element.appendChild(textNode);
 *
 * @example
 * // Build DOM with mixed content
 * const container = document.createElement('div');
 * container.appendChild(createTextNode('Username: '));
 * container.appendChild(createTextNode(username)); // Safe even if username contains HTML
 */
export function createTextNode(text) {
  return document.createTextNode(text);
}

/**
 * Validate URL to prevent javascript: protocol XSS
 * Only allows http, https, and data URLs
 *
 * @param {string} url - URL to validate
 * @param {boolean} allowData - Allow data: URLs (default: false)
 * @returns {boolean} True if URL is safe
 *
 * @example
 * isValidURL('https://example.com') // true
 * isValidURL('javascript:alert("xss")') // false
 * isValidURL('data:image/png;base64,...', true) // true
 */
export function isValidURL(url, allowData = false) {
  if (!url || typeof url !== 'string') return false;

  try {
    const parsed = new URL(url);
    const allowedProtocols = ['http:', 'https:'];
    if (allowData) {
      allowedProtocols.push('data:');
    }
    return allowedProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
}
