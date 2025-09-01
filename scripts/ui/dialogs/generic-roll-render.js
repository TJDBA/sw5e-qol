import { API } from '../../api.js';

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
                'modifiers-table',
                'add-modifier-inputs', 
                'advantage-radio',
                'roll-mode-dropdown',
                'roll-button'
            ];

            for (const section of sections) {
                const template = await this.loadTemplate(section);
                console.log(`Loaded template for ${section}:`, template); // Debug log
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
            console.log('Base template path:', baseTemplate); // Debug log
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
            case 'skill':
            case 'save':
                return [
                    'modifiers-table',
                    'add-modifier-inputs',
                    'advantage-radio',
                    'roll-mode-dropdown',
                    'roll-button'
                ];
            case 'damage':
                return [
                    'modifiers-table',
                    'add-modifier-inputs',
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
                return ['Energy', 'Kinetic', 'Force', 'Ion'];
            default:
                return ['Untyped'];
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
