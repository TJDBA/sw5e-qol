/**
 * Dialog Logger
 * Simple logging utility for dialog modules to avoid circular dependencies
 */

export const DialogLogger = {
    /**
     * Log a message with the specified level
     * @param {string} level - Log level (debug, info, warning, error)
     * @param {string} message - Log message
     * @param {...any} args - Additional arguments
     */
    log(level, message, ...args) {
        if (level === 'error') {
            console.error(`[Dialog] ${message}`, ...args);
        } else if (level === 'warning') {
            console.warn(`[Dialog] ${message}`, ...args);
        } else if (level === 'info') {
            console.info(`[Dialog] ${message}`, ...args);
        } else {
            console.log(`[Dialog] ${message}`, ...args);
        }
    },

    /**
     * Debug log (only if debug is enabled)
     * @param {string} message - Log message
     * @param {...any} args - Additional arguments
     */
    debug(message, ...args) {
        this.log('debug', message, ...args);
    },

    /**
     * Info log
     * @param {string} message - Log message
     * @param {...any} args - Additional arguments
     */
    info(message, ...args) {
        this.log('info', message, ...args);
    },

    /**
     * Warning log
     * @param {string} message - Log message
     * @param {...any} args - Additional arguments
     */
    warning(message, ...args) {
        this.log('warning', message, ...args);
    },

    /**
     * Error log
     * @param {string} message - Log message
     * @param {...any} args - Additional arguments
     */
    error(message, ...args) {
        this.log('error', message, ...args);
    }
};
