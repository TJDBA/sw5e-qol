/**
 * SW5E QoL Module Settings
 * Contains all static and default module-wide settings
 */

export const MODULE_ID = 'sw5e-qol';
export const MODULE_NAME = 'SW5E Quality of Life';

/**
 * Default module settings
 */
export const DEFAULT_SETTINGS = {
    
    // UI/UX settings
    'theme-preference': {
        name: 'Theme Preference',
        hint: 'Choose your preferred visual theme',
        scope: 'client',
        config: true,
        type: String,
        choices: {
            'auto': 'Auto (Follow System)',
            'light': 'Light Theme',
            'dark': 'Dark Theme',
            'bendu': 'Bendu Theme'
        },
        default: 'bendu'
    },
    
    'chat-card-style': {
        name: 'Chat Card Style',
        hint: 'Choose the style for enhanced chat cards',
        scope: 'world',
        config: true,
        type: String,
        choices: {
            'compact': 'Compact',
            'detailed': 'Detailed',
            'minimal': 'Minimal'
        },
        default: 'detailed'
    },
    
    // Debug settings
    'debug-level': {
        name: 'Debug Level',
        hint: 'Set the level of debug information to display',
        scope: 'client',
        config: true,
        type: String,
        choices: {
            'none': 'None',
            'error': 'Errors Only',
            'warning': 'Warnings and Errors',
            'info': 'Info, Warnings, and Errors',
            'debug': 'All Debug Information'
        },
        default: 'degug'
    },
    
    'log-to-console': {
        name: 'Log to Console',
        hint: 'Output debug information to browser console',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false
    }
};

/**
 * Setting categories for organization
 */
export const SETTING_CATEGORIES = {
    'interface': {
        name: 'Interface & Themes',
        settings: [
            'theme-preference',
            'chat-card-style'
        ]
    },
    'debug': {
        name: 'Debug & Development',
        settings: [
            'debug-level',
            'log-to-console'
        ]
    }
};

/**
 * Helper function to get a setting value
 * @param {string} key - The setting key
 * @param {*} fallback - Fallback value if setting doesn't exist
 * @returns {*} The setting value
 */
export function getSetting(key, fallback = null) {
    return game.settings.get(MODULE_ID, key) ?? fallback;
}

/**
 * Helper function to set a setting value
 * @param {string} key - The setting key
 * @param {*} value - The value to set
 * @returns {Promise} Promise that resolves when setting is saved
 */
export async function setSetting(key, value) {
    return await game.settings.set(MODULE_ID, key, value);
}

/**
 * Helper function to check if debug logging is enabled
 * @param {string} level - The debug level to check
 * @returns {boolean} Whether logging is enabled for this level
 */
export function isDebugEnabled(level = 'info') {
    const debugLevel = getSetting('debug-level', 'warning');
    const levels = ['none', 'error', 'warning', 'info', 'debug'];
    const currentLevel = levels.indexOf(debugLevel);
    const requestedLevel = levels.indexOf(level);
    
    return requestedLevel <= currentLevel;
}
