import { DialogLogger } from './dialog-logger.js';

/**
 * Dialog State Manager
 * Handles dialog state management and data persistence
 */
export class DialogStateManager {
    constructor() {
        this.modifiers = [];
        this.advantageType = 'normal';
        this.rollMode = 'public';
        this.selectedItem = '';
        this.selectedPreset = '';
        this.selectedAttribute = 'dexterity';
        this.rollForEachTarget = false;
        this.logThisFile = false;
    }

    /**
     * Get current dialog state
     * @returns {Object} Current dialog state
     */
    getDialogState() {
        if (this.logThisFile) DialogLogger.log('debug', 'Getting current dialog state');
        
        const state = {
            rollMode: this.rollMode,
            rollType: this.advantageType,
            modifiers: this.modifiers.filter(m => m.isEnabled),
            selectedItem: this.selectedItem,
            selectedPreset: this.selectedPreset,
            selectedAttribute: this.selectedAttribute,
            rollForEachTarget: this.rollForEachTarget
        };

        if (this.logThisFile) DialogLogger.log('debug', 'Dialog state:', state);
        return state;
    }

    /**
     * Set initial modifiers
     * @param {Array} modifiers - Array of initial modifiers
     */
    setModifiers(modifiers) {
        if (this.logThisFile) DialogLogger.log('debug', `Setting ${modifiers?.length || 0} initial modifiers`);
        
        this.modifiers = modifiers || [];
    }

    /**
     * Add a modifier to the state
     * @param {Object} modifier - Modifier object to add
     */
    addModifier(modifier) {
        if (this.logThisFile) DialogLogger.log('debug', `Adding modifier: ${modifier.name}`);
        
        this.modifiers.push(modifier);
    }

    /**
     * Remove a modifier from the state
     * @param {number} index - Index of modifier to remove
     */
    removeModifier(index) {
        if (index >= 0 && index < this.modifiers.length) {
            const removed = this.modifiers.splice(index, 1)[0];
            if (this.logThisFile) DialogLogger.log('debug', `Removed modifier: ${removed.name}`);
        }
    }

    /**
     * Update a modifier in the state
     * @param {number} index - Index of modifier to update
     * @param {Object} modifier - Updated modifier object
     */
    updateModifier(index, modifier) {
        if (index >= 0 && index < this.modifiers.length) {
            this.modifiers[index] = modifier;
            if (this.logThisFile) DialogLogger.log('debug', `Updated modifier at index ${index}: ${modifier.name}`);
        }
    }

    /**
     * Get a modifier by index
     * @param {number} index - Index of modifier to get
     * @returns {Object|null} Modifier object or null
     */
    getModifier(index) {
        if (index >= 0 && index < this.modifiers.length) {
            return this.modifiers[index];
        }
        return null;
    }

    /**
     * Get all modifiers
     * @returns {Array} Array of all modifiers
     */
    getAllModifiers() {
        return this.modifiers;
    }

    /**
     * Get enabled modifiers only
     * @returns {Array} Array of enabled modifiers
     */
    getEnabledModifiers() {
        return this.modifiers.filter(m => m.isEnabled);
    }

    /**
     * Get disabled modifiers only
     * @returns {Array} Array of disabled modifiers
     */
    getDisabledModifiers() {
        return this.modifiers.filter(m => !m.isEnabled);
    }

    /**
     * Set advantage type
     * @param {string} advantageType - The advantage type ('normal', 'advantage', 'disadvantage')
     */
    setAdvantageType(advantageType) {
        if (this.logThisFile) DialogLogger.log('debug', `Setting advantage type to: ${advantageType}`);
        this.advantageType = advantageType;
    }

    /**
     * Get advantage type
     * @returns {string} Current advantage type
     */
    getAdvantageType() {
        return this.advantageType;
    }

    /**
     * Set roll mode
     * @param {string} rollMode - The roll mode ('public', 'private', 'blind', 'self')
     */
    setRollMode(rollMode) {
        if (this.logThisFile) DialogLogger.log('debug', `Setting roll mode to: ${rollMode}`);
        this.rollMode = rollMode;
    }

    /**
     * Get roll mode
     * @returns {string} Current roll mode
     */
    getRollMode() {
        return this.rollMode;
    }

    /**
     * Set selected item
     * @param {string} itemId - The selected item ID
     */
    setSelectedItem(itemId) {
        if (this.logThisFile) DialogLogger.log('debug', `Setting selected item to: ${itemId}`);
        this.selectedItem = itemId;
    }

