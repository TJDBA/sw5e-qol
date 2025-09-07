import { DialogLogger } from './dialog-logger.js';
import { API } from '../../api.js';

/**
 * Dialog Roll Button Manager
 * Handles roll button functionality and label management
 */
export class DialogRollButtonManager {
    constructor(dialogElement, modifierManager, featureManager) {
        this.dialogElement = dialogElement;
        this.modifierManager = modifierManager;
        this.featureManager = featureManager;
        this.logThisFile = false;
    }

    /**
     * Build the final roll button label
     * @returns {string} The roll button label
     */
    buildRollButtonLabel() {
        if (this.logThisFile) DialogLogger.log('debug', 'Building roll button label');
        
        try {
            const dialogType = this.getDialogType();
            const isDamageDialog = dialogType?.toLowerCase() === 'damage';
            
            if (this.logThisFile) DialogLogger.log('debug', `Dialog type: ${dialogType}, isDamageDialog: ${isDamageDialog}`);
            
            // Collect all modifiers
            const allModifiers = this.modifierManager.collectAllModifiers();
            
            if (this.logThisFile) DialogLogger.log('debug', `Collected ${allModifiers.length} modifiers`);
            
            // Add base dice for non-damage dialogs
            if (!isDamageDialog) {
                allModifiers.unshift({
                    modifier: '1d20',
                    modifierType: ''
                });
                if (this.logThisFile) DialogLogger.log('debug', 'Added base 1d20 for non-damage dialog');
            }
            
            // Group and combine modifiers
            const combinedGroups = this.modifierManager.groupAndCombineModifiers(allModifiers, dialogType);
            
            if (this.logThisFile) DialogLogger.log('debug', `Created ${combinedGroups.length} combined modifier groups`);
            
            // Build final string
            let label = `${API.localize('interface.roll_button')}: `;
            
            if (combinedGroups.length === 0) {
                if (isDamageDialog) {
                    label += '0';
                } else {
                    label += '1d20';
                }
                if (this.logThisFile) DialogLogger.log('debug', 'No modifiers, using default label');
            } else {
                const parts = combinedGroups.map(group => {
                    let part = group.modifier;
                    if (isDamageDialog && group.modifierType) {
                        part += this.getDamageTypeIcon(group.modifierType);
                    }
                    return part;
                });
                
                label += parts.join('+');
                if (this.logThisFile) DialogLogger.log('debug', `Built label with parts: ${parts.join('+')}`);
            }
            
            // Remove all spaces
            label = label.replace(/\s/g, '');
            
            if (this.logThisFile) DialogLogger.log('debug', `Final roll button label: ${label}`);
            return label;
            
        } catch (error) {
            DialogLogger.log('error', 'Failed to build roll button label', error);
            return `${API.localize('interface.roll_button')}: 1d20`;
        }
    }

    /**
     * Update the roll button label with current modifiers
     */
    updateRollButtonLabel() {
        if (this.logThisFile) DialogLogger.log('debug', 'Updating roll button label');
        
        try {
            const rollButton = this.dialogElement.querySelector('#roll-button');
            if (!rollButton) {
                if (this.logThisFile) DialogLogger.log('warning', 'Roll button not found');
                return;
            }

            const label = this.buildRollButtonLabel();
            rollButton.textContent = label;

            if (this.logThisFile) DialogLogger.log('debug', `Updated roll button label to: ${label}`);

        } catch (error) {
            DialogLogger.log('error', 'Failed to update roll button label', error);
        }
    }

    /**
     * Get damage type icon placeholder
     * @param {string} damageType - The damage type
     * @returns {string} Icon placeholder
     */
    getDamageTypeIcon(damageType) {
        const iconMap = {
            'kinetic': '[K]',
            'energy': '[E]',
            'ion': '[I]',
            'acid': '[A]',
            'cold': '[C]',
            'fire': '[F]',
            'force': '[F]',
            'lightning': '[L]',
            'necrotic': '[N]',
            'poison': '[P]',
            'psychic': '[Y]',
            'sonic': '[S]',
            'true': '[T]'
        };
        
        const icon = iconMap[damageType?.toLowerCase()] || '[?]';
        if (this.logThisFile) DialogLogger.log('debug', `Damage type icon for ${damageType}: ${icon}`);
        return icon;
    }

