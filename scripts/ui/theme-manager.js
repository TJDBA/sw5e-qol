import { API } from '../api.js';

/**
 * Theme Manager for SW5E QoL Module
 * Handles dynamic theme loading and switching
 */
export class ThemeManager {
    /**
     * Create a new ThemeManager instance
     */
    constructor() {
        this.currentTheme = 'bendu';
        this.originalTheme = 'bendu'; // Store original theme before any dialogs
        this.availableThemes = ['bendu', 'light', 'dark','tech'];
        this.themeLinkElement = null;
        this.activeDialogs = new Map(); // Track dialog-specific themes
        // Don't auto-initialize - wait for explicit init() call
    }

    /**
     * Initialize the theme manager
     */
    init() {
        try {
            this.createThemeLinkElement();
            this.loadTheme(this.currentTheme);
        } catch (error) {
            API.log('error', 'Theme manager init failed', error);
        }
    }

    /**
     * Create the theme link element if it doesn't exist
     */
    createThemeLinkElement() {
        try {
            // Check if theme link already exists
            this.themeLinkElement = document.getElementById('sw5e-qol-theme');
            
            if (!this.themeLinkElement) {
                // Create new theme link element
                this.themeLinkElement = document.createElement('link');
                this.themeLinkElement.id = 'sw5e-qol-theme';
                this.themeLinkElement.rel = 'stylesheet';
                this.themeLinkElement.type = 'text/css';
                
                // Add to document head
                document.head.appendChild(this.themeLinkElement);
            }
        } catch (error) {
            API.log('error', 'Failed to create theme link element', error);
        }
    }

    /**
     * Load a specific theme
     * @param {string} themeName - Name of the theme to load
     */
    loadTheme(themeName) {
        try {
            if (!this.availableThemes.includes(themeName)) {
                API.log('warning', `Invalid theme: ${themeName}. Defaulting to bendu.`);
                themeName = 'bendu';
            }

            this.currentTheme = themeName;
            // Map theme names to existing CSS files
            const themeFileMap = {
                'bendu': 'bendu_theme.css',
                'light': 'light_theme.css',
                'dark': 'dark_theme.css',
                'tech': 'tech_theme.css'
            };
            
            const themePath = `modules/sw5e-qol/styles/${themeFileMap[themeName]}`;
            
            if (this.themeLinkElement) {
                this.themeLinkElement.href = themePath;
                API.log('info', `Theme loaded: ${themeName} from ${themePath}`);
            }

        } catch (error) {
            API.log('error', `Failed to load theme: ${themeName}`, error);
            // Fallback to default theme
            this.loadTheme('bendu');
        }
    }

    /**
     * Get current theme
     * @returns {string} Current theme name
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Get available themes
     * @returns {Array} Array of available theme names
     */
    getAvailableThemes() {
        return [...this.availableThemes];
    }

    /**
     * Check if a theme is available
     * @param {string} themeName - Theme name to check
     * @returns {boolean} Whether the theme is available
     */
    isThemeAvailable(themeName) {
        return this.availableThemes.includes(themeName);
    }

    /**
     * Set theme based on dialog options or user preferences
     * @param {Object} options - Dialog options or theme preferences
     * @param {string} [options.theme] - Specific theme to use
     * @param {string} [options.type] - Dialog type (can influence theme choice)
     * @deprecated Use setThemeForDialog(dialogId, options) instead
     */
    setThemeForDialog(options = {}) {
        try {
            let themeToUse = 'bendu'; // Default

            // Priority 1: Explicit theme in options
            if (options.theme && this.isThemeAvailable(options.theme)) {
                themeToUse = options.theme;
            }
            // Priority 2: Theme based on dialog type (future enhancement)
            else if (options.type) {
                themeToUse = this.getThemeForDialogType(options.type);
            }
            // Priority 3: User preference (future enhancement)
            // else if (userPreference) {
            //     themeToUse = userPreference;
            // }

            this.loadTheme(themeToUse);
            return themeToUse;

        } catch (error) {
            API.log('error', 'Failed to set theme for dialog', error);
            return 'bendu';
        }
    }

