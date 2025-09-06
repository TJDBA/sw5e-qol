import { API } from '../../api.js';
import { featureManager } from '../../features/feature-manager.js';

/**
 * Generic Roll Dialog Renderer
 * Handles template rendering and dynamic section assembly
 */
export class GenericRollRenderer {
    constructor() {
        this.sectionTemplates = new Map();
        this.initialized = false;
        this.init();
    }

    /**
     * Initialize the renderer
     */
    async init() {
        try {
            await this.loadSectionTemplates();
            this.initialized = true;
        } catch (error) {
            API.log('error', 'Failed to initialize renderer', error);
        }
    }

    /**
     * Load all section templates
     */
    async loadSectionTemplates() {
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
                API.log('debug', `Loaded template for ${section}:`, template);
                this.sectionTemplates.set(section, template);
            }
        } catch (error) {
            API.log('error', 'Failed to load section templates', error);
        }
    }

    /**
     * Load a template by name
     */
    async loadTemplate(templateName) {
        try {
            // Special handling for features section
            if (templateName === 'features') {
                return null; // Features are rendered dynamically
            }
            
            // Return the template path, not the rendered HTML
            // Note: templates are in the dialogs subdirectory
            return `modules/sw5e-qol/templates/dialogs/${templateName}.hbs`;
        } catch (error) {
            API.log('error', `Failed to load template: ${templateName}`, error);
            return '';
        }
    }

    /**
     * Render the base dialog with sections
     */
    async renderDialog(dialogData) {
        try {
            // Wait for initialization to complete
            if (!this.initialized) {
                await this.init();
            }
            
            // Check if FoundryVTT templates are available
            if (typeof renderTemplate === 'undefined') {
                throw new Error('FoundryVTT templates not ready. Please wait for the game to fully load.');
            }
            
            // Render base dialog
            const baseTemplate = await this.loadTemplate('generic-roll-base');
            API.log('debug', 'Base template path:', baseTemplate);
            const baseHtml = await renderTemplate(baseTemplate, dialogData);
            
            // Create temporary container to parse HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = baseHtml;
            
            // Get dialog body for section insertion
            const dialogBody = tempDiv.querySelector('#dialog-body');
            if (!dialogBody) {
                throw new Error('Dialog body not found in template');
            }

            // Insert sections based on dialog type
            await this.insertSections(dialogBody, dialogData);

            return tempDiv.innerHTML;

        } catch (error) {
            API.log('error', 'Failed to render dialog', error);
            throw error;
        }
    }

    /**
     * Insert sections into dialog body based on dialog type
     */
    async insertSections(dialogBody, dialogData) {
        try {
            const sections = this.getSectionOrder(dialogData.type);
            
            for (const sectionName of sections) {
                // Special handling for features section
                if (sectionName === 'features') {
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
                    API.log('warning', `Section template not found: ${sectionName}`);
                    continue;
                }

                // Prepare section data
                const sectionData = this.prepareSectionData(sectionName, dialogData);
                
                // Check if FoundryVTT templates are available
                if (typeof renderTemplate === 'undefined') {
                    throw new Error('FoundryVTT templates not ready. Please wait for the game to fully load.');
                }
                
                // Render section
                const sectionHtml = await renderTemplate(template, sectionData);
                
                // Insert section with divider
                if (dialogBody.children.length > 0) {
                    dialogBody.appendChild(this.createDivider());
                }
                dialogBody.insertAdjacentHTML('beforeend', sectionHtml);
            }

        } catch (error) {
            API.log('error', 'Failed to insert sections', error);
            throw error;
        }
    }

    /**
     * Get section order based on dialog type
     */
    getSectionOrder(dialogType) {
        switch (dialogType.toLowerCase()) {
            case 'attack':
                return [
                    'item-selection',
                    //'save-attack',
                    'modifiers-table',
                    'add-modifier-inputs',
                    'features',
                    'advantage-radio',
                    'roll-mode-dropdown',
                    'roll-button'
                ];
            case 'skill':
                return [
                    //'skill-check',
                    'modifiers-table',
                    'add-modifier-inputs',
                    'features',
                    'advantage-radio',
                    'roll-mode-dropdown',
                    'roll-button'
                ];
            case 'save':
                return [
                    //'save-type',
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
     */
    prepareSectionData(sectionName, dialogData) {
        const baseData = {
            modifiers: dialogData.modifiers || [],
            modifierTypes: this.getModifierTypes(dialogData.type)
        };

        switch (sectionName) {
            case 'item-selection':
                return {
                    itemLabelKey: this.getItemLabelKey(dialogData.type),
                    items: this.getItemsForType(dialogData.type, dialogData),
                    presets: this.getPresetsForType(dialogData.type)
                };
            case 'modifiers-table':
                return baseData;
            case 'add-modifier-inputs':
                return baseData;
            case 'advantage-radio':
                return {};
            case 'roll-mode-dropdown':
                return {};
            case 'roll-button':
                return {};
            default:
                return baseData;
        }
    }

    /**
     * Get modifier types based on dialog type
     */
    getModifierTypes(dialogType) {
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
     * Get item label key based on dialog type
     */
    getItemLabelKey(dialogType) {
        switch (dialogType.toLowerCase()) {
            case 'attack':
                return 'SW5E-QOL.interface.weapon';
            case 'skill':
                return 'SW5E-QOL.interface.skill';
            case 'save':
                return 'SW5E-QOL.interface.save';
            case 'damage':
                return 'SW5E-QOL.interface.weapon';
            default:
                return 'SW5E-QOL.interface.item';
        }
    }

    /**
     * Get items for dialog type (placeholder - will be implemented later)
     */
    getItemsForType(dialogType, dialogData = {}) {
        try {
            // For now, return empty array for all dialog types
            // This can be extended later for specific functionality
            return [];
        } catch (error) {
            API.log('error', 'Failed to get items for dialog type', error);
            return [];
        }
    }

    /**
     * Get presets for dialog type (placeholder - will be implemented later)
     */
    getPresetsForType(dialogType) {
        // Placeholder - will be populated from saved presets
        return [];
    }

    /**
     * Render the features section with collapsible functionality
     */
    async renderFeaturesSection(dialogData) {
        try {
            const { actor, type: dialogType, themeName, featureState } = dialogData;
            
            // Get available features for this actor and dialog type
            const availableFeatures = featureManager.getAvailableFeatures(actor, dialogType);
            
            if (!availableFeatures || availableFeatures.length === 0) {
                return ''; // No features to display
            }

            // Get theme name from dialog data or default to 'bendu'
            const theme = themeName || 'bendu';
            
            let featuresHTML = `
                <div class="features-section" style="
                    margin: 8px 0;
                    border: 1px solid var(--${theme}-border, #666666);
                    border-radius: 4px;
                    background: var(--${theme}-bg-secondary, #3a3a3a);
                ">
                    <div class="section-header" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 8px 12px;
                        background: var(--${theme}-bg-tertiary, #2a2a2a);
                        border-bottom: 1px solid var(--${theme}-border, #666666);
                        cursor: pointer;
                    " data-section="features">
                        <h3 style="
                            margin: 0; 
                            color: var(--${theme}-accent, #999999); 
                            font-size: 1.1em;
                            font-weight: 600;
                        ">
                            Features
                        </h3>
                        <button type="button" class="section-toggle" style="
                            background: var(--${theme}-bg-secondary, #4a4a4a);
                            color: var(--${theme}-text-primary, #f0f0f0);
                            border: 1px solid var(--${theme}-border-light, #888888);
                            padding: 4px 8px;
                            border-radius: 3px;
                            font-size: 0.85em;
                            cursor: pointer;
                            transition: all 0.2s ease;
                        " data-target="features-content">
                            Collapse
                        </button>
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
                            themeName: theme,
                            featureData: featureData
                        });
                        featuresHTML += featureHTML;
                    } else {
                        // Feature validation failed, log and skip
                        API.log('warning', `Feature ${feature.name} validation failed: ${validation}`);
                    }
                } catch (error) {
                    API.log('error', `Error rendering feature ${feature.name}:`, error);
                }
            }

            featuresHTML += `
                    </div>
                </div>
            `;

            return featuresHTML;

        } catch (error) {
            API.log('error', 'Failed to render features section', error);
            return '';
        }
    }

    /**
     * Create a horizontal divider
     */
    createDivider() {
        const divider = document.createElement('hr');
        divider.className = 'section-divider';
        return divider;
    }
}
