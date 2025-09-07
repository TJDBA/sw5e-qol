import { DialogLogger } from './dialog-logger.js';
import { API } from '../../api.js';

/**
 * Dialog Modifier Manager
 * Handles all modifier-related functionality for dialogs
 */
export class DialogModifierManager {
    constructor(dialogElement) {
        this.dialogElement = dialogElement;
        this.modifiers = [];
        this.logThisFile = false;
    }

    /**
     * Add a new modifier from the input fields
     * @param {number} rowIndex - Index of the input row
     */
    addModifier(rowIndex) {
        if (this.logThisFile) DialogLogger.log('debug', `Adding modifier from row ${rowIndex}`);
        
        try {
            const row = this.dialogElement.querySelectorAll('.modifier-input-row')[rowIndex];
            if (!row) {
                if (this.logThisFile) DialogLogger.log('error', `Modifier input row ${rowIndex} not found`);
                return;
            }

            const nameInput = row.querySelector('.modifier-name-input');
            const valueInput = row.querySelector('.modifier-value-input');
            const typeSelect = row.querySelector('.modifier-type-select');
            const diceQuantityInput = row.querySelector('.modifier-dice-quantity-input');
            const diceTypeSelect = row.querySelector('.modifier-dice-type-select');

            // Validate required elements
            if (!nameInput) {
                if (this.logThisFile) DialogLogger.log('error', 'Name input not found in modifier row');
                return;
            }

            const name = nameInput.value.trim();
            if (!name) {
                API.notify('Please enter a modifier name', 'warning');
                return;
            }

            // Determine if this is a dice modifier or number modifier
            let modifier, isDice;
            if (diceQuantityInput && diceTypeSelect && diceQuantityInput.value && diceTypeSelect.value) {
                // This is a dice modifier row
                const quantity = parseInt(diceQuantityInput.value) || 1;
                const dieType = diceTypeSelect.value;
                modifier = `${quantity}${dieType}`;
                isDice = true;
                if (this.logThisFile) DialogLogger.log('debug', `Created dice modifier: ${modifier}`);
            } else if (valueInput && valueInput.value) {
                // This is a number modifier row
                modifier = parseInt(valueInput.value) >= 0 ? `${valueInput.value}` : valueInput.value;
                isDice = false;
                if (this.logThisFile) DialogLogger.log('debug', `Created number modifier: ${modifier}`);
            } else {
                API.notify('Please enter a modifier value or select dice quantity and type', 'warning');
                return;
            }

            const type = typeSelect ? typeSelect.value : 'Untyped';

            const modifierObj = {
                name,
                type,
                modifier,
                isEnabled: true,
                isDice
            };

            this.modifiers.push(modifierObj);
            this.addModifierToTable(modifierObj);
            this.clearInputFields(rowIndex);

            if (this.logThisFile) DialogLogger.log('debug', `Successfully added modifier: ${name} (${modifier})`);

        } catch (error) {
            DialogLogger.log('error', 'Failed to add modifier', error);
        }
    }

    /**
     * Add modifier to the table display
     * @param {Object} modifier - Modifier object to add
     */
    addModifierToTable(modifier) {
        if (this.logThisFile) DialogLogger.log('debug', `Adding modifier to table: ${modifier.name}`);
        
        const tbody = this.dialogElement.querySelector('#modifiers-tbody');
        if (!tbody) {
            if (this.logThisFile) DialogLogger.log('warning', 'Modifiers table body not found');
            return;
        }

        const row = document.createElement('tr');
        row.className = 'modifier-row';
        row.dataset.modifierId = this.modifiers.length - 1;

        // Set initial disabled state if modifier is not enabled
        if (!modifier.isEnabled) {
            row.classList.add('disabled');
        }

        row.innerHTML = `
            <td>${modifier.name}</td>
            <td>${modifier.type}</td>
            <td>${modifier.modifier}</td>
            <td>
                <div class="toggle-switch">
                    <input type="checkbox" class="modifier-toggle" ${modifier.isEnabled ? 'checked' : ''} data-modifier-id="${this.modifiers.length - 1}">
                    <span class="toggle-slider"></span>
                </div>
            </td>
        `;

        tbody.appendChild(row);
        // Event delegation handles new toggles automatically
    }

