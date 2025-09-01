import { API } from '../../api.js';
import { GenericRollRenderer } from './generic-roll-render.js';
import { GenericInputHandler } from './generic-input-handler.js';
import { themeManager } from '../theme-manager.js';

/**
 * Generic Roll Dialog Handler
 * Manages dialog logic and coordinates with renderer and input handler
 */
export class GenericRollHandler {
    constructor() {
        this.renderer = new GenericRollRenderer();
        this.inputHandler = null;
    }

    /**
     * Open a generic roll dialog
     * @param {Object} options - Dialog configuration
     * @param {string} options.type - Dialog type (attack, skill, save, damage)
     * @param {string} options.title - Dialog title
     * @param {Array} options.modifiers - Array of modifier objects
     * @returns {Promise<Object|null>} Dialog result or null on error
     */
    async openDialog(options) {
        try {
            // Validate input
            if (!this.validateDialogOptions(options)) {
                return null;
            }

            // Set theme for dialog
            const appliedTheme = themeManager.setThemeForDialog(options);
            API.log('info', `Applied theme: ${appliedTheme} for dialog type: ${options.type}`);

            // Render dialog
            const dialogHtml = await this.renderer.renderDialog(options);
            
            // Create and show dialog
            const result = await this.showDialog(dialogHtml, options);
            
            return result;

        } catch (error) {
            API.log('error', 'Failed to open generic roll dialog', error);
            return null;
        }
    }

    /**
     * Validate dialog options
     */
    validateDialogOptions(options) {
        try {
            if (!options || typeof options !== 'object') {
                API.log('error', 'Dialog options must be an object');
                return false;
            }

            if (!options.type || typeof options.type !== 'string') {
                API.log('error', 'Dialog type is required and must be a string');
                return false;
            }

            if (!options.title || typeof options.title !== 'string') {
                API.log('error', 'Dialog title is required and must be a string');
                return false;
            }

            // Validate modifiers array if provided
            if (options.modifiers && !Array.isArray(options.modifiers)) {
                API.log('error', 'Modifiers must be an array');
                return false;
            }

            // Validate dialog type
            const validTypes = ['attack', 'skill', 'save', 'damage'];
            if (!validTypes.includes(options.type.toLowerCase())) {
                API.log('error', `Invalid dialog type: ${options.type}. Must be one of: ${validTypes.join(', ')}`);
                return false;
            }

            return true;

        } catch (error) {
            API.log('error', 'Error validating dialog options', error);
            return false;
        }
    }

    /**
     * Show the rendered dialog
     */
    async showDialog(dialogHtml, options) {
        return new Promise((resolve) => {
            try {
                // Store resolve function for roll button
                this.resolveDialog = resolve;
                
                // Create dialog element
                const dialogElement = document.createElement('div');
                dialogElement.innerHTML = dialogHtml;
                const dialogContent = dialogElement.firstElementChild;

                // Create Foundry dialog without default buttons
                const dialog = new Dialog({
                    title: `${options.type}: ${options.title}`,
                    content: dialogContent.outerHTML,
                    buttons: {}, // No default buttons - we use our own roll button
                    close: () => resolve(null)
                }, { 
                    jQuery: true,
                    width: 800,        // allow the layout to breathe
                    resizable: true 
                });

                // Render dialog
                dialog.render(true);

                // Setup input handler after dialog is rendered
                this.setupInputHandler(dialogElement, options);

            } catch (error) {
                API.log('error', 'Failed to show dialog', error);
                resolve(null);
            }
        });
    }

    /**
     * Setup input handler for the dialog
     */
    setupInputHandler(dialogElement, options) {
        try {
            // Find the actual dialog element in the DOM
            const actualDialogElement = document.querySelector('.dialog-content');
            if (!actualDialogElement) {
                API.log('warning', 'Could not find dialog content element');
                return;
            }

            // Create input handler
            this.inputHandler = new GenericInputHandler(actualDialogElement, this);
            
            // Set initial modifiers if provided
            if (options.modifiers) {
                this.inputHandler.setModifiers(options.modifiers);
            }

        } catch (error) {
            API.log('error', 'Failed to setup input handler', error);
        }
    }

    /**
     * Get dialog result from input handler
     */
    getDialogResult(dialogElement) {
        try {
            if (!this.inputHandler) {
                API.log('warning', 'Input handler not available');
                return null;
            }

            return this.inputHandler.getDialogState();

        } catch (error) {
            API.log('error', 'Failed to get dialog result', error);
            return null;
        }
    }

    /**
     * Get available dialog types
     */
    getAvailableDialogTypes() {
        return ['attack', 'skill', 'save', 'damage'];
    }

    /**
     * Check if a dialog type is valid
     */
    isValidDialogType(type) {
        return this.getAvailableDialogTypes().includes(type.toLowerCase());
    }
}
