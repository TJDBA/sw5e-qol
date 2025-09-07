// Note: API import removed to prevent circular dependency
// Simple logging function to avoid circular dependency
const log = (level, message, ...args) => {
    if (level === 'error') {
        console.error(message, ...args);
    } else if (level === 'warning') {
        console.warn(message, ...args);
    } else {
        console.log(message, ...args);
    }
};

import { DialogManager } from './dialog-manager.js';
import { DialogEventHandler } from './dialog-event-handler.js';
import { DialogModifierManager } from './dialog-modifier-manager.js';
import { DialogFeatureManager } from './dialog-feature-manager.js';
import { DialogRollButtonManager } from './dialog-roll-button-manager.js';
import { ItemHandler } from './item-handler.js';
import { DialogTemplateRenderer } from './dialog-template-renderer.js';
import { DialogSectionDataPreparer } from './dialog-section-data-preparer.js';
import { DialogFeaturesRenderer } from './dialog-features-renderer.js';
import { DialogStateManager } from './dialog-state-manager.js';
import { PresetManager } from './preset-manager.js';

/**
 * Generic Roll Dialog
 * Main coordinator for all dialog functionality
 */
export class GenericRollDialog {
    constructor() {
        this.logThisFile = false;
        this.dialogManager = new DialogManager();
        this.templateRenderer = new DialogTemplateRenderer();
        this.sectionDataPreparer = new DialogSectionDataPreparer();
        this.featuresRenderer = new DialogFeaturesRenderer();
        this.presetManager = new PresetManager();
        
        // These will be initialized when dialog is opened
        this.eventHandler = null;
        this.modifierManager = null;
        this.featureManager = null;
        this.rollButtonManager = null;
        this.itemHandler = null;
        this.stateManager = null;
        this.currentDialog = null;
        this.resolveDialog = null;
    }

    /**
     * Open a generic roll dialog
     * @param {string} ownerID - The ID of the actor/token making the check
     * @param {string} dialogType - The type of dialog to open (attack, skill, save, damage, ability)
     * @param {Object} options - Optional dialog configuration
     * @returns {Promise<Object|null>} Dialog result or null on error
     */
    async openDialog(ownerID, dialogType, options = null) {
        if (this.logThisFile) log('debug', `Opening dialog - ownerID: ${ownerID}, dialogType: ${dialogType}`);
        
        try {
            // Use dialog manager to validate and prepare options
            const preparedOptions = await this.dialogManager.openDialog(ownerID, dialogType, options);
            if (!preparedOptions) {
                if (this.logThisFile) log('warning', 'Dialog preparation failed');
                return null;
            }

            // Render dialog using template renderer
            const dialogHtml = await this.templateRenderer.renderDialog(preparedOptions);
            if (this.logThisFile) log('debug', 'Dialog HTML rendered successfully');

            // Show dialog using dialog manager
            if (this.logThisFile) log('debug', 'About to call showDialog');
            const result = await this.dialogManager.showDialog(dialogHtml, preparedOptions);
            if (this.logThisFile) log('debug', 'showDialog completed, result:', result);
            
            // Setup input handler after dialog is ready (via callback)
            if (this.logThisFile) log('debug', 'Calling waitForDialogReady with callback');
            this.dialogManager.waitForDialogReady(preparedOptions, () => {
                if (this.logThisFile) log('debug', 'waitForDialogReady callback executed');
                this.setupInputHandler(preparedOptions);
            });
            
            if (this.logThisFile) log('debug', 'Dialog opened successfully');
            return result;

        } catch (error) {
            log('error', 'Failed to open generic roll dialog', error);
            return null;
        }
    }

    /**
     * Setup input handler for the dialog
     * @param {Object} options - Dialog options
     */
    setupInputHandler(options) {
        this.logThisFile = true; // Temporarily enable for debugging
        if (this.logThisFile) log('debug', 'Setting up input handler');
        
        try {
            // Get the actual dialog element from dialog manager
            const dialogElement = this.dialogManager.setupInputHandler(null, options);
            if (!dialogElement) {
                if (this.logThisFile) log('warning', 'Could not get dialog element for input handler');
                return;
            }

            // Initialize all managers
            this.stateManager = new DialogStateManager();
            this.modifierManager = new DialogModifierManager(dialogElement);
            this.featureManager = new DialogFeatureManager();
            this.itemHandler = new ItemHandler();
            this.rollButtonManager = new DialogRollButtonManager(dialogElement, this.modifierManager, this.featureManager);
            this.eventHandler = new DialogEventHandler(dialogElement, this);

            // Set up cross-references
            this.rollButtonManager.setHandler(this);
            this.currentOptions = options;

            // Set initial modifiers if provided
            if (options.modifiers) {
                this.modifierManager.setModifiers(options.modifiers);
                this.stateManager.setModifiers(options.modifiers);
            }

            // Initialize item rows if actor is available
            if (options.actor) {
                this.itemHandler.initializeItemRows(dialogElement, options.actor, options.itemID);
            }

            // Initialize roll button label
            if (this.rollButtonManager) {
                this.rollButtonManager.updateRollButtonLabel();
                if (this.logThisFile) log('debug', 'Initial roll button label updated');
            }

            // Initialize item dropdown (this should already be handled by template rendering)
            if (this.logThisFile) log('debug', 'Item dropdown should be populated by template rendering');

            // Initialize attribute dropdown handlers
            if (this.eventHandler) {
                this.eventHandler.setupAttributeSelect();
                if (this.logThisFile) log('debug', 'Attribute dropdown handlers set up');
            }

            if (this.logThisFile) log('debug', 'Input handler setup completed successfully');

        } catch (error) {
            log('error', 'Failed to setup input handler', error);
        }
    }