    /**
     * Clear input fields after adding modifier
     * @param {number} rowIndex - Index of the input row to clear
     */
    clearInputFields(rowIndex) {
        if (this.logThisFile) DialogLogger.log('debug', `Clearing input fields for row ${rowIndex}`);
        
        const row = this.dialogElement.querySelectorAll('.modifier-input-row')[rowIndex];
        if (!row) return;

        const nameInput = row.querySelector('.modifier-name-input');
        const valueInput = row.querySelector('.modifier-value-input');
        const diceQuantityInput = row.querySelector('.modifier-dice-quantity-input');
        const diceTypeSelect = row.querySelector('.modifier-dice-type-select');

        if (nameInput) nameInput.value = '';
        if (valueInput) valueInput.value = '';
        if (diceQuantityInput) diceQuantityInput.value = '1'; // Reset to default value
        if (diceTypeSelect) diceTypeSelect.selectedIndex = 0; // Reset to first option
    }

    /**
     * Collect modifiers from table rows and features
     * @returns {Array} Array of active modifiers
     */
    collectAllModifiers() {
        if (this.logThisFile) DialogLogger.log('debug', 'Collecting all modifiers');
        
        const modifiers = [];
        
        // Collect from modifier table rows
        const modifierRows = this.dialogElement.querySelectorAll('.modifier-row');
        modifierRows.forEach(row => {
            const toggle = row.querySelector('.modifier-toggle');
            if (toggle && toggle.checked) {
                const modifierId = toggle.dataset.modifierId;
                const modifierData = this.getModifierDataFromRow(row, modifierId);
                if (modifierData) {
                    modifiers.push(modifierData);
                }
            }
        });
        
        // Collect from features table rows
        const featureRows = this.dialogElement.querySelectorAll('.feature-row');
        featureRows.forEach(row => {
            const toggle = row.querySelector('.modifier-toggle');
            if (toggle && toggle.checked) {
                const featureId = toggle.dataset.featureId;
                const modifierData = this.getFeatureModifierData(row, featureId);
                if (modifierData) {
                    modifiers.push(modifierData);
                }
            }
        });
        
        if (this.logThisFile) DialogLogger.log('debug', `Collected ${modifiers.length} active modifiers`);
        return modifiers;
    }

    /**
     * Get modifier data from a modifier table row
     * @param {HTMLElement} row - The table row element
     * @param {string} modifierId - The modifier ID
     * @returns {Object|null} Modifier data object
     */
    getModifierDataFromRow(row, modifierId) {
        if (this.logThisFile) DialogLogger.log('debug', `Getting modifier data from row, modifierId: ${modifierId}`);
        
        try {
            // Handle special cases
            if (modifierId === 'weapon-damage') {
                const modifierElement = row.querySelector('.weapon-damage-modifier');
                const typeElement = row.querySelector('.weapon-damage-type');
                return {
                    modifier: modifierElement?.textContent?.trim() || '',
                    modifierType: typeElement?.textContent?.trim() || 'kinetic'
                };
            }
            
            if (modifierId === 'proficiency') {
                const modifierElement = row.querySelector('.proficiency-modifier');
                const smartInput = row.querySelector('.smart-weapon-proficiency-input');
                
                let modifier = '';
                if (smartInput && smartInput.style.display !== 'none') {
                    const value = smartInput.value || '0';
                    modifier = value.startsWith('+') ? value : `+${value}`;
                } else {
                    const text = modifierElement?.textContent?.trim() || '';
                    modifier = text.startsWith('+') ? text : `+${text}`;
                }
                
                return {
                    modifier: modifier,
                    modifierType: 'Untyped'
                };
            }
            
            if (modifierId === 'attribute') {
                const modifierElement = row.querySelector('.attribute-modifier, .smart-weapon-attribute-modifier');
                const text = modifierElement?.textContent?.trim() || '';
                const modifier = text.startsWith('+') ? text : `+${text}`;
                
                return {
                    modifier: modifier,
                    modifierType: 'Untyped'
                };
            }
            
            // Handle custom modifier rows
            const modifierCell = row.querySelector('td:nth-child(3)');
            const typeCell = row.querySelector('td:nth-child(2)');
            
            return {
                modifier: modifierCell?.textContent?.trim() || '',
                modifierType: typeCell?.textContent?.trim() || 'Untyped'
            };
            
        } catch (error) {
            DialogLogger.log('error', 'Failed to get modifier data from row', error);
            return null;
        }
    }

