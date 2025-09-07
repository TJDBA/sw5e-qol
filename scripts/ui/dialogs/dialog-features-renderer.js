import { DialogLogger } from './dialog-logger.js';
import { featureManager } from '../../features/feature-manager.js';

/**
 * Dialog Features Renderer
 * Handles rendering of features section in dialogs
 */
export class DialogFeaturesRenderer {
    constructor() {
        this.logThisFile = false;
    }

    /**
     * Render the features section with collapsible functionality
     * @param {Object} dialogData - Dialog data
     * @returns {Promise<string>} Features section HTML
     */
    async renderFeaturesSection(dialogData) {
        if (this.logThisFile) DialogLogger.log('debug', 'Rendering features section');
        
        try {
            const { actor, type: dialogType, themeName, featureState, theme } = dialogData;
            
            // Get available features for this actor and dialog type
            const availableFeatures = featureManager.getAvailableFeatures(actor, dialogType);
            
            if (!availableFeatures || availableFeatures.length === 0) {
                if (this.logThisFile) DialogLogger.log('debug', 'No features to display');
                return ''; // No features to display
            }

            // Get theme name from dialog data or default to 'bendu'
            const appliedTheme = theme || themeName || 'bendu';
            
            if (this.logThisFile) DialogLogger.log('debug', `Rendering ${availableFeatures.length} features with theme: ${appliedTheme}`);
            
            let featuresHTML = `
                <div class="features-section" style="
                    margin: 8px 0;
                    border: 1px solid var(--${appliedTheme}-border-dark, #666666);
                    border-radius: 4px;
                    background: var(--${appliedTheme}-bg-secondary, #3a3a3a);
                ">
                    <div class="section-header" style="
                        display: flex;
                        align-items: center;
                        padding: 8px 12px;
                        background: var(--${appliedTheme}-bg-tertiary, #2a2a2a);
                        border: 1px solid var(--${appliedTheme}-border-light, #888888);
                        cursor: pointer;
                    " data-section="features">
                        <button type="button" class="section-toggle" style="
                            background: none;
                            border: none;
                            color: var(--${appliedTheme}-accent, #999999);
                            cursor: pointer;
                            padding: 4px;
                            font-size: 12px;
                            transition: transform 0.2s ease;
                            width: 5%;
                            display: flex;
                            justify-content: flex-start;
                        " data-target="features-content">
                            ▼
                        </button>
                        <h3 style="
                            margin: 0; 
                            color: var(--${appliedTheme}-accent, #999999); 
                            border-bottom: 1px solid var(--${appliedTheme}-border-light, #888888);
                            font-size: 1.1em;
                            font-weight: 600;
                            width: 90%;
                            text-align: center;
                        ">
                            Features
                        </h3>
                        <div style="width: 5%;"></div>
                    </div>
                    <div class="features-content" style="
                        display: block;
                        padding: 8px;
                    " data-section="features-content">
            `;

            // Loop through available features
            for (const feature of availableFeatures) {
                try {
                    // Get feature state from previous dialog or default
                    const featureData = featureState?.[feature.id] || {};
                    featureData.actor = actor; // Pass actor for level calculations

                    // Validate feature
                    const validation = feature.validationLogic({
                        actor: actor,
                        dialogType: dialogType,
                        featureData: featureData
                    });
                    
                    if (validation === true) {
                        // Render feature HTML (handle async)
                        const featureHTML = await feature.htmlTemplate({
                            actor: actor,
                            dialogType: dialogType,
                            themeName: appliedTheme,
                            featureData: featureData
                        });
                        featuresHTML += featureHTML;
                        if (this.logThisFile) DialogLogger.log('debug', `Rendered feature: ${feature.name}`);
                    } else {
                        // Feature validation failed, log and skip
                        if (this.logThisFile) DialogLogger.log('warning', `Feature ${feature.name} validation failed: ${validation}`);
                    }
                } catch (error) {
                    DialogLogger.log('error', `Error rendering feature ${feature.name}:`, error);
                }
            }

            featuresHTML += `
                    </div>
                </div>
            `;

            if (this.logThisFile) DialogLogger.log('debug', 'Features section rendered successfully');
            return featuresHTML;

        } catch (error) {
            DialogLogger.log('error', 'Failed to render features section', error);
            return '';
        }
    }

