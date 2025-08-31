// sw5e-helper-starter/scripts/api.js
import { MODULE_ID, getSetting, isDebugEnabled } from '../presets/setting.js';

/**
 * SW5E QoL API - Main interface for module functionality
 */
export const API = {
    /**
     * Simple ping function for testing
     * @returns {string} "ok" if module is working
     */
    ping() { 
        return "ok"; 
    },

    /**
     * Get localized string with module prefix
     * @param {string} key - Localization key
     * @param {Object} [data] - Data for string interpolation
     * @returns {string} Localized string
     */
    localize(key, data = {}) {
        const fullKey = `${MODULE_ID}.${key}`;
        return game.i18n.localize(fullKey, data);
    },

    /**
     * Format localized string with data interpolation
     * @param {string} key - Localization key
     * @param {Object} data - Data for string interpolation
     * @returns {string} Formatted localized string
     */
    format(key, data = {}) {
        const fullKey = `${MODULE_ID}.${key}`;
        return game.i18n.format(fullKey, data);
    },

    /**
     * Check if a localization key exists
     * @param {string} key - Localization key
     * @returns {boolean} Whether the key exists
     */
    hasLocalization(key) {
        const fullKey = `${MODULE_ID}.${key}`;
        return game.i18n.has(fullKey);
    },

    /**
     * Get module setting value
     * @param {string} key - Setting key
     * @param {*} fallback - Fallback value
     * @returns {*} Setting value
     */
    getSetting(key, fallback = null) {
        return getSetting(key, fallback);
    },

    /**
     * Check if debug logging is enabled for a level
     * @param {string} level - Debug level to check
     * @returns {boolean} Whether logging is enabled
     */
    isDebugEnabled(level = 'info') {
        return isDebugEnabled(level);
    },

    /**
     * Open a minimal dialog with a single OK button.
     * @param {Object} [opts]
     * @param {string} [opts.title]   - Override dialog title
     * @param {string} [opts.content] - Override HTML body
     * @returns {Promise<boolean>} resolves true on OK, false on close
     */
    async openDialog(opts = {}) {
        const token = canvas?.tokens?.controlled?.[0];
        if (!token) {
            ui.notifications.warn(this.localize("warn.selectAToken"));
            return false;
        }
        
        const title = opts.title ?? this.localize("dialogs.attack.title");
        const content = opts.content ?? `<p>${this.localize("dialogs.attack.modifiers")}</p>`;
        
        return new Promise((resolve) => {
            const dlg = new Dialog({
                title,
                content,
                buttons: {
                    ok: {
                        label: this.localize("dialogs.attack.roll"),
                        callback: () => resolve(true)
                    }
                },
                default: "ok",
                close: () => resolve(false)
            }, { jQuery: true });
            dlg.render(true);
        });
    },

    /**
     * Create a notification with proper localization
     * @param {string} message - Localization key for message
     * @param {string} type - Notification type (info, warning, error)
     * @param {Object} [data] - Data for message interpolation
     */
    notify(message, type = 'info', data = {}) {
        const localizedMessage = this.localize(message, data);
        ui.notifications[type](localizedMessage);
    },

    /**
     * Log debug information based on module settings
     * @param {string} level - Log level (debug, info, warning, error)
     * @param {string} message - Message to log
     * @param {*} [data] - Additional data to log
     */
    log(level, message, data = null) {
        if (!this.isDebugEnabled(level)) return;
        
        const prefix = `[${MODULE_ID}]`;
        const logData = data ? [prefix, message, data] : [prefix, message];
        
        switch (level) {
            case 'debug':
                console.debug(...logData);
                break;
            case 'info':
                console.info(...logData);
                break;
            case 'warning':
                console.warn(...logData);
                break;
            case 'error':
                console.error(...logData);
                break;
            default:
                console.log(...logData);
        }
    }
};
