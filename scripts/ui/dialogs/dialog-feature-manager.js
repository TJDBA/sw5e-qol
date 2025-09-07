import { DialogLogger } from './dialog-logger.js';

/**
 * Dialog Feature Manager
 * Handles feature-specific functionality for dialogs
 */
export class DialogFeatureManager {
    constructor() {
        this.featureStates = {};
        this.logThisFile = false;
    }

    /**
     * Update feature state in the dialog data
     * @param {string} featureId - The feature ID
     * @param {boolean} isEnabled - Whether the feature is enabled
     */
    updateFeatureState(featureId, isEnabled) {
        if (this.logThisFile) DialogLogger.log('debug', `Updating feature state - ID: ${featureId}, Enabled: ${isEnabled}`);
        
        // Initialize feature state if it doesn't exist
        if (!this.featureStates) {
            this.featureStates = {};
        }
        
        // Update the specific feature state
        this.featureStates[featureId] = {
            enabled: isEnabled,
            timestamp: Date.now()
        };
        
        if (this.logThisFile) DialogLogger.log('debug', `Updated feature state for ${featureId}:`, this.featureStates[featureId]);
    }

    /**
     * Handle feature-specific toggle logic
     * Override in subclasses or extend as needed
     * @param {string} featureId - The feature ID
     * @param {boolean} isEnabled - Whether the feature is enabled
     */
    onFeatureToggle(featureId, isEnabled) {
        if (this.logThisFile) DialogLogger.log('debug', `Feature ${featureId} toggled to ${isEnabled ? 'enabled' : 'disabled'}`);
        
        // Default implementation - can be extended
        // This is where feature-specific logic would go
        // For example, enabling/disabling related UI elements
        // or updating other dependent features
    }

    /**
     * Get current feature states for dialog result
     * @returns {Object} Current feature states
     */
    getFeatureStates() {
        if (this.logThisFile) DialogLogger.log('debug', `Getting feature states:`, this.featureStates);
        return this.featureStates || {};
    }

    /**
     * Set feature states from dialog data
     * @param {Object} featureStates - Feature states to set
     */
    setFeatureStates(featureStates) {
        if (this.logThisFile) DialogLogger.log('debug', `Setting feature states:`, featureStates);
        this.featureStates = featureStates || {};
    }

    /**
     * Collect feature data from dialog form
     * @param {HTMLElement} dialogElement - The dialog element
     * @param {Array} availableFeatures - Array of available features
     * @param {Object} currentOptions - Current dialog options
     * @returns {Object} Collected feature data
     */
    collectFeatureData(dialogElement, availableFeatures, currentOptions) {
        if (this.logThisFile) DialogLogger.log('debug', `Collecting feature data from ${availableFeatures?.length || 0} available features`);
        
        try {
            const featureData = {};
            
            if (!availableFeatures) {
                if (this.logThisFile) DialogLogger.log('warning', 'No available features provided');
                return featureData;
            }

            // Loop through available features
            for (const feature of availableFeatures) {
                try {
                    // Get feature state from form
                    const featureState = feature.collectState(dialogElement);
                    
                    // Validate feature
                    const validation = feature.validationLogic({
                        actor: currentOptions.actor,
                        dialogType: currentOptions.dialogType,
                        featureData: featureState
                    });
                    
                    if (validation === true) {
                        featureData[feature.id] = featureState;
                        if (this.logThisFile) DialogLogger.log('debug', `Collected valid data for feature ${feature.name}`);
                    } else {
                        if (this.logThisFile) DialogLogger.log('warning', `Feature ${feature.name} validation failed: ${validation}`);
                    }
                } catch (error) {
                    DialogLogger.log('error', `Failed to collect data for feature ${feature.name}:`, error);
                }
            }
            
            if (this.logThisFile) DialogLogger.log('debug', `Collected feature data for ${Object.keys(featureData).length} features`);
            return featureData;
        } catch (error) {
            DialogLogger.log('error', 'Failed to collect feature data', error);
            return {};
        }
    }

    /**
     * Reset all feature states
     */
    resetFeatureStates() {
        if (this.logThisFile) DialogLogger.log('debug', 'Resetting all feature states');
        this.featureStates = {};
    }

    /**
     * Check if a specific feature is enabled
     * @param {string} featureId - The feature ID to check
     * @returns {boolean} True if feature is enabled
     */
    isFeatureEnabled(featureId) {
        const isEnabled = this.featureStates[featureId]?.enabled || false;
        if (this.logThisFile) DialogLogger.log('debug', `Feature ${featureId} is ${isEnabled ? 'enabled' : 'disabled'}`);
        return isEnabled;
    }

    /**
     * Enable a specific feature
     * @param {string} featureId - The feature ID to enable
     */
    enableFeature(featureId) {
        if (this.logThisFile) DialogLogger.log('debug', `Enabling feature: ${featureId}`);
        this.updateFeatureState(featureId, true);
    }

    /**
     * Disable a specific feature
     * @param {string} featureId - The feature ID to disable
     */
    disableFeature(featureId) {
        if (this.logThisFile) DialogLogger.log('debug', `Disabling feature: ${featureId}`);
        this.updateFeatureState(featureId, false);
    }

    /**
     * Toggle a specific feature
     * @param {string} featureId - The feature ID to toggle
     * @returns {boolean} New enabled state
     */
    toggleFeature(featureId) {
        const currentState = this.isFeatureEnabled(featureId);
        const newState = !currentState;
        this.updateFeatureState(featureId, newState);
        
        if (this.logThisFile) DialogLogger.log('debug', `Toggled feature ${featureId} to ${newState ? 'enabled' : 'disabled'}`);
        return newState;
    }

    /**
     * Get feature state timestamp
     * @param {string} featureId - The feature ID
     * @returns {number|null} Timestamp of last state change
     */
    getFeatureTimestamp(featureId) {
        return this.featureStates[featureId]?.timestamp || null;
    }

    /**
     * Get all enabled feature IDs
     * @returns {Array} Array of enabled feature IDs
     */
    getEnabledFeatureIds() {
        const enabledIds = Object.keys(this.featureStates).filter(id => this.featureStates[id].enabled);
        if (this.logThisFile) DialogLogger.log('debug', `Enabled feature IDs:`, enabledIds);
        return enabledIds;
    }

    /**
     * Get all disabled feature IDs
     * @returns {Array} Array of disabled feature IDs
     */
    getDisabledFeatureIds() {
        const disabledIds = Object.keys(this.featureStates).filter(id => !this.featureStates[id].enabled);
        if (this.logThisFile) DialogLogger.log('debug', `Disabled feature IDs:`, disabledIds);
        return disabledIds;
    }

    /**
     * Get count of enabled features
     * @returns {number} Count of enabled features
     */
    getEnabledFeatureCount() {
        const count = this.getEnabledFeatureIds().length;
        if (this.logThisFile) DialogLogger.log('debug', `Enabled feature count: ${count}`);
        return count;
    }

    /**
     * Check if any features are enabled
     * @returns {boolean} True if any features are enabled
     */
    hasEnabledFeatures() {
        const hasEnabled = this.getEnabledFeatureCount() > 0;
        if (this.logThisFile) DialogLogger.log('debug', `Has enabled features: ${hasEnabled}`);
        return hasEnabled;
    }
}
