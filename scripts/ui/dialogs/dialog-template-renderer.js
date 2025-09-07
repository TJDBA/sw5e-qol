import { DialogLogger } from './dialog-logger.js';

/**
 * Dialog Template Renderer
 * Handles template rendering and dynamic section assembly
 */
export class DialogTemplateRenderer {
    constructor() {
        this.sectionTemplates = new Map();
        this.initialized = false;
        this.logThisFile = false;
        this.init();
    }

    /**
     * Initialize the renderer
     */
    async init() {
        if (this.logThisFile) DialogLogger.log('debug', 'Initializing dialog template renderer');
        
        try {
            await this.loadSectionTemplates();
            this.initialized = true;
            if (this.logThisFile) DialogLogger.log('debug', 'Dialog template renderer initialized successfully');
        } catch (error) {
            DialogLogger.log('error', 'Failed to initialize renderer', error);
        }
    }

    /**
     * Load all section templates
     */
    async loadSectionTemplates() {
        if (this.logThisFile) DialogLogger.log('debug', 'Loading section templates');
        
        try {
            const sections = [
                'item-selection',
                'modifiers-table',
                'add-modifier-inputs',
                'features',
                'advantage-radio',
                'roll-mode-dropdown',
                'roll-button'
            ];

            for (const section of sections) {
                const template = await this.loadTemplate(section);
                if (this.logThisFile) DialogLogger.log('debug', `Loaded template for ${section}: ${template}`);
                this.sectionTemplates.set(section, template);
            }
            
            if (this.logThisFile) DialogLogger.log('debug', `Loaded ${this.sectionTemplates.size} section templates`);
        } catch (error) {
            DialogLogger.log('error', 'Failed to load section templates', error);
        }
    }

    /**
     * Load a template by name
     * @param {string} templateName - Name of the template to load
     * @returns {string} Template path
     */
    async loadTemplate(templateName) {
        if (this.logThisFile) DialogLogger.log('debug', `Loading template: ${templateName}`);
        
        try {
            // Special handling for features section
            if (templateName === 'features') {
                if (this.logThisFile) DialogLogger.log('debug', 'Features section - returning null for dynamic rendering');
                return null; // Features are rendered dynamically
            }
            
            // Return the template path, not the rendered HTML
            // Note: templates are in the dialogs subdirectory
            const templatePath = `modules/sw5e-qol/templates/dialogs/${templateName}.hbs`;
            if (this.logThisFile) DialogLogger.log('debug', `Template path: ${templatePath}`);
            return templatePath;
        } catch (error) {
            DialogLogger.log('error', `Failed to load template: ${templateName}`, error);
            return '';
        }
    }

    /**
     * Render the base dialog with sections
     * @param {Object} dialogData - Dialog data for rendering
     * @returns {Promise<string>} Rendered dialog HTML
     */
    async renderDialog(dialogData) {
        if (this.logThisFile) DialogLogger.log('debug', 'Rendering dialog with data:', dialogData);
        
        try {
            // Wait for initialization to complete
            if (!this.initialized) {
                if (this.logThisFile) DialogLogger.log('debug', 'Renderer not initialized, initializing now');
                await this.init();
            }
            
            // Check if FoundryVTT templates are available
            if (typeof renderTemplate === 'undefined') {
                throw new Error('FoundryVTT templates not ready. Please wait for the game to fully load.');
            }
            
            // Render base dialog
            const baseTemplate = await this.loadTemplate('generic-roll-base');
            if (this.logThisFile) DialogLogger.log('debug', 'Base template path:', baseTemplate);
            const baseHtml = await renderTemplate(baseTemplate, dialogData);
            
            // Create temporary container to parse HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = baseHtml;
            
            // Get dialog body for section insertion
            const dialogBody = tempDiv.querySelector('#dialog-body');
            if (!dialogBody) {
                throw new Error('Dialog body not found in template');
            }

            if (this.logThisFile) DialogLogger.log('debug', 'Dialog body found, inserting sections');

            // Insert sections based on dialog type
            await this.insertSections(dialogBody, dialogData);

            if (this.logThisFile) DialogLogger.log('debug', 'Dialog rendering completed successfully');
            return tempDiv.innerHTML;

        } catch (error) {
            DialogLogger.log('error', 'Failed to render dialog', error);
            throw error;
        }
    }

