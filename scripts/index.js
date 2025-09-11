/**
 * Main module exports
 * Location: scripts/index.js
 */

// Export API and settings
export { API } from './api.js';
export { MODULE_ID, getSetting, isDebugEnabled } from './presets/setting.js';

// Export core functionality
export * from './core/index.js';

// Export UI functionality
export * from './ui/index.js';

// Export integrations
export * from './integrations/index.js';