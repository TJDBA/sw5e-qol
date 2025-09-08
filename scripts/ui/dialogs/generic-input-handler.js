import { API } from '../../api.js';
import { getWeaponDamageData, getAllWeaponDamageParts, isSmartWeapon, getSmartWeaponData } from '../../actors/item-util.js';
import { getAbilityModifier, getWeaponAbility, getProficiencyBonus } from '../../actors/actor-util.js';

/**
 * Generic Input Handler for Dialog Components
 * Handles all component interactions that can be reused across different dialogs
 */
export class GenericInputHandler {
    constructor(dialogElement, handler = null) {
        this.dialogElement = dialogElement;
        this.handler = handler;
        this.modifiers = [];
        this.advantageType = 'normal';
        this.rollMode = 'public';
        this.selectedItem = '';
        this.selectedPreset = '';
        this.selectedAttribute = 'dexterity';
        this.rollForEachTarget = false;
        this.featureStates = {}; // Initialize feature states
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for all interactive components
     */
    setupEventListeners() {
        try {
            this.setupItemSelection();
            this.setupModifierToggles();
            this.setupAddModifierButtons();
            this.setupAdvantageRadios();
            this.setupRollModeSelect();
            this.setupRollButton();
            this.setupCollapsibleSections();
            this.setupAttributeSelect();
            this.updateRollButtonLabel();
            
            // Initialize weapon rows after all other setup
            this.initializeWeaponRows();
        } catch (error) {
            API.log('error', 'Failed to setup event listeners', error);
        }
    }

    /**
     * Setup modifier toggle checkboxes using event delegation
     */
    setupModifierToggles() {
        // Use event delegation on the dialog body to catch all toggle switches
        const dialogBody = this.dialogElement.querySelector('#dialog-body');
        if (!dialogBody) {
            API.log('warning', 'Dialog body not found');
            return;
        }
    
        // Remove any existing listeners first
        const oldClickHandler = dialogBody._clickHandler;
        const oldChangeHandler = dialogBody._changeHandler;
        if (oldClickHandler) dialogBody.removeEventListener('click', oldClickHandler);
        if (oldChangeHandler) dialogBody.removeEventListener('change', oldChangeHandler);
    
        // Create delegated click handler for toggle sliders and checkboxes
        const clickHandler = (event) => {
            // API.log('debug', 'Click event detected on:', event.target);
            // API.log('debug', 'Target classes:', event.target.className);
            
            // If clicked on the toggle-switch div, find the checkbox inside
            if (event.target.classList.contains('toggle-switch')) {
                const checkbox = event.target.querySelector('.modifier-toggle');
                if (checkbox) {
                    // API.log('debug', 'Toggling checkbox via toggle-switch click');
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
            // If clicked on the slider span, toggle the associated checkbox
            else if (event.target.classList.contains('toggle-slider')) {
                const checkbox = event.target.previousElementSibling;
                if (checkbox && checkbox.classList.contains('modifier-toggle')) {
                    // API.log('debug', 'Toggling checkbox via slider click');
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
            // If clicked directly on a modifier-toggle checkbox, let the change event handle it
            else if (event.target.classList.contains('modifier-toggle')) {
                // API.log('debug', 'Direct checkbox click detected');
                // The change event will be triggered automatically
                return;
            }
        };
    
        // Create delegated change handler for checkboxes
        const changeHandler = (event) => {
            // API.log('debug', 'Change event detected on:', event.target);
            // API.log('debug', 'Target classes:', event.target.className);
            // API.log('debug', 'Target dataset:', event.target.dataset);
            
            if (event.target.classList.contains('modifier-toggle')) {
                this.handleToggleChange(event);
            }
        };
    
        // Add delegated listeners
        dialogBody.addEventListener('click', clickHandler);
        dialogBody.addEventListener('change', changeHandler);
        
        // Store references for cleanup
        dialogBody._clickHandler = clickHandler;
        dialogBody._changeHandler = changeHandler;
    }

    /**
     * Handle toggle switch change events
     */
    handleToggleChange(event) {
        const modifierId = event.target.dataset.modifierId;
        const featureId = event.target.dataset.featureId;
        const isChecked = event.target.checked;
        
        // API.log('debug', 'Toggle switch change event detected');
        // API.log('debug', `Toggle changed - Modifier ID: ${modifierId}, Feature ID: ${featureId}, Checked: ${isChecked}`);
        
        // Handle feature toggles
        if (featureId) {
            this.handleFeatureToggle(featureId, isChecked, event);
            return;
        }
        
        // Handle modifier toggles (existing logic)
        if (modifierId) {
            // Find the row containing this toggle
            const row = event.target.closest('.modifier-row');
            if (!row) {
                API.log('warning', 'Could not find modifier row for toggle');
                return;
            }

            // Handle special case for attribute row
            if (modifierId === 'attribute') {
                // For attribute row, we don't have a modifier object, just update the row state
                // API.log('debug', 'Handling attribute row toggle');
                this.toggleRowState(row, isChecked);
                this.updateRollButtonLabel();
                return;
            }

            // Handle special case for proficiency row
            if (modifierId === 'proficiency') {
                // For proficiency row, we don't have a modifier object, just update the row state
                // API.log('debug', 'Handling proficiency row toggle');
                this.toggleRowState(row, isChecked);
                this.updateRollButtonLabel();
                return;
            }

            // Handle special case for weapon damage row
            if (modifierId === 'weapon-damage') {
                // For weapon damage row, we don't have a modifier object, just update the row state
                // API.log('debug', 'Handling weapon damage row toggle');
                this.toggleRowState(row, isChecked);
                this.updateRollButtonLabel();
                return;
            }

            // Handle special case for additional damage parts
            if (modifierId && modifierId.startsWith('additional-damage-')) {
                // For additional damage parts, we don't have a modifier object, just update the row state
                // API.log('debug', 'Handling additional damage part toggle');
                this.toggleRowState(row, isChecked);
                this.updateRollButtonLabel();
                return;
            }

            // Handle regular modifier rows
            const modifierIndex = parseInt(modifierId);
            if (modifierIndex >= 0 && modifierIndex < this.modifiers.length) {
                // API.log('debug', `Handling modifier ${modifierIndex} toggle`);
                this.modifiers[modifierIndex].isEnabled = isChecked;
                this.toggleRowState(row, isChecked);
                this.updateRollButtonLabel();
            } else {
                API.log('warning', `Invalid modifier ID: ${modifierId}`);
            }
        } else {
            API.log('warning', 'Toggle switch has neither modifier ID nor feature ID');
        }
    }

    /**
     * Toggle the visual state of a modifier row
     */
    toggleRowState(row, isEnabled) {
        if (isEnabled) {
            row.classList.remove('disabled');
        } else {
            row.classList.add('disabled');
        }
    }

    /**
     * Handle feature toggle changes
     */
    handleFeatureToggle(featureId, isChecked, event) {
        try {
            // API.log('debug', `Handling feature toggle - ID: ${featureId}, Checked: ${isChecked}`);
            
            // Find the row containing this toggle - try multiple selectors
            let row = event.target.closest('.modifier-row');
            if (!row) {
                row = event.target.closest('.feature-row');
            }
            if (!row) {
                row = event.target.closest('tr');
            }
            
            if (!row) {
                API.log('warning', 'Could not find feature row for toggle');
                return;
            }

            // Update feature state
            this.updateFeatureState(featureId, isChecked);
            
            // Update row visual state
            this.toggleRowState(row, isChecked);
            
            // Update roll button label if needed
            this.updateRollButtonLabel();
            
            // Trigger feature-specific logic if needed
            this.onFeatureToggle(featureId, isChecked);
            
        } catch (error) {
            API.log('error', `Error handling feature toggle: ${error.message}`);
        }
    }

    /**
     * Update feature state in the dialog data
     */
    updateFeatureState(featureId, isEnabled) {
        // Initialize feature state if it doesn't exist
        if (!this.featureStates) {
            this.featureStates = {};
        }
        
        // Update the specific feature state
        this.featureStates[featureId] = {
            enabled: isEnabled,
            timestamp: Date.now()
        };
        
        // API.log('debug', `Updated feature state for ${featureId}:`, this.featureStates[featureId]);
    }

    /**
     * Handle feature-specific toggle logic
     * Override in subclasses or extend as needed
     */
    onFeatureToggle(featureId, isEnabled) {
        // Default implementation - can be extended
        // API.log('debug', `Feature ${featureId} toggled to ${isEnabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Get current feature states for dialog result
     */
    getFeatureStates() {
        return this.featureStates || {};
    }

    /**
     * Set feature states from dialog data
     */
    setFeatureStates(featureStates) {
        this.featureStates = featureStates || {};
    }

    /**
     * Setup add modifier buttons
     */
    setupAddModifierButtons() {
        const addButtons = this.dialogElement.querySelectorAll('.add-modifier-btn');
        addButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                this.addModifier(index);
            });
        });
    }

    /**
     * Setup advantage radio buttons
     */
    setupAdvantageRadios() {
        const radios = this.dialogElement.querySelectorAll('.advantage-radio');
        radios.forEach(radio => {
            radio.addEventListener('change', (event) => {
                this.advantageType = event.target.value;
            });
        });
    }

    /**
     * Setup item selection
     */
    setupItemSelection() {
        const itemSelect = this.dialogElement.querySelector('#item-select');
        const presetSelect = this.dialogElement.querySelector('#preset-select');
        const savePresetBtn = this.dialogElement.querySelector('.save-preset-btn');
        const deletePresetBtn = this.dialogElement.querySelector('.delete-preset-btn');
        const attributeSelect = this.dialogElement.querySelector('#attribute-select');
        const targetRollToggle = this.dialogElement.querySelector('#target-roll-toggle');

        if (itemSelect) {
            itemSelect.addEventListener('change', async (event) => {
                this.selectedItem = event.target.value;
                
                // Update weapon-related rows when item selection changes
                if (this.handler && this.handler.currentOptions && this.handler.currentOptions.actor) {
                    await this.updateWeaponRows(this.handler.currentOptions.actor, this.selectedItem);
                    // Update roll button label after weapon change
                    this.updateRollButtonLabel();
                }
            });
        }

        if (presetSelect) {
            presetSelect.addEventListener('change', (event) => {
                this.selectedPreset = event.target.value;
            });
        }

        if (savePresetBtn) {
            savePresetBtn.addEventListener('click', () => {
                this.savePreset();
            });
        }

        if (deletePresetBtn) {
            deletePresetBtn.addEventListener('click', () => {
                this.deletePreset();
            });
        }

        if (attributeSelect) {
            attributeSelect.addEventListener('change', async (event) => {
                this.selectedAttribute = event.target.value;
                
                // Update the attribute modifier when selection changes
                if (this.handler && this.handler.currentOptions && this.handler.currentOptions.actor) {
                    await this.updateAttributeModifier(this.handler.currentOptions.actor, this.selectedAttribute);
                }
            });
        }

        if (targetRollToggle) {
            // Handle the target roll toggle the same way as modifier toggles
            const targetToggleSwitch = targetRollToggle.closest('.toggle-switch');
            if (targetToggleSwitch) {
                // Click handler for the slider
                targetToggleSwitch.addEventListener('click', (event) => {
                    if (event.target.classList.contains('toggle-slider')) {
                        targetRollToggle.checked = !targetRollToggle.checked;
                        this.rollForEachTarget = targetRollToggle.checked;
                    }
                });
                
                // Change handler for the checkbox itself
                targetRollToggle.addEventListener('change', (event) => {
                    this.rollForEachTarget = event.target.checked;
                });
            }
        }
    }

    /**
     * Setup roll mode select
     */
    setupRollModeSelect() {
        const select = this.dialogElement.querySelector('#roll-mode-select');
        if (select) {
            select.addEventListener('change', (event) => {
                this.rollMode = event.target.value;
            });
        }
    }

    /**
     * Setup roll button click handler
     */
    setupRollButton() {
        const rollButton = this.dialogElement.querySelector('#roll-button');
        if (rollButton) {
            rollButton.addEventListener('click', () => {
                // Get the result and close the dialog
                const result = this.getDialogState();
                
                // Log the returned object for debugging
                API.log('info', 'Roll button clicked - Dialog result:', result);
                
                if (this.handler && this.handler.resolveDialog) {
                    this.handler.currentDialog = null; // Clean up dialog reference
                    this.handler.resolveDialog(result);
                }
            });
        }
    }

    /**
     * Add a new modifier from the input fields
     */
    addModifier(rowIndex) {
        try {
            const row = this.dialogElement.querySelectorAll('.modifier-input-row')[rowIndex];
            if (!row) {
                API.log('error', `Modifier input row ${rowIndex} not found`);
                return;
            }

            const nameInput = row.querySelector('.modifier-name-input');
            const valueInput = row.querySelector('.modifier-value-input');
            const typeSelect = row.querySelector('.modifier-type-select');
            const diceQuantityInput = row.querySelector('.modifier-dice-quantity-input');
            const diceTypeSelect = row.querySelector('.modifier-dice-type-select');

            // Validate required elements
            if (!nameInput) {
                API.log('error', 'Name input not found in modifier row');
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
            } else if (valueInput && valueInput.value) {
                // This is a number modifier row
                modifier = parseInt(valueInput.value) >= 0 ? `${valueInput.value}` : valueInput.value;
                isDice = false;
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
            this.updateRollButtonLabel();
            this.clearInputFields(rowIndex);

        } catch (error) {
            API.log('error', 'Failed to add modifier', error);
        }
    }

    /**
     * Add modifier to the table display
     */
    addModifierToTable(modifier) {
        const tbody = this.dialogElement.querySelector('#modifiers-tbody');
        if (!tbody) return;

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
     */
    clearInputFields(rowIndex) {
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
     * Helper function to combine dice modifiers into a sorted string
     * @param {Array} diceArray - Array of dice strings (e.g., ["1d8", "1d4", "1d4", "1d6", "4d6"])
     * @returns {string} Combined dice string (e.g., "1d8+5d6+2d4")
     */
    combineDiceModifiers(diceArray) {
        if (!diceArray || diceArray.length === 0) {
            return '';
        }

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

        return combinedParts.join('+');
    }

    /**
     * Get the current dialog type from the handler
     */
    getDialogType() {
        try {
            // API.log('debug', 'Handler current options:', this.handler?.currentOptions);
            return this.handler?.currentOptions?.dialogType || 'attack';
        } catch (error) {
            API.log('error', 'Failed to get dialog type', error);
            return 'attack';
        }
    }

    /**
     * Get damage type icon placeholder
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
        return iconMap[damageType?.toLowerCase()] || '[?]';
    }

    /**
     * Collect modifiers from table rows and features
     */
    collectAllModifiers() {
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
        
        // Note: Custom modifiers are already included in the modifier table rows
        // so we don't need to add them again here
        
        return modifiers;
    }

    /**
     * Get modifier data from a modifier table row
     */
    getModifierDataFromRow(row, modifierId) {
        try {
            // Get the modifier name from the first column
            const nameCell = row.querySelector('td:nth-child(1)');
            const modifierName = nameCell?.textContent?.trim() || 'Unknown';
            
            // Handle special cases
            if (modifierId === 'weapon-damage') {
                const modifierElement = row.querySelector('.weapon-damage-modifier');
                const typeElement = row.querySelector('.weapon-damage-type');
                return {
                    name: modifierName,
                    modifier: modifierElement?.textContent?.trim() || '',
                    modifierType: typeElement?.textContent?.trim() || 'kinetic'
                };
            }
            
            // Handle additional damage parts
            if (modifierId && modifierId.startsWith('additional-damage-')) {
                const modifierElement = row.querySelector('.additional-damage-modifier');
                const typeElement = row.querySelector('.additional-damage-type');
                return {
                    name: modifierName,
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
                    name: modifierName,
                    modifier: modifier,
                    modifierType: 'Untyped'
                };
            }
            
            if (modifierId === 'attribute') {
                const modifierElement = row.querySelector('.attribute-modifier, .smart-weapon-attribute-modifier');
                const text = modifierElement?.textContent?.trim() || '';
                const modifier = text.startsWith('+') ? text : `+${text}`;
                
                return {
                    name: modifierName,
                    modifier: modifier,
                    modifierType: 'Untyped'
                };
            }
            
            // Handle custom modifier rows
            const modifierCell = row.querySelector('td:nth-child(3)');
            const typeCell = row.querySelector('td:nth-child(2)');
            
            return {
                name: modifierName,
                modifier: modifierCell?.textContent?.trim() || '',
                modifierType: typeCell?.textContent?.trim() || 'Untyped'
            };
            
        } catch (error) {
            API.log('error', 'Failed to get modifier data from row', error);
            return null;
        }
    }

    /**
     * Get feature modifier data from a feature row using stored featureData
     */
    getFeatureModifierData(row, featureId) {
        try {
            // Get feature data from the stored JSON
            const featureDataJson = row.dataset.featureData;
            if (!featureDataJson) {
                return null; // Skip if no feature data
            }
            
            const featureData = JSON.parse(featureDataJson);
            
            // Only include features that have modifiers
            if (!featureData.modifier || !featureData.modifierType) {
                return null; // Skip features without modifier data
            }
            
            return {
                modifier: featureData.modifier,
                modifierType: featureData.modifierType,
                isDice: featureData.isDice || true, // Use stored isDice or default to true
                featureName: featureData.featureName || featureId
            };
            
        } catch (error) {
            API.log('error', 'Failed to get feature modifier data', error);
            return null;
        }
    }

    /**
     * Group modifiers by type and combine them
     */
    groupAndCombineModifiers(modifiers, dialogType) {
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
                // For damage dialogs, validate modifier type against legitimate damage types
                const legitimateDamageTypes = ['kinetic','energy','ion','acid','cold','fire','force','lightning','necrotic','poison','psychic','sonic','true'];
                const modifierType = mod.modifierType || '';
                
                if (legitimateDamageTypes.includes(modifierType.toLowerCase())) {
                    groupType = modifierType.toLowerCase();
                } else {
                    // Default to base weapon damage type or kinetic if not a legitimate damage type
                    groupType = baseDamageType || 'kinetic';
                }
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
        
        return combinedGroups;
    }

    /**
     * Combine a group of modifiers
     */
    combineModifierGroup(modifiers) {
        if (!modifiers || modifiers.length === 0) return '';
        
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
        
        if (numberSum !== 0) {
            if (combined) {
                // Add + or - sign based on the number sum
                combined += numberSum >= 0 ? `+${numberSum}` : `${numberSum}`;
            } else {
                // If no dice, just add the number
                combined += `${numberSum}`;
            }
        }
        
        return combined;
    }

    /**
     * Build the final roll button label
     */
    buildRollButtonLabel() {
        try {
            const dialogType = this.getDialogType();
            const isDamageDialog = dialogType?.toLowerCase() === 'damage';
            
            // Collect all modifiers
            const allModifiers = this.collectAllModifiers();
            
            // Add base dice for non-damage dialogs
            if (!isDamageDialog) {
                allModifiers.unshift({
                    modifier: '1d20',
                    modifierType: ''
                });
            }
            
            // Group and combine modifiers
            const combinedGroups = this.groupAndCombineModifiers(allModifiers, dialogType);
            // API.log('debug', 'Combined groups', combinedGroups);
            // Build final string
            let label = `${API.localize('interface.roll_button')}: `;
            
            if (combinedGroups.length === 0) {
                if (isDamageDialog) {
                    label += '0';
                } else {
                    label += '1d20';
                }
            } else {
                const parts = combinedGroups.map(group => {
                    let part = group.modifier;
                    if (isDamageDialog && group.modifierType) {
                        part += this.getDamageTypeIcon(group.modifierType);
                    }
                    return part;
                });
                
                label += parts.join('+');
            }
            
            // Remove all spaces
            label = label.replace(/\s/g, '');
            
            // Debug logging
            // API.log('debug', `Building roll button label - Dialog type: ${dialogType}, Modifiers: ${allModifiers.length}, Groups: ${combinedGroups.length}, Label: ${label}`);
            
            return label;
            
        } catch (error) {
            API.log('error', 'Failed to build roll button label', error);
            return `${API.localize('interface.roll_button')}: 1d20`;
        }
    }

    /**
     * Update the roll button label with current modifiers
     */
    updateRollButtonLabel() {
        try {
            const rollButton = this.dialogElement.querySelector('#roll-button');
            if (!rollButton) return;

            const label = this.buildRollButtonLabel();
            rollButton.textContent = label;

        } catch (error) {
            API.log('error', 'Failed to update roll button label', error);
        }
    }

    /**
     * Get current dialog state with comprehensive output object
     */
    getDialogState() {
        try {
            const dialogType = this.getDialogType();
            const actor = this.handler?.currentOptions?.actor;
            const itemID = this.handler?.currentOptions?.itemID || this.selectedItem || 'none';
            
            return {
                ownerID: this.handler?.currentOptions?.ownerID || 'unknown',
                dialogType: dialogType,
                itemID: itemID,
                rollMode: this.rollMode,
                advantageSelection: this.advantageType || 'Normal',
                rollSeparate: this.getRollSeparateSetting(),
                saveObj: {}, // Placeholder for later
                skillObj: {}, // Placeholder for later
                modifiers: this.collectAllEnabledModifiers(),
                resourceCosts: this.collectResourceCosts(),
                enabledFeatures: this.collectEnabledFeatures(),
                targetIDs: this.collectTargetIDs()
            };
        } catch (error) {
            API.log('error', 'Failed to get dialog state', error);
            return {
                ownerID: 'unknown',
                dialogType: 'attack',
                itemID: 'none',
                rollMode: 'publicroll',
                advantageSelection: 'Normal',
                rollSeparate: false,
                saveObj: {},
                skillObj: {},
                modifiers: [],
                resourceCosts: [],
                enabledFeatures: [],
                targetIDs: []
            };
        }
    }

    /**
     * Get roll separate setting (placeholder for future implementation)
     */
    getRollSeparateSetting() {
        // TODO: Implement roll separate logic
        return false;
    }

    /**
     * Collect all enabled modifiers with comprehensive data
     */
    collectAllEnabledModifiers() {
        const modifiers = [];
        
        // Collect from regular modifier table rows (non-feature modifiers)
        const modifierRows = this.dialogElement.querySelectorAll('.modifier-row:not(.feature-row)');
        modifierRows.forEach(row => {
            const toggle = row.querySelector('.modifier-toggle');
            if (toggle && toggle.checked) {
                const modifierId = toggle.dataset.modifierId;
                const modifierData = this.getModifierDataFromRow(row, modifierId);
                if (modifierData) {
                    modifiers.push({
                        modifierName: modifierData.name || 'Unknown',
                        modifier: modifierData.modifier,
                        modifierType: modifierData.modifierType,
                        // No featureName for regular modifiers
                    });
                }
            }
        });
        
        // Collect from features table rows (feature-specific modifiers)
        const featureRows = this.dialogElement.querySelectorAll('.feature-row');
        featureRows.forEach(row => {
            const toggle = row.querySelector('.modifier-toggle');
            if (toggle && toggle.checked) {
                const featureId = toggle.dataset.featureId;
                const modifierData = this.getFeatureModifierData(row, featureId);
                if (modifierData) {
                    modifiers.push({
                        modifierName: modifierData.featureName || featureId,
                        modifier: modifierData.modifier,
                        modifierType: modifierData.modifierType,
                        featureName: modifierData.featureName
                    });
                }
            }
        });
        
        return modifiers;
    }

    /**
     * Collect resource costs by type
     */
    collectResourceCosts() {
        const resourceCosts = {};
        
        // Collect from enabled features
        const featureRows = this.dialogElement.querySelectorAll('.feature-row');
        featureRows.forEach(row => {
            const toggle = row.querySelector('.modifier-toggle');
            if (toggle && toggle.checked) {
                const featureDataJson = row.dataset.featureData;
                if (featureDataJson) {
                    try {
                        const featureData = JSON.parse(featureDataJson);
                        if (featureData.resourceName && featureData.resourceCost) {
                            const resourceType = featureData.resourceName;
                            resourceCosts[resourceType] = (resourceCosts[resourceType] || 0) + featureData.resourceCost;
                        }
                    } catch (error) {
                        API.log('error', 'Failed to parse feature data for resource costs', error);
                    }
                }
            }
        });
        
        // Convert to array format
        return Object.entries(resourceCosts).map(([type, sumCost]) => ({
            type,
            sumCost
        }));
    }

    /**
     * Collect all enabled features
     */
    collectEnabledFeatures() {
        const enabledFeatures = [];
        
        const featureRows = this.dialogElement.querySelectorAll('.feature-row');
        featureRows.forEach(row => {
            const toggle = row.querySelector('.modifier-toggle');
            if (toggle && toggle.checked) {
                const featureDataJson = row.dataset.featureData;
                if (featureDataJson) {
                    try {
                        const featureData = JSON.parse(featureDataJson);
                        enabledFeatures.push({
                            featureId: row.dataset.featureId,
                            featureName: featureData.featureName,
                            enabled: featureData.enabled,
                            resourceCost: featureData.resourceCost,
                            resourceName: featureData.resourceName
                        });
                    } catch (error) {
                        API.log('error', 'Failed to parse feature data for enabled features', error);
                    }
                }
            }
        });
        
        return enabledFeatures;
    }

    /**
     * Collect all selected target IDs on canvas
     */
    collectTargetIDs() {
        try {
            // Get all selected tokens on the canvas
            const selectedTokens = canvas.tokens.controlled;
            return selectedTokens.map(token => token.id);
        } catch (error) {
            API.log('error', 'Failed to collect target IDs', error);
            return [];
        }
    }

    /**
     * Set initial modifiers
     */
    setModifiers(modifiers) {
        this.modifiers = modifiers || [];
        
        // Initialize toggle states for existing modifier rows
        this.initializeToggleStates();
        this.updateRollButtonLabel();
    }

    /**
     * Initialize toggle states for existing modifier rows
     */
    initializeToggleStates() {
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
     * Save preset (placeholder)
     */
    savePreset() {
        API.notify('Save preset functionality will be implemented later', 'info');
    }

    /**
     * Delete preset (placeholder)
     */
    deletePreset() {
        API.notify('Delete preset functionality will be implemented later', 'info');
    }

    /**
     * Setup collapsible section functionality
     */
    setupCollapsibleSections() {
        // Handle section header clicks
        this.dialogElement.addEventListener('click', (event) => {
            if (event.target.closest('.section-header')) {
                const header = event.target.closest('.section-header');
                const sectionName = header.dataset.section;
                const content = this.dialogElement.querySelector(`[data-section="${sectionName}-content"]`);
                const toggle = header.querySelector('.section-toggle');
                
                if (content && toggle) {
                    const isCollapsed = content.style.display === 'none';
                    
                    if (isCollapsed) {
                        content.style.display = 'block';
                        toggle.textContent = '▼';
                        toggle.style.transform = 'rotate(0deg)';
                    } else {
                        content.style.display = 'none';
                        toggle.textContent = '▶';
                        toggle.style.transform = 'rotate(0deg)';
                    }
                }
            }
        });
    }


    /**
     * Update attribute modifier when selection changes
     */
    async updateAttributeModifier(actor, ability) {
        try {
            const attributeRow = this.dialogElement.querySelector('.attribute-row');
            if (!attributeRow) return;

            const modifierElement = attributeRow.querySelector('.attribute-modifier');
            if (!modifierElement) return;

            const modifier = await getAbilityModifier(actor, ability);
            modifierElement.textContent = modifier;
            
            // Update roll button label after attribute change
            this.updateRollButtonLabel();
        } catch (error) {
            API.log('error', 'Failed to update attribute modifier', error);
        }
    }






    /**
     * Update weapon damage row
     */
    updateWeaponDamageRow(actor, itemID) {
        try {
            const weaponDamageData = getWeaponDamageData(actor, itemID);
            const weaponDamageRow = this.dialogElement.querySelector('.weapon-damage-row');
            
            if (!weaponDamageRow) return;

            const typeElement = weaponDamageRow.querySelector('.weapon-damage-type');
            const modifierElement = weaponDamageRow.querySelector('.weapon-damage-modifier');
            const toggle = weaponDamageRow.querySelector('.modifier-toggle');

            if (typeElement) typeElement.textContent = weaponDamageData.type;
            if (modifierElement) modifierElement.textContent = weaponDamageData.modifier;
            if (toggle) toggle.checked = weaponDamageData.isEnabled;

            // Update row state
            this.toggleRowState(weaponDamageRow, weaponDamageData.isEnabled);
        } catch (error) {
            API.log('error', 'Failed to update weapon damage row', error);
        }
    }

    /**
     * Update additional damage parts rows
     */
    updateAdditionalDamageParts(actor, itemID) {
        try {
            const additionalDamageParts = getAllWeaponDamageParts(actor, itemID).filter(part => !part.isBaseDamage);
            const tbody = this.dialogElement.querySelector('#modifiers-tbody');
            
            if (!tbody) return;

            // Remove existing additional damage rows
            const existingRows = tbody.querySelectorAll('.additional-damage-row');
            existingRows.forEach(row => row.remove());

            // Find the position after the attribute row
            const attributeRow = tbody.querySelector('.attribute-row');
            if (!attributeRow) return;

            // Combine damage parts by type
            const combinedDamageParts = this.combineAdditionalDamageParts(additionalDamageParts);

            // Insert new additional damage rows after the attribute row
            combinedDamageParts.forEach((combinedPart, index) => {
                const row = document.createElement('tr');
                row.className = 'modifier-row additional-damage-row';
                row.dataset.modifierId = `additional-damage-${index}`;

                row.innerHTML = `
                    <td>
                        <span class="additional-damage-description">Additional Weapon Damage (${combinedPart.type})</span>
                    </td>
                    <td>
                        <span class="additional-damage-type">${combinedPart.type}</span>
                    </td>
                    <td>
                        <span class="additional-damage-modifier">${combinedPart.modifier}</span>
                    </td>
                    <td>
                        <div class="toggle-switch">
                            <input type="checkbox" class="modifier-toggle" checked data-modifier-id="additional-damage-${index}">
                            <span class="toggle-slider"></span>
                        </div>
                    </td>
                `;

                // Insert after the attribute row
                attributeRow.insertAdjacentElement('afterend', row);
            });

            API.log('debug', `Updated ${combinedDamageParts.length} combined additional damage parts`);
        } catch (error) {
            API.log('error', 'Failed to update additional damage parts', error);
        }
    }

    /**
     * Combine additional damage parts by type
     */
    combineAdditionalDamageParts(damageParts) {
        try {
            if (!damageParts || damageParts.length === 0) {
                return [];
            }

            // Group damage parts by type
            const groups = {};
            damageParts.forEach(part => {
                const type = part.type || 'Untyped';
                if (!groups[type]) {
                    groups[type] = [];
                }
                groups[type].push(part);
            });

            // Combine each group
            const combinedParts = [];
            Object.keys(groups).forEach(type => {
                const parts = groups[type];
                const combined = this.combineModifierGroup(parts.map(part => ({
                    modifier: part.modifier,
                    isDice: part.modifier.includes('d')
                })));
                
                if (combined && combined.trim() !== '') {
                    combinedParts.push({
                        type: type,
                        modifier: combined
                    });
                }
            });

            return combinedParts;
        } catch (error) {
            API.log('error', 'Failed to combine additional damage parts', error);
            return [];
        }
    }

    /**
     * Update proficiency row
     */
    async updateProficiencyRow(actor, itemID) {
        try {
            const isSmart = isSmartWeapon(actor, itemID);
            const proficiencyBonus = await getProficiencyBonus(actor);
            const proficiencyRow = this.dialogElement.querySelector('.proficiency-row');
            
            if (!proficiencyRow) return;

            const descriptionElement = proficiencyRow.querySelector('.proficiency-description');
            const modifierElement = proficiencyRow.querySelector('.proficiency-modifier');
            const smartInput = proficiencyRow.querySelector('.smart-weapon-proficiency-input');

            if (descriptionElement) {
                descriptionElement.textContent = isSmart ? 'Smart Weapon' : '';
            }

            if (modifierElement) {
                if (isSmart) {
                    modifierElement.style.display = 'none';
                    if (smartInput) {
                        smartInput.style.display = 'inline-block';
                        smartInput.value = proficiencyBonus;
                    }
                } else {
                    modifierElement.style.display = 'inline-block';
                    modifierElement.textContent = `+${proficiencyBonus}`;
                    if (smartInput) {
                        smartInput.style.display = 'none';
                    }
                }
            }
        } catch (error) {
            API.log('error', 'Failed to update proficiency row', error);
        }
    }

    /**
     * Update attribute row for smart weapons
     */
    async updateAttributeRow(actor, itemID) {
        try {
            const isSmart = isSmartWeapon(actor, itemID);
            const attributeRow = this.dialogElement.querySelector('.attribute-row');
            
            if (!attributeRow) return;

            const attributeCell = attributeRow.querySelector('td:first-child');
            const modifierCell = attributeRow.querySelector('td:nth-child(3)');
            const toggle = attributeRow.querySelector('.modifier-toggle');

            if (isSmart) {
                const smartWeaponData = await getSmartWeaponData(actor, itemID);
                if (smartWeaponData) {
                    // Replace dropdown with smart weapon display
                    attributeCell.innerHTML = `
                        <span class="smart-weapon-attribute-description">Smart Weapon Dex: ${smartWeaponData.dex}</span>
                    `;
                    
                    if (modifierCell) {
                        modifierCell.innerHTML = `
                            <span class="smart-weapon-attribute-modifier">${smartWeaponData.dexModifier >= 0 ? '+' : ''}${smartWeaponData.dexModifier}</span>
                        `;
                    }
                }
            } else {
                // Get weapon ability and determine if attribute should be disabled
                const weaponAbility = await getWeaponAbility(actor, itemID);
                const attributeDisabled = weaponAbility === 'none';
                
                // Restore normal attribute dropdown
                attributeCell.innerHTML = `
                    <label class="attribute-label">${game.i18n.localize("SW5E-QOL.interface.attribute")}:</label>
                    <select class="attribute-select" id="attribute-select">
                        <option value="str" ${weaponAbility === 'str' ? 'selected' : ''}>${game.i18n.localize("SW5E-QOL.attributes.str")}</option>
                        <option value="dex" ${weaponAbility === 'dex' ? 'selected' : ''}>${game.i18n.localize("SW5E-QOL.attributes.dex")}</option>
                        <option value="con" ${weaponAbility === 'con' ? 'selected' : ''}>${game.i18n.localize("SW5E-QOL.attributes.con")}</option>
                        <option value="int" ${weaponAbility === 'int' ? 'selected' : ''}>${game.i18n.localize("SW5E-QOL.attributes.int")}</option>
                        <option value="wis" ${weaponAbility === 'wis' ? 'selected' : ''}>${game.i18n.localize("SW5E-QOL.attributes.wis")}</option>
                        <option value="cha" ${weaponAbility === 'cha' ? 'selected' : ''}>${game.i18n.localize("SW5E-QOL.attributes.cha")}</option>
                        <option value="none" ${weaponAbility === 'none' ? 'selected' : ''}>${game.i18n.localize("SW5E-QOL.attributes.none")}</option>
                    </select>
                `;
                
                if (modifierCell) {
                    const abilityModifier = await getAbilityModifier(actor, weaponAbility);
                    modifierCell.innerHTML = `<span class="attribute-modifier">${abilityModifier}</span>`;
                }

                // Update toggle state
                if (toggle) {
                    //toggle.disabled = attributeDisabled;
                    toggle.checked = !attributeDisabled;
                }

                // Re-setup the attribute select event listener
                this.setupAttributeSelect();
            }
        } catch (error) {
            API.log('error', 'Failed to update attribute row', error);
        }
    }

    /**
     * Update all weapon-related rows when item selection changes
     */
    async updateWeaponRows(actor, itemID) {
        try {
            this.updateWeaponDamageRow(actor, itemID);
            this.updateAdditionalDamageParts(actor, itemID);
            await this.updateProficiencyRow(actor, itemID);
            await this.updateAttributeRow(actor, itemID);
        } catch (error) {
            API.log('error', 'Failed to update weapon rows', error);
        }
    }

    /**
     * Initialize weapon rows with default data
     */
    async initializeWeaponRows() {
        try {
            if (this.handler && this.handler.currentOptions && this.handler.currentOptions.actor) {
                const actor = this.handler.currentOptions.actor;
                let effectiveItemID = this.selectedItem || this.handler.currentOptions.itemID;
                
                // If no itemID provided, get the default selection from the dropdown
                if (!effectiveItemID) {
                    const itemSelect = this.dialogElement.querySelector('#item-select');
                    if (itemSelect) {
                        effectiveItemID = itemSelect.value || '';
                    }
                }
                
                await this.updateWeaponRows(actor, effectiveItemID);
            }
        } catch (error) {
            API.log('error', 'Failed to initialize weapon rows', error);
        }
    }

    /**
     * Setup attribute select dropdown
     */
    setupAttributeSelect() {
        const attributeSelect = this.dialogElement.querySelector('#attribute-select');
        if (attributeSelect) {
            // Remove existing listeners
            attributeSelect.removeEventListener('change', this.handleAttributeChange);
            
            // Add new listener
            this.handleAttributeChange = (event) => {
                this.selectedAttribute = event.target.value;
                
                // Update the attribute modifier
                if (this.handler && this.handler.currentOptions && this.handler.currentOptions.actor) {
                    this.updateAttributeModifier(this.handler.currentOptions.actor, this.selectedAttribute);
                }
            };
            
            attributeSelect.addEventListener('change', this.handleAttributeChange);
        }
    }
}