    /**
     * Insert sections into dialog body based on dialog type
     * @param {HTMLElement} dialogBody - Dialog body element
     * @param {Object} dialogData - Dialog data
     */
    async insertSections(dialogBody, dialogData) {
        if (this.logThisFile) DialogLogger.log('debug', 'Inserting sections into dialog body');
        
        try {
            const sections = this.getSectionOrder(dialogData.type);
            if (this.logThisFile) DialogLogger.log('debug', `Section order for ${dialogData.type}:`, sections);
            
            for (const sectionName of sections) {
                // Special handling for features section
                if (sectionName === 'features') {
                    if (this.logThisFile) DialogLogger.log('debug', 'Rendering features section');
                    const featuresHtml = await this.renderFeaturesSection(dialogData);
                    if (featuresHtml) {
                        if (dialogBody.children.length > 0) {
                            dialogBody.appendChild(this.createDivider());
                        }
                        dialogBody.insertAdjacentHTML('beforeend', featuresHtml);
                    }
                    continue;
                }

                const template = this.sectionTemplates.get(sectionName);
                if (!template) {
                    if (this.logThisFile) DialogLogger.log('warning', `Section template not found: ${sectionName}`);
                    continue;
                }

                // Prepare section data
                if (this.logThisFile) DialogLogger.log('debug', `Preparing section data for ${sectionName}`);
                const sectionData = await this.prepareSectionData(sectionName, dialogData);
                
                // Check if FoundryVTT templates are available
                if (typeof renderTemplate === 'undefined') {
                    throw new Error('FoundryVTT templates not ready. Please wait for the game to fully load.');
                }
                
                // Render section
                if (this.logThisFile) DialogLogger.log('debug', `Rendering section ${sectionName} with data:`, sectionData);
                const sectionHtml = await renderTemplate(template, sectionData);
                
                // Insert section with divider
                if (dialogBody.children.length > 0) {
                    dialogBody.appendChild(this.createDivider());
                }
                dialogBody.insertAdjacentHTML('beforeend', sectionHtml);
            }

            if (this.logThisFile) DialogLogger.log('debug', 'All sections inserted successfully');

        } catch (error) {
            DialogLogger.log('error', 'Failed to insert sections', error);
            throw error;
        }
    }

    /**
     * Get section order based on dialog type
     * @param {string} dialogType - Type of dialog
     * @returns {Array} Array of section names in order
     */
    getSectionOrder(dialogType) {
        if (this.logThisFile) DialogLogger.log('debug', `Getting section order for dialog type: ${dialogType}`);
        
        switch (dialogType.toLowerCase()) {
            case 'attack':
                return [
                    'item-selection',
                    'modifiers-table',
                    'add-modifier-inputs',
                    'features',
                    'advantage-radio',
                    'roll-mode-dropdown',
                    'roll-button'
                ];
            case 'skill':
                return [
                    'modifiers-table',
                    'add-modifier-inputs',
                    'features',
                    'advantage-radio',
                    'roll-mode-dropdown',
                    'roll-button'
                ];
            case 'save':
                return [
                    'modifiers-table',
                    'add-modifier-inputs',
                    'features',
                    'advantage-radio',
                    'roll-mode-dropdown',
                    'roll-button'
                ];
            case 'damage':
                return [
                    'item-selection',
                    'modifiers-table',
                    'add-modifier-inputs',
                    'features',
                    'roll-mode-dropdown',
                    'roll-button'
                ];
            default:
                throw new Error(`Invalid dialog type: ${dialogType}`);
        }
    }

    /**
     * Prepare section-specific data
     * @param {string} sectionName - Name of the section
     * @param {Object} dialogData - Dialog data
     * @returns {Object} Section-specific data
     */
    async prepareSectionData(sectionName, dialogData) {
        if (this.logThisFile) DialogLogger.log('debug', `Preparing section data for ${sectionName}`);
        
        const baseData = {
            modifiers: dialogData.modifiers || [],
            modifierTypes: this.getModifierTypes(dialogData.type)
        };
        
        // This is a simplified version - the full implementation would be in dialog-section-data-preparer
        // For now, return base data
        return baseData;
    }

    /**
     * Get modifier types based on dialog type
     * @param {string} dialogType - Type of dialog
     * @returns {Array} Array of modifier types
     */
    getModifierTypes(dialogType) {
        if (this.logThisFile) DialogLogger.log('debug', `Getting modifier types for dialog type: ${dialogType}`);
        
        switch (dialogType.toLowerCase()) {
            case 'attack':
            case 'skill':
            case 'save':
                return ['Item', 'Force', 'Tech', 'Untyped'];
            case 'damage':
                return ['kinetic','energy','ion','acid','cold','fire','force','lightning','necrotic','poison','psychic','sonic','true'];
            default:
                return ['Untyped'];
        }
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
            const availableFeatures = dialogData.availableFeatures || [];
            
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
     * Create a horizontal divider
     * @returns {HTMLElement} Divider element
     */
    createDivider() {
        if (this.logThisFile) DialogLogger.log('debug', 'Creating section divider');
        
        const divider = document.createElement('hr');
        divider.className = 'section-divider';
        return divider;
    }

    /**
     * Check if renderer is initialized
     * @returns {boolean} True if initialized
     */
    isInitialized() {
        return this.initialized;
    }

    /**
     * Get loaded template count
     * @returns {number} Number of loaded templates
     */
    getTemplateCount() {
        return this.sectionTemplates.size;
    }

    /**
     * Get available section names
     * @returns {Array} Array of section names
     */
    getAvailableSections() {
        return Array.from(this.sectionTemplates.keys());
    }
}
