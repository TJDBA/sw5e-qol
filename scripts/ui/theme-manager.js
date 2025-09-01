import { API } from '../api.js';

/**
 * Theme Manager for SW5E QoL Module
 * Handles dynamic theme loading and switching
 */
export class ThemeManager {
    constructor() {
        this.currentTheme = 'bendu';
        this.availableThemes = ['bendu', 'light', 'dark','tech'];
        this.themeLinkElement = null;
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
