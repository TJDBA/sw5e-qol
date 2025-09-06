import { API } from '../../api.js';

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
            this.updateRollButtonLabel();
        } catch (error) {
            API.log('error', 'Failed to setup event listeners', error);
        }
    }

    /**
     * Setup modifier toggle checkboxes using event delegation
     */
    setupModifierToggles() {
        // Use event delegation on the parent table instead of individual listeners
        const modifiersTable = this.dialogElement.querySelector('.modifiers-table');
        if (!modifiersTable) {
            API.log('warning', 'Modifiers table not found');
            return;
        }
    
        // Remove any existing listeners first
        const oldClickHandler = modifiersTable._clickHandler;
        const oldChangeHandler = modifiersTable._changeHandler;
        if (oldClickHandler) modifiersTable.removeEventListener('click', oldClickHandler);
        if (oldChangeHandler) modifiersTable.removeEventListener('change', oldChangeHandler);
    
        // Create delegated click handler for toggle sliders
        const clickHandler = (event) => {
            // If clicked on the slider span, toggle the associated checkbox
            if (event.target.classList.contains('toggle-slider')) {
                const checkbox = event.target.previousElementSibling;
                if (checkbox && checkbox.classList.contains('modifier-toggle')) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        };
    
        // Create delegated change handler for checkboxes
        const changeHandler = (event) => {
            if (event.target.classList.contains('modifier-toggle')) {
                this.handleToggleChange(event);
            }
        };
    
        // Add delegated listeners
        modifiersTable.addEventListener('click', clickHandler);
        modifiersTable.addEventListener('change', changeHandler);
        
        // Store references for cleanup
        modifiersTable._clickHandler = clickHandler;
        modifiersTable._changeHandler = changeHandler;
    }

    /**
     * Handle toggle switch change events
     */
    handleToggleChange(event) {
        const modifierId = event.target.dataset.modifierId;
        const isChecked = event.target.checked;
        

        API.log('debug', 'Toggle switch change event detected');
        API.log('debug', `Toggle changed - ID: ${modifierId}, Checked: ${isChecked}`);
        
        // Find the row containing this toggle
        const row = event.target.closest('.modifier-row');
        if (!row) {
            API.log('warning', 'Could not find modifier row for toggle');
            return;
        }

        // Handle special case for attribute row
        if (modifierId === 'attribute') {
            // For attribute row, we don't have a modifier object, just update the row state
            API.log('debug', 'Handling attribute row toggle');
            this.toggleRowState(row, isChecked);
            this.updateRollButtonLabel();
            return;
        }

        // Handle regular modifier rows
        const modifierIndex = parseInt(modifierId);
        if (modifierIndex >= 0 && modifierIndex < this.modifiers.length) {
            API.log('debug', `Handling modifier ${modifierIndex} toggle`);
            this.modifiers[modifierIndex].isEnabled = isChecked;
            this.toggleRowState(row, isChecked);
            this.updateRollButtonLabel();
        } else {
            API.log('warning', `Invalid modifier ID: ${modifierId}`);
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
            itemSelect.addEventListener('change', (event) => {
                this.selectedItem = event.target.value;
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
            attributeSelect.addEventListener('change', (event) => {
                this.selectedAttribute = event.target.value;
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
                modifier = parseInt(valueInput.value) >= 0 ? `+${valueInput.value}` : valueInput.value;
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
     * Update the roll button label with current modifiers
     */
    updateRollButtonLabel() {
        try {
            const rollButton = this.dialogElement.querySelector('#roll-button');
            if (!rollButton) return;

            const enabledModifiers = this.modifiers.filter(m => m.isEnabled);
            if (enabledModifiers.length === 0) {
                rollButton.textContent = `${API.localize('interface.roll_button')}: 1d20`;
                return;
            }

            const diceModifiers = enabledModifiers.filter(m => m.isDice);
            const numberModifiers = enabledModifiers.filter(m => !m.isDice);

            // Use helper function to combine dice modifiers
            const diceArray = diceModifiers.map(m => m.modifier);
            const combinedDice = this.combineDiceModifiers(diceArray);

            // Sum number modifiers
            const numberSum = numberModifiers.reduce((sum, m) => {
                return sum + parseInt(m.modifier.replace(/[+-]/g, ''));
            }, 0);

            // Build label
            let label = `${API.localize('interface.roll_button')}: 1d20`;
            
            // Add combined dice
            if (combinedDice) {
                label += `+${combinedDice}`;
            }

            // Add numbers
            if (numberSum > 0) {
                label += `+${numberSum}`;
            } else if (numberSum < 0) {
                label += `${numberSum}`;
            } else if (numberSum === 0 && (diceModifiers.length > 0 || numberModifiers.length > 0)) {
                label += `+0`;
            }

            rollButton.textContent = label;

        } catch (error) {
            API.log('error', 'Failed to update roll button label', error);
        }
    }

    /**
     * Get current dialog state
     */
    getDialogState() {
        return {
            rollMode: this.rollMode,
            rollType: this.advantageType,
            modifiers: this.modifiers.filter(m => m.isEnabled)
        };
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
}