    /**
     * Set theme for specific dialog without changing global theme
     * @param {string} dialogId - Unique identifier for the dialog
     * @param {Object} options - Dialog options or theme preferences
     * @param {string} [options.theme] - Specific theme to use
     * @param {string} [options.type] - Dialog type (can influence theme choice)
     * @returns {string} The theme that was applied
     */
    setThemeForDialog(dialogId, options = {}) {
        try {
            // Determine theme to use
            let themeToUse = this.determineTheme(options);
            
            // Store dialog-specific theme
            this.activeDialogs.set(dialogId, themeToUse);
            
            // If this is the first dialog, save original theme
            if (this.activeDialogs.size === 1) {
                this.originalTheme = this.currentTheme;
                API.log('debug', `Saved original theme: ${this.originalTheme}`);
            }
            
            API.log('debug', `Set theme ${themeToUse} for dialog ${dialogId}`);
            return themeToUse;

        } catch (error) {
            API.log('error', 'Failed to set theme for dialog', error);
            return 'bendu';
        }
    }

    /**
     * Determine which theme to use based on options
     * @param {Object} options - Dialog options
     * @returns {string} Theme name to use
     */
    determineTheme(options = {}) {
        // Priority 1: Explicit theme in options
        if (options.theme && this.isThemeAvailable(options.theme)) {
            return options.theme;
        }
        // Priority 2: Theme based on dialog type (future enhancement)
        else if (options.type) {
            return this.getThemeForDialogType(options.type);
        }
        // Priority 3: User preference (future enhancement)
        // else if (userPreference) {
        //     return userPreference;
        // }
        
        // Default
        return 'bendu';
    }

    /**
     * Apply theme to specific dialog element
     * @param {HTMLElement} dialogElement - The dialog element to theme
     * @param {string} themeName - Name of the theme to apply
     */
    applyThemeToDialog(dialogElement, themeName) {
        try {
            if (!dialogElement) {
                API.log('warning', 'No dialog element provided for theming');
                return;
            }

            // Remove any existing theme classes
            this.availableThemes.forEach(theme => {
                dialogElement.classList.remove(`theme-${theme}`);
            });

            // Add the new theme class
            dialogElement.classList.add(`theme-${themeName}`);
            
            // Apply theme-specific CSS variables to dialog
            this.applyThemeVariables(dialogElement, themeName);
            
            API.log('debug', `Applied theme ${themeName} to dialog element`);

        } catch (error) {
            API.log('error', 'Failed to apply theme to dialog', error);
        }
    }

    /**
     * Apply theme-specific CSS variables to dialog element
     * @param {HTMLElement} dialogElement - The dialog element
     * @param {string} themeName - Name of the theme
     */
    applyThemeVariables(dialogElement, themeName) {
        try {
            // This will be handled by CSS classes, but we could add custom properties here if needed
            // For now, the CSS classes will handle the theming
            API.log('debug', `Applied theme variables for ${themeName}`);
        } catch (error) {
            API.log('error', 'Failed to apply theme variables', error);
        }
    }

    /**
     * Remove theme for specific dialog and restore original if needed
     * @param {string} dialogId - Unique identifier for the dialog
     */
    removeDialogTheme(dialogId) {
        try {
            if (this.activeDialogs.has(dialogId)) {
                this.activeDialogs.delete(dialogId);
                API.log('debug', `Removed theme for dialog ${dialogId}`);
                
                // If no more dialogs, restore original theme
                if (this.activeDialogs.size === 0) {
                    this.loadTheme(this.originalTheme);
                    API.log('debug', `Restored original theme: ${this.originalTheme}`);
                }
            }
        } catch (error) {
            API.log('error', 'Failed to remove dialog theme', error);
        }
    }

    /**
     * Get appropriate theme for dialog type (future enhancement)
     * @param {string} dialogType - Type of dialog
     * @returns {string} Theme name
     */
    getThemeForDialogType(dialogType) {
        // Future enhancement: logic to choose theme based on dialog type
        // For now, return default
        return 'bendu';
    }

    /**
     * Reload current theme
     */
    reloadCurrentTheme() {
        try {
            this.loadTheme(this.currentTheme);
        } catch (error) {
            API.log('error', 'Failed to reload current theme', error);
        }
    }

    /**
     * Reset to default theme
     */
    resetToDefault() {
        try {
            this.loadTheme('bendu');
        } catch (error) {
            API.log('error', 'Failed to reset to default theme', error);
        }
    }
}

// Export singleton instance
export const themeManager = new ThemeManager();
