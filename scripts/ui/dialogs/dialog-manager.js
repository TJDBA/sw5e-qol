import { DialogLogger } from './dialog-logger.js';
import { themeManager } from '../theme-manager.js';
import { featureManager } from '../../features/feature-manager.js';

/**
 * Dialog Manager
 * Handles core dialog management, validation, and coordination
 */
export class DialogManager {
    constructor() {
        this.currentDialogId = null;
        this.currentOptions = null;
        this.currentDialog = null;
        this.resolveDialog = null;
    }

    /**
     * Open a generic roll dialog
     * @param {string} ownerID - The ID of the actor/token making the check
     * @param {string} dialogType - The type of dialog to open (attack, skill, save, damage, ability)
     * @param {Object} options - Optional dialog configuration (will be created if not provided)
     * @returns {Promise<Object|null>} Dialog result or null on error
     */
    async openDialog(ownerID, dialogType, options = null) {
        const logThisFile = false;
        
        try {
            if (logThisFile) DialogLogger.log('debug', `Opening dialog - ownerID: ${ownerID}, dialogType: ${dialogType}`);
            
            // Validate input
            const ownerType = this.validateOwnerID(ownerID);
            if (ownerType === 'invalid') {
                ui.notifications.warn('Please select a valid actor or token to make this roll.');
                if (logThisFile) DialogLogger.log('warning', `Invalid ownerID provided: ${ownerID}`);
                return null;
            }

            if (!this.validateDialogType(dialogType)) {
                ui.notifications.warn(`Invalid dialog type: ${dialogType}. Must be one of: attack, skill, save, damage, ability`);
                if (logThisFile) DialogLogger.log('warning', `Invalid dialogType provided: ${dialogType}`);
                return null;
            }

            if (!options) {
                options = {};
            }

            options.ownerID = ownerID;
            options.dialogType = dialogType;
            options.ownerType = ownerType;

            if (!this.validateAndSetDefaults(options)) {
                return null;
            }

            // Get actor for feature discovery
            const actor = this.getActorFromOwnerID(ownerID, ownerType);
            if (actor) {
                // Get available features for this actor and dialog type
                options.availableFeatures = featureManager.getAvailableFeatures(actor, dialogType);
                options.actor = actor;
                if (logThisFile) DialogLogger.log('debug', `Found ${options.availableFeatures?.length || 0} available features for actor`);
            }

            this.currentDialogId = `dialog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.currentOptions = options; // Store options for later use

            // Set theme for this specific dialog (without changing global theme)
            const appliedTheme = themeManager.setThemeForDialog(this.currentDialogId, options);
            if (logThisFile) DialogLogger.log('info', `Applied theme: ${appliedTheme} for dialog type: ${options.type}`);

            // Add the applied theme to options for the renderer
            options.theme = appliedTheme;

            return options;

        } catch (error) {
            DialogLogger.log('error', 'Failed to open generic roll dialog', error);
            return null;
        }
    }

    /**
     * Show the rendered dialog
     * @param {string} dialogHtml - The rendered dialog HTML
     * @param {Object} options - Dialog options
     * @returns {Promise<Object|null>} Dialog result
     */
    async showDialog(dialogHtml, options) {
        const logThisFile = true; // Temporarily enable for debugging
        
        if (logThisFile) DialogLogger.log('debug', 'showDialog method called');
        
        return new Promise((resolve) => {
            try {
                if (logThisFile) DialogLogger.log('debug', 'Creating dialog element and showing dialog');
                
                // Store resolve function for roll button
                this.resolveDialog = resolve;

                // Create dialog element
                const dialogElement = document.createElement('div');
                dialogElement.innerHTML = dialogHtml;
                const dialogContent = dialogElement.firstElementChild;
                
                if (logThisFile) DialogLogger.log('debug', `Dialog HTML length: ${dialogHtml.length}`);
                if (logThisFile) DialogLogger.log('debug', `Dialog content element: ${dialogContent ? 'found' : 'not found'}`);
                if (logThisFile && dialogContent) DialogLogger.log('debug', `Dialog content classes: ${dialogContent.className}`);

                // Create Foundry dialog with a temporary close button
                if (logThisFile) DialogLogger.log('debug', 'Creating Foundry Dialog instance');
                
                const dialog = new Dialog({
                    title: (`${options.type}: ${options.title}`).capitalize(),
                    content: dialogContent.outerHTML,
                    buttons: {
                        close: {
                            icon: '<i class="fas fa-times"></i>',
                            label: "Close",
                            callback: () => {
                                if (logThisFile) DialogLogger.log('debug', 'Close button clicked');
                                // Clean up theme for this dialog
                                if (this.currentDialogId) {
                                    themeManager.removeDialogTheme(this.currentDialogId);
                                    this.currentDialogId = null;
                                }
                                this.currentDialog = null; // Clean up dialog reference
                                resolve(null);
                            }
                        }
                    },
                    close: () => {
                        if (logThisFile) DialogLogger.log('debug', 'Dialog close callback triggered');
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
                
                if (logThisFile) DialogLogger.log('debug', 'Foundry Dialog instance created successfully');

                // Store dialog reference for input handler
                this.currentDialog = dialog;
                if (logThisFile) DialogLogger.log('debug', 'Dialog reference stored, currentDialog set');

                // Render dialog
                try {
                    dialog.render(true);
                    if (logThisFile) DialogLogger.log('debug', 'Dialog rendered, checking if element exists');
                } catch (renderError) {
                    if (logThisFile) DialogLogger.log('error', 'Error rendering dialog', renderError);
                    resolve(null);
                    return;
                }

                // Apply theme to dialog element after rendering
                // TEMPORARILY DISABLED FOR DEBUGGING
                if (logThisFile) DialogLogger.log('debug', 'Skipping theme application for debugging');
                
                // try {
                //     this.applyDialogTheme(dialog, options);
                //     if (logThisFile) DialogLogger.log('debug', 'Theme application started, dialog should be ready');
                // } catch (themeError) {
                //     if (logThisFile) DialogLogger.log('error', 'Error starting theme application', themeError);
                //     // Don't resolve here, let the dialog continue
                // }

                if (logThisFile) DialogLogger.log('debug', 'showDialog Promise setup complete, resolving immediately');
                
                // Resolve the Promise immediately after dialog is rendered
                // The dialog will handle its own cleanup when closed
                resolve({ success: true, dialog: dialog });

            } catch (error) {
                DialogLogger.log('error', 'Failed to show dialog', error);
                resolve(null);
            }
        });
    }

    /**
     * Apply theme to dialog element
     * @param {Dialog} dialog - The Foundry dialog instance
     * @param {Object} options - Dialog options
     */
    applyDialogTheme(dialog, options) {
        const logThisFile = true; // Temporarily enable for debugging
        
        try {
            if (logThisFile) DialogLogger.log('debug', 'Starting theme application with setTimeout');
            
            // Wait a bit for the dialog to be fully rendered in the DOM
            setTimeout(() => {
                if (logThisFile) DialogLogger.log('debug', 'setTimeout callback executing');
                
                if (dialog && dialog.element && dialog.element.length > 0) {
                    if (logThisFile) DialogLogger.log('debug', 'Dialog element found, looking for .generic-roll-dialog');
                    
                    // Find the actual dialog content element with the generic-roll-dialog class
                    const dialogElement = dialog.element.find('.generic-roll-dialog')[0];
                    if (dialogElement) {
                        if (logThisFile) DialogLogger.log('debug', 'Found .generic-roll-dialog element');
                        
                        // Get the theme that was set for this dialog
                        const themeName = themeManager.activeDialogs.get(this.currentDialogId);
                        if (logThisFile) DialogLogger.log('debug', `Theme name for dialog ${this.currentDialogId}: ${themeName}`);
                        
                        if (themeName) {
                            try {
                                themeManager.applyThemeToDialog(dialogElement, themeName);
                                if (logThisFile) DialogLogger.log('debug', `Applied theme ${themeName} to dialog element`);
                            } catch (themeError) {
                                if (logThisFile) DialogLogger.log('error', 'Error applying theme to dialog', themeError);
                            }
                        } else {
                            if (logThisFile) DialogLogger.log('warning', `No theme found for dialog ${this.currentDialogId}`);
                        }
                    } else {
                        if (logThisFile) DialogLogger.log('warning', 'Could not find .generic-roll-dialog element in dialog');
                    }
                } else {
                    if (logThisFile) DialogLogger.log('warning', 'Dialog element not found in setTimeout callback');
                }
            }, 100); // Small delay to ensure DOM is ready
        } catch (error) {
            DialogLogger.log('error', 'Failed to apply dialog theme', error);
        }
    }

    /**
     * Wait for dialog to be fully rendered and then setup input handler
     * @param {Object} options - Dialog options
     */
    waitForDialogReady(options, callback = null) {
        const logThisFile = true; // Temporarily enable for debugging
        let checkCount = 0;
        const maxChecks = 100; // Prevent infinite loop
        
        if (logThisFile) DialogLogger.log('debug', 'waitForDialogReady method called');
        if (logThisFile) DialogLogger.log('debug', `Callback provided: ${!!callback}`);
        
        const checkDialog = () => {
            checkCount++;
            if (logThisFile) DialogLogger.log('debug', `Checking dialog readiness... (attempt ${checkCount}/${maxChecks})`);
            
            if (checkCount >= maxChecks) {
                if (logThisFile) DialogLogger.log('error', 'Max checks reached, giving up on dialog setup');
                return;
            }
            
            if (this.currentDialog && this.currentDialog.element && this.currentDialog.element.length > 0) {
                if (logThisFile) DialogLogger.log('debug', 'Dialog element found, looking for .window-content');
                
                // Debug: Log the actual dialog element structure
                if (logThisFile) DialogLogger.log('debug', `Dialog element classes: ${this.currentDialog.element.attr('class')}`);
                if (logThisFile) DialogLogger.log('debug', `Dialog element HTML: ${this.currentDialog.element[0].outerHTML.substring(0, 200)}...`);
                
                const dialogContent = this.currentDialog.element.find('.window-content');
                if (logThisFile) DialogLogger.log('debug', `Found ${dialogContent.length} .window-content elements`);
                
                // Also try looking for other possible selectors
                const genericRollDialog = this.currentDialog.element.find('.generic-roll-dialog');
                if (logThisFile) DialogLogger.log('debug', `Found ${genericRollDialog.length} .generic-roll-dialog elements`);
                
                if (dialogContent.length > 0) {
                    if (logThisFile) DialogLogger.log('debug', 'Dialog is ready, setting up input handler');
                    if (callback) {
                        if (logThisFile) DialogLogger.log('debug', 'Calling callback function');
                        callback();
                    } else {
                        if (logThisFile) DialogLogger.log('debug', 'Calling setupInputHandler directly');
                        this.setupInputHandler(null, options);
                    }
                    return;
                } else {
                    if (logThisFile) DialogLogger.log('debug', 'No .window-content found, continuing to check...');
                }
            } else {
                if (logThisFile) DialogLogger.log('debug', 'Dialog element not ready yet');
            }

            // If not ready, check again in the next frame
            requestAnimationFrame(checkDialog);
        };

        // Start checking
        requestAnimationFrame(checkDialog);
    }

    /**
     * Setup input handler for the dialog
     * @param {HTMLElement} dialogElement - Dialog element (unused, kept for compatibility)
     * @param {Object} options - Dialog options
     */
    setupInputHandler(dialogElement, options) {
        const logThisFile = true; // Temporarily enable for debugging
        
        try {
            // Find the actual dialog content element in the DOM
            // When using jQuery: true, the dialog content is in .window-content
            const actualDialogElement = this.currentDialog?.element?.find('.window-content')?.[0];
            if (logThisFile) DialogLogger.log('debug', 'Found dialog content element for input handler setup');

            if (!actualDialogElement) {
                if (logThisFile) DialogLogger.log('warning', 'Could not find dialog content element');
                return;
            }

            // Return the actual dialog element for the input handler to use
            return actualDialogElement;

        } catch (error) {
            DialogLogger.log('error', 'Failed to setup input handler', error);
            return null;
        }
    }

    /**
     * Validate dialog options
     * @param {Object} options - Dialog options to validate
     * @returns {boolean} True if valid
     */
    validateDialogOptions(options) {
        const logThisFile = false;
        
        try {
            if (!options || typeof options !== 'object') {
                if (logThisFile) DialogLogger.log('error', 'Dialog options must be an object');
                return false;
            }

            if (!options.type || typeof options.type !== 'string') {
                if (logThisFile) DialogLogger.log('error', 'Dialog type is required and must be a string');
                return false;
            }

            if (!options.title || typeof options.title !== 'string') {
                if (logThisFile) DialogLogger.log('error', 'Dialog title is required and must be a string');
                return false;
            }

            // Validate modifiers array if provided
            if (options.modifiers && !Array.isArray(options.modifiers)) {
                if (logThisFile) DialogLogger.log('error', 'Modifiers must be an array');
                return false;
            }

            // Validate dialog type
            const validTypes = ['attack', 'skill', 'save', 'damage'];
            if (!validTypes.includes(options.type.toLowerCase())) {
                if (logThisFile) DialogLogger.log('error', `Invalid dialog type: ${options.type}. Must be one of: ${validTypes.join(', ')}`);
                return false;
            }

            return true;

        } catch (error) {
            DialogLogger.log('error', 'Error validating dialog options', error);
            return false;
        }
    }

    /**
     * Get actor from owner ID and type
     * @param {string} ownerID - Owner ID
     * @param {string} ownerType - Owner type ('actor' or 'token')
     * @returns {Actor|null} Actor instance or null
     */
    getActorFromOwnerID(ownerID, ownerType) {
        const logThisFile = false;
        
        try {
            if (ownerType === 'actor') {
                const actor = game.actors.get(ownerID);
                if (logThisFile) DialogLogger.log('debug', `Retrieved actor: ${actor?.name || 'null'}`);
                return actor;
            } else if (ownerType === 'token') {
                const token = canvas.tokens.get(ownerID);
                const actor = token?.actor;
                if (logThisFile) DialogLogger.log('debug', `Retrieved token actor: ${actor?.name || 'null'}`);
                return actor;
            }
            return null;
        } catch (error) {
            DialogLogger.log('error', 'Failed to get actor from owner ID', error);
            return null;
        }
    }

    /**
     * Get available dialog types
     * @returns {string[]} Array of valid dialog types
     */
    getAvailableDialogTypes() {
        return ['attack', 'skill', 'save', 'damage'];
    }

    /**
     * Check if a dialog type is valid
     * @param {string} type - Dialog type to check
     * @returns {boolean} True if valid
     */
    isValidDialogType(type) {
        return this.getAvailableDialogTypes().includes(type.toLowerCase());
    }

    /**
     * Validate owner ID and return type
     * @param {string} ownerID - Owner ID to validate
     * @returns {string} 'actor', 'token', or 'invalid'
     */
    validateOwnerID(ownerID) {
        const logThisFile = false;
        
        try {
            if (!ownerID) return 'invalid';
            
            // Check if it's an actor ID
            if (game.actors.get(ownerID)) {
                if (logThisFile) DialogLogger.log('debug', `OwnerID ${ownerID} is valid actor`);
                return 'actor';
            }
            
            // Check if it's a token ID
            if (canvas.tokens.get(ownerID)) {
                if (logThisFile) DialogLogger.log('debug', `OwnerID ${ownerID} is valid token`);
                return 'token';
            }
            
            if (logThisFile) DialogLogger.log('debug', `OwnerID ${ownerID} is invalid`);
            return 'invalid';
        } catch (error) {
            DialogLogger.log('error', 'Error validating owner ID', error);
            return 'invalid';
        }
    }

    /**
     * Validate dialog type
     * @param {string} dialogType - Dialog type to validate
     * @returns {boolean} True if valid
     */
    validateDialogType(dialogType) {
        const validTypes = ['attack', 'skill', 'save', 'damage', 'ability'];
        return validTypes.includes(dialogType.toLowerCase());
    }

    /**
     * Validate and set defaults for dialog options
     * @param {Object} options - Options to validate and set defaults
     * @returns {boolean} True if valid
     */
    validateAndSetDefaults(options) {
        const logThisFile = false;
        
        try {
            // Set default type if not provided
            if (!options.type) {
                options.type = options.dialogType || 'attack';
                if (logThisFile) DialogLogger.log('debug', `Set default type: ${options.type}`);
            }

            // Set default title if not provided
            if (!options.title) {
                options.title = options.type.charAt(0).toUpperCase() + options.type.slice(1);
                if (logThisFile) DialogLogger.log('debug', `Set default title: ${options.title}`);
            }

            // Set default modifiers array
            if (!options.modifiers) {
                options.modifiers = [];
                if (logThisFile) DialogLogger.log('debug', 'Set default empty modifiers array');
            }

            if (logThisFile) DialogLogger.log('debug', 'Dialog options validated and defaults set', options);
            return true;
        } catch (error) {
            DialogLogger.log('error', 'Error validating dialog options', error);
            return false;
        }
    }
}
