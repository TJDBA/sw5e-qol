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
        this.currentDialogId = null; // Track current dialog ID for theme cleanup
    }

    /**
     * Open a generic roll dialog
     * @param {Object} options - Dialog configuration
     * @returns {Promise<Object|null>} Dialog result or null on error
     */
    async openDialog(options) {
        try {
            // Validate input
            if (!this.validateDialogOptions(options)) {
                return null;
            }

            // Generate unique dialog ID
            this.currentDialogId = `dialog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Set theme for this specific dialog (without changing global theme)
            const appliedTheme = themeManager.setThemeForDialog(this.currentDialogId, options);
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
                    close: () => {
                        // Clean up theme for this dialog
                        if (this.currentDialogId) {
                            themeManager.removeDialogTheme(this.currentDialogId);
                            this.currentDialogId = null;
                        }
                        this.currentDialog = null; // Clean up dialog reference
                        resolve(null);
                    }
                }, { 
                    jQuery: true,
                    width: 600,        // remember to update dialogs.css to match
                    resizable: false
                });

                // Store dialog reference for input handler
                this.currentDialog = dialog;

                // Render dialog
                dialog.render(true);
                
                // Apply theme to dialog element after rendering
                this.applyDialogTheme(dialog, options);
                
                // Wait for dialog to be fully rendered
                this.waitForDialogReady(options);

            } catch (error) {
                API.log('error', 'Failed to show dialog', error);
                resolve(null);
            }
        });
    }

    /**
     * Apply theme to dialog element
     */
    applyDialogTheme(dialog, options) {
        try {
            // Wait a bit for the dialog to be fully rendered in the DOM
            setTimeout(() => {
                if (dialog && dialog.element && dialog.element.length > 0) {
                    // Find the actual dialog content element with the generic-roll-dialog class
                    const dialogElement = dialog.element.find('.generic-roll-dialog')[0];
                    if (dialogElement) {
                        // Get the theme that was set for this dialog
                        const themeName = themeManager.activeDialogs.get(this.currentDialogId);
                        if (themeName) {
                            themeManager.applyThemeToDialog(dialogElement, themeName);
                            API.log('debug', `Applied theme ${themeName} to dialog element:`, dialogElement);
                        } else {
                            API.log('warning', `No theme found for dialog ${this.currentDialogId}`);
                        }
                    } else {
                        API.log('warning', 'Could not find .generic-roll-dialog element in dialog');
                    }
                }
            }, 100); // Small delay to ensure DOM is ready
        } catch (error) {
            API.log('error', 'Failed to apply dialog theme', error);
        }
    }

    /**
     * Wait for dialog to be fully rendered and then setup input handler
     */
    waitForDialogReady(options) {
        const checkDialog = () => {
            if (this.currentDialog && this.currentDialog.element && this.currentDialog.element.length > 0) {
                const dialogContent = this.currentDialog.element.find('.window-content');
                if (dialogContent.length > 0) {
                    API.log('debug', 'Dialog is ready, setting up input handler');
                    this.setupInputHandler(null, options);
                    return;
                }
            }
            
            // If not ready, check again in the next frame
            requestAnimationFrame(checkDialog);
        };
        
        // Start checking
        requestAnimationFrame(checkDialog);
    }

    /**
     * Setup input handler for the dialog
     */
    setupInputHandler(dialogElement, options) {
        try {
            // Find the actual dialog content element in the DOM
            // When using jQuery: true, the dialog content is in .window-content
            const actualDialogElement = this.currentDialog?.element?.find('.window-content')?.[0];
                                       
            if (!actualDialogElement) {
                API.log('warning', 'Could not find dialog content element');
                API.log('debug', 'Dialog reference:', this.currentDialog);
                API.log('debug', 'Dialog element:', this.currentDialog?.element);
                return;
            }

            API.log('debug', 'Found dialog content element:', actualDialogElement);

            // Create input handler with the actual DOM element
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