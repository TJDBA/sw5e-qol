import { API } from '../api.js';
import { getDataPaths } from '../core/utils/reference/data-lookup.js';
import { multiclassImproveCheck } from './feature-manager.js';

/**
 * Base Feature Class
 * Provides shared functionality for all feature packs
 */
export class BaseFeature {
    constructor(config) {
        // Basic metadata
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        
        // Feature configuration
        this.affects = config.affects || [];
        this.section = config.section || "features";
        this.isReactive = config.isReactive || false;
        this.isActive = config.isActive || true;
        
        // Injection type per dialog type
        this.injectionType = config.injectionType || {
            "attack": "simple",
            "damage": "html", 
            "save": "simple"
        };
    }

    /**
     * HTML template function - returns HTML string for dialog injection
     * Override this method in individual features
     */
    htmlTemplate(obj) {
        const { actor, dialogType, themeName, featureData } = obj;
        
        try {
            // Default implementation - simple checkbox
            return this.renderDefaultHTML(themeName, featureData);
        } catch (error) {
            API.log('error', `Failed to render HTML for feature ${this.name}:`, error);
            return this.renderErrorHTML(themeName, error);
        }
    }

    /**
     * Validation function - checks if feature can be used
     * Override this method in individual features
     */
    validationLogic(obj) {
        const { actor, dialogType, featureData } = obj;
        
        try {
            // Default validation - always true
            return this.validateDefault(actor, featureData);
        } catch (error) {
            API.log('error', `Validation error for feature ${this.name}:`, error);
            return `Validation error: ${error.message}`;
        }
    }

    /**
     * Roll modifiers function - returns array of modifiers to add
     * Override this method in individual features
     */
    rollModifiers(obj) {
        const { actor, dialogType, dialogState, featureData } = obj;
        
        try {
            // Default implementation - no modifiers
            return this.getDefaultModifiers(actor, dialogState, featureData);
        } catch (error) {
            API.log('error', `Failed to get roll modifiers for ${this.name}:`, error);
            return [];
        }
    }

    /**
     * Collect feature state from dialog form
     * Override this method in individual features
     */
    collectState(dialogElement) {
        try {
            // Default implementation - collect checkbox state
            const checkbox = dialogElement.querySelector(`input[name="feature-${this.id}"]`);
            return {
                enabled: checkbox ? checkbox.checked : false
            };
        } catch (error) {
            API.log('error', `Failed to collect state for feature ${this.name}:`, error);
            return { enabled: false };
        }
    }

    // ===== SHARED HELPER METHODS =====

    /**
     * Render error HTML for failed features
     */
    renderErrorHTML(themeName, error) {
        return `
            <div class="feature-component feature-error" style="
                background: var(--dialog-bg, #ffffff);
                color: var(--dialog-text, #000000);
                border: 1px solid var(--${themeName}-warning, #cc9966);
                padding: 8px;
                margin: 4px 0;
                border-radius: 4px;
            ">
                <div style="color: var(--${themeName}-warning, #cc9966); font-weight: bold;">
                    Component Failed to Render
                </div>
                <div style="font-size: 0.9em; color: var(--${themeName}-text-muted, #888888);">
                    ${this.name} - Check console for details
                </div>
            </div>
        `;
    }

    /**
     * Get theme variables for consistent styling
     */
    getThemeVariables(themeName) {
        return {
            bg: `var(--dialog-bg, #ffffff)`,
            text: `var(--dialog-text, #000000)`,
            border: `var(--${themeName}-border-light, #888888)`,
            muted: `var(--${themeName}-text-muted, #888888)`,
            warning: `var(--${themeName}-warning, #cc9966)`,
            accent: `var(--${themeName}-accent, #999999)`
        };
    }