    /**
     * Get feature modifier data from a feature row
     * @param {HTMLElement} row - The feature row element
     * @param {string} featureId - The feature ID
     * @returns {Object|null} Feature modifier data
     */
    getFeatureModifierData(row, featureId) {
        if (this.logThisFile) DialogLogger.log('debug', `Getting feature modifier data, featureId: ${featureId}`);
        
        try {
            // Look for modifier element in the feature row
            const modifierElement = row.querySelector('.modifier-element, .feature-modifier');
            if (!modifierElement) {
                return null; // Skip if no modifier element
            }
            
            const modifier = modifierElement.textContent?.trim() || '';
            const modifierType = modifierElement.dataset.type || 'Untyped';
            const isDice = modifierElement.dataset.isDice === 'true';
            
            return {
                modifier: modifier,
                modifierType: modifierType,
                isDice: isDice
            };
            
        } catch (error) {
            DialogLogger.log('error', 'Failed to get feature modifier data', error);
            return null;
        }
    }

    /**
     * Group modifiers by type and combine them
     * @param {Array} modifiers - Array of modifiers to group
     * @param {string} dialogType - Type of dialog
     * @returns {Array} Array of combined modifier groups
     */
    groupAndCombineModifiers(modifiers, dialogType) {
        if (this.logThisFile) DialogLogger.log('debug', `Grouping and combining ${modifiers.length} modifiers for dialog type: ${dialogType}`);
        
        const isDamageDialog = dialogType?.toLowerCase() === 'damage';
        const groups = {};
        
        // Get base weapon damage type for damage dialogs
        let baseDamageType = 'kinetic';
        if (isDamageDialog) {
            const baseWeaponRow = this.dialogElement.querySelector('.weapon-damage-row');
            if (baseWeaponRow) {
                const typeElement = baseWeaponRow.querySelector('.weapon-damage-type');
                baseDamageType = typeElement?.textContent?.trim() || 'kinetic';
            }
        }
        
        // Group modifiers
        modifiers.forEach(mod => {
            if (!mod.modifier || mod.modifier.trim() === '') return;
            
            let groupType;
            if (isDamageDialog) {
                // For damage dialogs, use the modifier type or default to base damage type
                groupType = mod.modifierType || baseDamageType;
            } else {
                // For non-damage dialogs, group all together
                groupType = 'main';
            }
            
            if (!groups[groupType]) {
                groups[groupType] = [];
            }
            
            groups[groupType].push(mod);
        });
        
        // Combine each group
        const combinedGroups = [];
        
        if (isDamageDialog) {
            // For damage dialogs, process base damage type first, then others alphabetically
            const sortedTypes = Object.keys(groups).sort((a, b) => {
                if (a === baseDamageType) return -1;
                if (b === baseDamageType) return 1;
                return a.localeCompare(b);
            });
            
            sortedTypes.forEach(type => {
                const combined = this.combineModifierGroup(groups[type]);
                if (combined) {
                    combinedGroups.push({
                        modifier: combined,
                        modifierType: type
                    });
                }
            });
        } else {
            // For non-damage dialogs, combine all into one group
            const allModifiers = Object.values(groups).flat();
            const combined = this.combineModifierGroup(allModifiers);
            if (combined) {
                combinedGroups.push({
                    modifier: combined,
                    modifierType: ''
                });
            }
        }
        
        if (this.logThisFile) DialogLogger.log('debug', `Created ${combinedGroups.length} combined modifier groups`);
        return combinedGroups;
    }