    /**
     * Render a single feature
     * @param {Object} feature - Feature object
     * @param {Object} dialogData - Dialog data
     * @returns {Promise<string>} Feature HTML
     */
    async renderFeature(feature, dialogData) {
        if (this.logThisFile) DialogLogger.log('debug', `Rendering single feature: ${feature.name}`);
        
        try {
            const { actor, type: dialogType, themeName, featureState, theme } = dialogData;
            
            // Get feature state from previous dialog or default
            const featureData = featureState?.[feature.id] || {};
            featureData.actor = actor; // Pass actor for level calculations

            // Validate feature
            const validation = feature.validationLogic({
                actor: actor,
                dialogType: dialogType,
                featureData: featureData
            });
            
            if (validation === true) {
                // Get theme name from dialog data or default to 'bendu'
                const appliedTheme = theme || themeName || 'bendu';
                
                // Render feature HTML (handle async)
                const featureHTML = await feature.htmlTemplate({
                    actor: actor,
                    dialogType: dialogType,
                    themeName: appliedTheme,
                    featureData: featureData
                });
                
                if (this.logThisFile) DialogLogger.log('debug', `Successfully rendered feature: ${feature.name}`);
                return featureHTML;
            } else {
                if (this.logThisFile) DialogLogger.log('warning', `Feature ${feature.name} validation failed: ${validation}`);
                return '';
            }
        } catch (error) {
            DialogLogger.log('error', `Error rendering feature ${feature.name}:`, error);
            return '';
        }
    }

    /**
     * Render features section header
     * @param {string} theme - Theme name
     * @returns {string} Header HTML
     */
    renderFeaturesHeader(theme = 'bendu') {
        if (this.logThisFile) DialogLogger.log('debug', `Rendering features header with theme: ${theme}`);
        
        return `
            <div class="section-header" style="
                display: flex;
                align-items: center;
                padding: 8px 12px;
                background: var(--${theme}-bg-tertiary, #2a2a2a);
                border: 1px solid var(--${theme}-border-light, #888888);
                cursor: pointer;
            " data-section="features">
                <button type="button" class="section-toggle" style="
                    background: none;
                    border: none;
                    color: var(--${theme}-accent, #999999);
                    cursor: pointer;
                    padding: 4px;
                    font-size: 12px;
                    transition: transform 0.2s ease;
                    width: 5%;
                    display: flex;
                    justify-content: flex-start;
                " data-target="features-content">
                    ▼
                </button>
                <h3 style="
                    margin: 0; 
                    color: var(--${theme}-accent, #999999); 
                    border-bottom: 1px solid var(--${theme}-border-light, #888888);
                    font-size: 1.1em;
                    font-weight: 600;
                    width: 90%;
                    text-align: center;
                ">
                    Features
                </h3>
                <div style="width: 5%;"></div>
            </div>
        `;
    }

    /**
     * Render features section content wrapper
     * @param {string} theme - Theme name
     * @returns {string} Content wrapper HTML
     */
    renderFeaturesContentWrapper(theme = 'bendu') {
        if (this.logThisFile) DialogLogger.log('debug', `Rendering features content wrapper with theme: ${theme}`);
        
        return `
            <div class="features-content" style="
                display: block;
                padding: 8px;
            " data-section="features-content">
        `;
    }

    /**
     * Render features section container
     * @param {string} theme - Theme name
     * @returns {string} Container HTML
     */
    renderFeaturesContainer(theme = 'bendu') {
        if (this.logThisFile) DialogLogger.log('debug', `Rendering features container with theme: ${theme}`);
        
        return `
            <div class="features-section" style="
                margin: 8px 0;
                border: 1px solid var(--${theme}-border-dark, #666666);
                border-radius: 4px;
                background: var(--${theme}-bg-secondary, #3a3a3a);
            ">
        `;
    }

    /**
     * Close features section container
     * @returns {string} Closing HTML
     */
    closeFeaturesContainer() {
        if (this.logThisFile) DialogLogger.log('debug', 'Closing features container');
        
        return `
            </div>
        `;
    }

    /**
     * Check if features should be rendered
     * @param {Object} dialogData - Dialog data
     * @returns {boolean} True if features should be rendered
     */
    shouldRenderFeatures(dialogData) {
        const { actor, type: dialogType } = dialogData;
        const availableFeatures = featureManager.getAvailableFeatures(actor, dialogType);
        const shouldRender = availableFeatures && availableFeatures.length > 0;
        
        if (this.logThisFile) DialogLogger.log('debug', `Should render features: ${shouldRender} (${availableFeatures?.length || 0} features available)`);
        return shouldRender;
    }

    /**
     * Get available features count
     * @param {Object} dialogData - Dialog data
     * @returns {number} Number of available features
     */
    getAvailableFeaturesCount(dialogData) {
        const { actor, type: dialogType } = dialogData;
        const availableFeatures = featureManager.getAvailableFeatures(actor, dialogType);
        const count = availableFeatures ? availableFeatures.length : 0;
        
        if (this.logThisFile) DialogLogger.log('debug', `Available features count: ${count}`);
        return count;
    }
}