    /**
     * Render default HTML - simple checkbox feature
     * Matches modifiers table styling
     */
    renderDefaultHTML(themeName, featureData = {}) {
        const theme = this.getThemeVariables(themeName);
        const checked = featureData.enabled ? 'checked' : '';
        
        return `
            <div class="feature-component" style="
                background: ${theme.bg};
                color: ${theme.text};
                border: 1px solid ${theme.border};
                padding: 8px;
                margin: 4px 0;
                border-radius: 4px;
            ">
                <table class="modifiers-table" style="width: 100%; border-collapse: collapse;">
                    <tbody>
                        <tr class="modifier-row feature-row" data-feature-id="${this.id}">
                            <td style="padding: 4px 8px; border: none;">
                                <span class="feature-name" 
                                      title="${this.description}"
                                      style="cursor: help; text-decoration: underline; text-decoration-style: dotted;">
                                    ${this.name}
                                </span>
                            </td>
                            <td style="padding: 4px 8px; border: none; color: ${theme.muted}; font-size: 0.9em;">
                                -
                            </td>
                            <td style="padding: 4px 8px; border: none; color: ${theme.muted}; font-size: 0.9em;">
                                ${this.getModifierDisplay()}
                            </td>
                            <td style="padding: 4px 8px; border: none; text-align: right;">
                                <div class="toggle-switch">
                                    <input type="checkbox" 
                                           class="modifier-toggle" 
                                           name="feature-${this.id}" 
                                           value="1" 
                                           ${checked} 
                                           data-feature-id="${this.id}">
                                    <span class="toggle-slider"></span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Default validation - always true
     */
    validateDefault(actor, featureData) {
        return true;
    }

    /**
     * Default modifiers - empty array
     */
    getDefaultModifiers(actor, dialogState, featureData) {
        return [];
    }

    /**
     * Check if feature affects a specific dialog type
     */
    affectsDialogType(dialogType) {
        return this.affects.includes(dialogType);
    }

    /**
     * Get injection type for dialog type
     */
    getInjectionType(dialogType) {
        return this.injectionType[dialogType] || "simple";
    }

    /**
     * Create a simple modifier object
     */
    createModifier(name, type, modifier, isEnabled = true, isDice = false) {
        return {
            name: name,
            type: type,
            modifier: modifier,
            isEnabled: isEnabled,
            isDice: isDice
        };
    }

    /**
     * Render generic resource feature HTML
     * For simple yes/no features with resource costs
     * Matches modifiers table styling
     */
    renderResourceFeatureHTML(themeName, featureData = {}, resourceName = "Force Points", resourceCost = 1) {
        const theme = this.getThemeVariables(themeName);
        const checked = featureData.enabled ? 'checked' : '';
        
        return `
            <div class="feature-component resource-feature" style="
                background: ${theme.bg};
                color: ${theme.text};
                border: 1px solid ${theme.border};
                padding: 8px;
                margin: 4px 0;
                border-radius: 4px;
            ">
                <table class="modifiers-table" style="width: 100%; border-collapse: collapse;">
                    <tbody>
                        <tr class="modifier-row feature-row" data-feature-id="${this.id}">
                            <td style="padding: 4px 8px; border: none;">
                                <span class="feature-name" 
                                      title="${this.description}"
                                      style="cursor: help; text-decoration: underline; text-decoration-style: dotted;">
                                    ${this.name}
                                </span>
                            </td>
                            <td style="padding: 4px 8px; border: none; color: ${theme.accent}; font-size: 0.9em;">
                                ${resourceCost} ${resourceName}
                            </td>
                            <td style="padding: 4px 8px; border: none; color: ${theme.muted}; font-size: 0.9em;">
                                ${this.getModifierDisplay()}
                            </td>
                            <td style="padding: 4px 8px; border: none; text-align: right;">
                                <div class="toggle-switch">
                                    <input type="checkbox" 
                                           class="modifier-toggle" 
                                           name="feature-${this.id}" 
                                           value="1" 
                                           ${checked} 
                                           data-feature-id="${this.id}">
                                    <span class="toggle-slider"></span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Get modifier display text for the feature
     * Override in subclasses for custom display
     */
    getModifierDisplay() {
        return this.description;
    }

    /**
     * Check if character has Multiclass Improvement feat and return level adjustment
     * 
     * This method can be used by any feature that extends BaseFeature to check for
     * multiclass improvement level adjustments. It returns the level of the highest
     * eligible class (level > 3, excluding the passed-in class), with array order
     * as tie-breaker for classes with the same level.
     * 
     * @param {Object} actor - The actor object
     * @param {string} className - The class name to exclude from the calculation
     * @returns {number} Level adjustment from the next highest class, or 0 if not applicable
     * 
     * @example
     * // In any feature class that extends BaseFeature:
     * const levelAdjustment = this.checkMulticlassImprovement(actor, "Sentinel");
     * if (levelAdjustment > 0) {
     *     // Use the level adjustment for calculations
     *     const effectiveLevel = baseLevel + levelAdjustment;
     * }
     */
    checkMulticlassImprovement(actor, className) {
        return multiclassImproveCheck(actor, className);
    }
}