    /**
     * Combine a group of modifiers
     * @param {Array} modifiers - Array of modifiers to combine
     * @returns {string} Combined modifier string
     */
    combineModifierGroup(modifiers) {
        if (!modifiers || modifiers.length === 0) return '';
        
        if (this.logThisFile) DialogLogger.log('debug', `Combining ${modifiers.length} modifiers in group`);
        
        // Separate dice and number modifiers
        const diceModifiers = [];
        const numberModifiers = [];
        
        modifiers.forEach(mod => {
            if (mod.isDice || mod.modifier.includes('d')) {
                diceModifiers.push(mod.modifier);
            } else {
                numberModifiers.push(mod.modifier);
            }
        });
        
        // Combine dice modifiers
        const combinedDice = this.combineDiceModifiers(diceModifiers);

        // Sum number modifiers
        const numberSum = numberModifiers.reduce((sum, mod) => {
            const value = parseInt(mod) || 0;  // Parse directly, preserving sign
            return sum + value;
        }, 0);

        // Build combined string
        let combined = '';
        
        if (combinedDice) {
            combined += combinedDice;
        }

        if (numberSum > 0) {
            combined += `+${numberSum}`;
        } else if (numberSum < 0) {
            combined += `${numberSum}`;
        }
        
        if (this.logThisFile) DialogLogger.log('debug', `Combined modifier group result: ${combined}`);
        return combined;
    }

    /**
     * Helper function to combine dice modifiers into a sorted string
     * @param {Array} diceArray - Array of dice strings (e.g., ["1d8", "1d4", "1d4", "1d6", "4d6"])
     * @returns {string} Combined dice string (e.g., "1d8+5d6+2d4")
     */
    combineDiceModifiers(diceArray) {
        if (!diceArray || diceArray.length === 0) {
            return '';
        }

        if (this.logThisFile) DialogLogger.log('debug', `Combining ${diceArray.length} dice modifiers:`, diceArray);

        // Parse and group dice by type
        const diceGroups = {};
        
        diceArray.forEach(diceString => {
            // Parse dice string (e.g., "2d8" -> quantity: 2, type: "d8")
            const match = diceString.match(/^(\d+)(d\d+)$/);
            if (match) {
                const quantity = parseInt(match[1]);
                const dieType = match[2];
                
                if (diceGroups[dieType]) {
                    diceGroups[dieType] += quantity;
                } else {
                    diceGroups[dieType] = quantity;
                }
            }
        });

        // Sort die types from highest to lowest (d20, d12, d10, d8, d6, d4)
        const dieTypeOrder = ['d20', 'd12', 'd10', 'd8', 'd6', 'd4'];
        const sortedDieTypes = Object.keys(diceGroups).sort((a, b) => {
            const indexA = dieTypeOrder.indexOf(a);
            const indexB = dieTypeOrder.indexOf(b);
            return indexA - indexB; // Lower index = higher die type
        });

        // Build combined string
        const combinedParts = sortedDieTypes.map(dieType => {
            const quantity = diceGroups[dieType];
            return `${quantity}${dieType}`;
        });

        const result = combinedParts.join('+');
        if (this.logThisFile) DialogLogger.log('debug', `Combined dice result: ${result}`);
        return result;
    }

    /**
     * Set initial modifiers
     * @param {Array} modifiers - Array of initial modifiers
     */
    setModifiers(modifiers) {
        if (this.logThisFile) DialogLogger.log('debug', `Setting ${modifiers?.length || 0} initial modifiers`);
        
        this.modifiers = modifiers || [];
        
        // Initialize toggle states for existing modifier rows
        this.initializeToggleStates();
    }

    /**
     * Initialize toggle states for existing modifier rows
     */
    initializeToggleStates() {
        if (this.logThisFile) DialogLogger.log('debug', 'Initializing toggle states for modifier rows');
        
        const rows = this.dialogElement.querySelectorAll('.modifier-row');
        rows.forEach(row => {
            const modifierId = row.dataset.modifierId;
            
            if (modifierId === 'attribute') {
                // Attribute row is always enabled by default
                this.toggleRowState(row, true);
                return;
            }
            
            const modifierIndex = parseInt(modifierId);
            if (modifierIndex >= 0 && modifierIndex < this.modifiers.length) {
                const isEnabled = this.modifiers[modifierIndex].isEnabled;
                this.toggleRowState(row, isEnabled);
                
                // Update the toggle switch state
                const toggle = row.querySelector('.modifier-toggle');
                if (toggle) {
                    toggle.checked = isEnabled;
                }
            }
        });
    }

    /**
     * Toggle the visual state of a modifier row
     * @param {HTMLElement} row - The row element
     * @param {boolean} isEnabled - Whether the row is enabled
     */
    toggleRowState(row, isEnabled) {
        if (isEnabled) {
            row.classList.remove('disabled');
        } else {
            row.classList.add('disabled');
        }
    }
}