    /**
     * Get current dialog state
     * @returns {Object} Current dialog state
     */
    getDialogState() {
        if (this.logThisFile) log('debug', 'Getting dialog state');
        
        const state = this.stateManager ? this.stateManager.getDialogState() : {};
        
        // Add feature data to dialog state
        if (this.currentOptions?.availableFeatures && this.featureManager) {
            state.features = this.featureManager.collectFeatureData(
                this.eventHandler?.dialogElement, 
                this.currentOptions.availableFeatures, 
                this.currentOptions
            );
            state.availableFeatures = this.currentOptions.availableFeatures;
        }

        if (this.logThisFile) log('debug', 'Dialog state:', state);
        return state;
    }

    /**
     * Get available dialog types
     * @returns {Array} Array of available dialog types
     */
    getAvailableDialogTypes() {
        return this.dialogManager.getAvailableDialogTypes();
    }

    /**
     * Check if a dialog type is valid
     * @param {string} type - Dialog type to check
     * @returns {boolean} True if valid
     */
    isValidDialogType(type) {
        return this.dialogManager.isValidDialogType(type);
    }

    /**
     * Get current dialog options
     * @returns {Object} Current dialog options
     */
    getCurrentOptions() {
        return this.currentOptions;
    }

    /**
     * Set current dialog options
     * @param {Object} options - Dialog options
     */
    setCurrentOptions(options) {
        this.currentOptions = options;
        if (this.logThisFile) log('debug', 'Current options updated');
    }

    /**
     * Get dialog manager
     * @returns {DialogManager} Dialog manager instance
     */
    getDialogManager() {
        return this.dialogManager;
    }

    /**
     * Get template renderer
     * @returns {DialogTemplateRenderer} Template renderer instance
     */
    getTemplateRenderer() {
        return this.templateRenderer;
    }

    /**
     * Get section data preparer
     * @returns {DialogSectionDataPreparer} Section data preparer instance
     */
    getSectionDataPreparer() {
        return this.sectionDataPreparer;
    }

    /**
     * Get features renderer
     * @returns {DialogFeaturesRenderer} Features renderer instance
     */
    getFeaturesRenderer() {
        return this.featuresRenderer;
    }

    /**
     * Get preset manager
     * @returns {PresetManager} Preset manager instance
     */
    getPresetManager() {
        return this.presetManager;
    }

    /**
     * Get event handler
     * @returns {DialogEventHandler} Event handler instance
     */
    getEventHandler() {
        return this.eventHandler;
    }

    /**
     * Get modifier manager
     * @returns {DialogModifierManager} Modifier manager instance
     */
    getModifierManager() {
        return this.modifierManager;
    }

    /**
     * Get feature manager
     * @returns {DialogFeatureManager} Feature manager instance
     */
    getFeatureManager() {
        return this.featureManager;
    }

    /**
     * Get roll button manager
     * @returns {DialogRollButtonManager} Roll button manager instance
     */
    getRollButtonManager() {
        return this.rollButtonManager;
    }

    /**
     * Get item handler
     * @returns {ItemHandler} Item handler instance
     */
    getItemHandler() {
        return this.itemHandler;
    }

    /**
     * Get state manager
     * @returns {DialogStateManager} State manager instance
     */
    getStateManager() {
        return this.stateManager;
    }

    /**
     * Cleanup dialog resources
     */
    cleanup() {
        if (this.logThisFile) log('debug', 'Cleaning up dialog resources');
        
        this.eventHandler = null;
        this.modifierManager = null;
        this.featureManager = null;
        this.rollButtonManager = null;
        this.itemHandler = null;
        this.stateManager = null;
        this.currentDialog = null;
        this.resolveDialog = null;
        this.currentOptions = null;
    }

    /**
     * Check if dialog is currently open
     * @returns {boolean} True if dialog is open
     */
    isDialogOpen() {
        return this.currentDialog !== null;
    }

    /**
     * Get dialog status information
     * @returns {Object} Dialog status
     */
    getDialogStatus() {
        return {
            isOpen: this.isDialogOpen(),
            hasEventHandler: this.eventHandler !== null,
            hasModifierManager: this.modifierManager !== null,
            hasFeatureManager: this.featureManager !== null,
            hasRollButtonManager: this.rollButtonManager !== null,
            hasItemHandler: this.itemHandler !== null,
            hasStateManager: this.stateManager !== null,
            currentOptions: this.currentOptions
        };
    }
}

// Create and export a singleton instance
export const genericRollDialog = new GenericRollDialog();