    /**
     * Get the current dialog type from the handler
     * @returns {string} Dialog type
     */
    getDialogType() {
        try {
            // Try to get from handler if available
            if (this.handler?.currentOptions?.dialogType) {
                return this.handler.currentOptions.dialogType;
            }
            
            // Fallback to 'attack' if not available
            if (this.logThisFile) DialogLogger.log('debug', 'Dialog type not available, defaulting to attack');
            return 'attack';
        } catch (error) {
            DialogLogger.log('error', 'Failed to get dialog type', error);
            return 'attack';
        }
    }

    /**
     * Set the handler reference for accessing dialog options
     * @param {Object} handler - The dialog handler
     */
    setHandler(handler) {
        this.handler = handler;
        if (this.logThisFile) DialogLogger.log('debug', 'Handler reference set for roll button manager');
    }

    /**
     * Enable the roll button
     */
    enableRollButton() {
        const rollButton = this.dialogElement.querySelector('#roll-button');
        if (rollButton) {
            rollButton.disabled = false;
            rollButton.classList.remove('disabled');
            if (this.logThisFile) DialogLogger.log('debug', 'Roll button enabled');
        }
    }

    /**
     * Disable the roll button
     */
    disableRollButton() {
        const rollButton = this.dialogElement.querySelector('#roll-button');
        if (rollButton) {
            rollButton.disabled = true;
            rollButton.classList.add('disabled');
            if (this.logThisFile) DialogLogger.log('debug', 'Roll button disabled');
        }
    }

    /**
     * Check if roll button is enabled
     * @returns {boolean} True if enabled
     */
    isRollButtonEnabled() {
        const rollButton = this.dialogElement.querySelector('#roll-button');
        return rollButton && !rollButton.disabled;
    }

    /**
     * Set roll button text without rebuilding the label
     * @param {string} text - The text to set
     */
    setRollButtonText(text) {
        const rollButton = this.dialogElement.querySelector('#roll-button');
        if (rollButton) {
            rollButton.textContent = text;
            if (this.logThisFile) DialogLogger.log('debug', `Set roll button text to: ${text}`);
        }
    }

    /**
     * Get current roll button text
     * @returns {string} Current button text
     */
    getRollButtonText() {
        const rollButton = this.dialogElement.querySelector('#roll-button');
        return rollButton?.textContent || '';
    }

    /**
     * Add a CSS class to the roll button
     * @param {string} className - The class name to add
     */
    addRollButtonClass(className) {
        const rollButton = this.dialogElement.querySelector('#roll-button');
        if (rollButton) {
            rollButton.classList.add(className);
            if (this.logThisFile) DialogLogger.log('debug', `Added class ${className} to roll button`);
        }
    }

    /**
     * Remove a CSS class from the roll button
     * @param {string} className - The class name to remove
     */
    removeRollButtonClass(className) {
        const rollButton = this.dialogElement.querySelector('#roll-button');
        if (rollButton) {
            rollButton.classList.remove(className);
            if (this.logThisFile) DialogLogger.log('debug', `Removed class ${className} from roll button`);
        }
    }

    /**
     * Set roll button visibility
     * @param {boolean} visible - Whether the button should be visible
     */
    setRollButtonVisibility(visible) {
        const rollButton = this.dialogElement.querySelector('#roll-button');
        if (rollButton) {
            rollButton.style.display = visible ? 'block' : 'none';
            if (this.logThisFile) DialogLogger.log('debug', `Set roll button visibility to: ${visible}`);
        }
    }

    /**
     * Check if roll button is visible
     * @returns {boolean} True if visible
     */
    isRollButtonVisible() {
        const rollButton = this.dialogElement.querySelector('#roll-button');
        return rollButton && rollButton.style.display !== 'none';
    }
}