    /**
     * Get selected item
     * @returns {string} Current selected item ID
     */
    getSelectedItem() {
        return this.selectedItem;
    }

    /**
     * Set selected preset
     * @param {string} presetId - The selected preset ID
     */
    setSelectedPreset(presetId) {
        if (this.logThisFile) DialogLogger.log('debug', `Setting selected preset to: ${presetId}`);
        this.selectedPreset = presetId;
    }

    /**
     * Get selected preset
     * @returns {string} Current selected preset ID
     */
    getSelectedPreset() {
        return this.selectedPreset;
    }

    /**
     * Set selected attribute
     * @param {string} attribute - The selected attribute
     */
    setSelectedAttribute(attribute) {
        if (this.logThisFile) DialogLogger.log('debug', `Setting selected attribute to: ${attribute}`);
        this.selectedAttribute = attribute;
    }

    /**
     * Get selected attribute
     * @returns {string} Current selected attribute
     */
    getSelectedAttribute() {
        return this.selectedAttribute;
    }

    /**
     * Set roll for each target flag
     * @param {boolean} rollForEach - Whether to roll for each target
     */
    setRollForEachTarget(rollForEach) {
        if (this.logThisFile) DialogLogger.log('debug', `Setting roll for each target to: ${rollForEach}`);
        this.rollForEachTarget = rollForEach;
    }

    /**
     * Get roll for each target flag
     * @returns {boolean} Whether to roll for each target
     */
    getRollForEachTarget() {
        return this.rollForEachTarget;
    }

    /**
     * Reset all state to defaults
     */
    resetState() {
        if (this.logThisFile) DialogLogger.log('debug', 'Resetting dialog state to defaults');
        
        this.modifiers = [];
        this.advantageType = 'normal';
        this.rollMode = 'public';
        this.selectedItem = '';
        this.selectedPreset = '';
        this.selectedAttribute = 'dexterity';
        this.rollForEachTarget = false;
    }

    /**
     * Load state from an object
     * @param {Object} state - State object to load
     */
    loadState(state) {
        if (this.logThisFile) DialogLogger.log('debug', 'Loading dialog state:', state);
        
        if (state.modifiers) this.modifiers = state.modifiers;
        if (state.rollType) this.advantageType = state.rollType;
        if (state.rollMode) this.rollMode = state.rollMode;
        if (state.selectedItem) this.selectedItem = state.selectedItem;
        if (state.selectedPreset) this.selectedPreset = state.selectedPreset;
        if (state.selectedAttribute) this.selectedAttribute = state.selectedAttribute;
        if (state.rollForEachTarget !== undefined) this.rollForEachTarget = state.rollForEachTarget;
    }

    /**
     * Save current state to an object
     * @returns {Object} Current state object
     */
    saveState() {
        const state = this.getDialogState();
        if (this.logThisFile) DialogLogger.log('debug', 'Saving dialog state:', state);
        return state;
    }

    /**
     * Check if state has been modified from defaults
     * @returns {boolean} True if state has been modified
     */
    isModified() {
        const hasModifiers = this.modifiers.length > 0;
        const hasNonDefaultAdvantage = this.advantageType !== 'normal';
        const hasNonDefaultRollMode = this.rollMode !== 'public';
        const hasSelectedItem = this.selectedItem !== '';
        const hasSelectedPreset = this.selectedPreset !== '';
        const hasNonDefaultAttribute = this.selectedAttribute !== 'dexterity';
        const hasRollForEachTarget = this.rollForEachTarget !== false;

        const isModified = hasModifiers || hasNonDefaultAdvantage || hasNonDefaultRollMode || 
                          hasSelectedItem || hasSelectedPreset || hasNonDefaultAttribute || hasRollForEachTarget;

        if (this.logThisFile) DialogLogger.log('debug', `State is modified: ${isModified}`);
        return isModified;
    }

    /**
     * Get state summary for debugging
     * @returns {Object} State summary
     */
    getStateSummary() {
        return {
            modifierCount: this.modifiers.length,
            enabledModifierCount: this.getEnabledModifiers().length,
            advantageType: this.advantageType,
            rollMode: this.rollMode,
            selectedItem: this.selectedItem,
            selectedPreset: this.selectedPreset,
            selectedAttribute: this.selectedAttribute,
            rollForEachTarget: this.rollForEachTarget,
            isModified: this.isModified()
        };
    }
}
