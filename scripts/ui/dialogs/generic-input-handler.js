import { API } from '../../api.js';

/**
 * Generic Input Handler for Dialog Components
 * Handles all component interactions that can be reused across different dialogs
 */
export class GenericInputHandler {
    constructor(dialogElement) {
        this.dialogElement = dialogElement;
        this.modifiers = [];
        this.advantageType = 'normal';
        this.rollMode = 'public';
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for all interactive components
     */
    setupEventListeners() {
        try {
            this.setupModifierToggles();
            this.setupAddModifierButtons();
            this.setupAdvantageRadios();
            this.setupRollModeSelect();
            this.updateRollButtonLabel();
        } catch (error) {
            API.log('error', 'Failed to setup event listeners', error);
        }
    }

    /**
     * Setup modifier toggle checkboxes
     */
    setupModifierToggles() {
        const toggles = this.dialogElement.querySelectorAll('.modifier-toggle');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', (event) => {
                const modifierId = parseInt(event.target.dataset.modifierId);
                this.modifiers[modifierId].isEnabled = event.target.checked;
                this.updateRollButtonLabel();
            });
        });
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
     * Add a new modifier from the input fields
     */
    addModifier(rowIndex) {
        try {
            const row = this.dialogElement.querySelectorAll('.modifier-input-row')[rowIndex];
            const nameInput = row.querySelector('.modifier-name-input');
            const valueInput = row.querySelector('.modifier-value-input');
            const typeSelect = row.querySelector('.modifier-type-select');
            const diceSelect = row.querySelector('.modifier-dice-select');

            const name = nameInput.value.trim();
            const value = valueInput.value;
            const type = typeSelect ? typeSelect.value : 'Untyped';
            const dice = diceSelect ? diceSelect.value : null;

            if (!name || !value) {
                API.notify('Please fill in both name and value fields', 'warning');
                return;
            }

            const modifier = {
                name,
                type,
                modifier: dice || (parseInt(value) >= 0 ? `+${value}` : value),
                isEnabled: true,
                isDice: !!dice
            };

            this.modifiers.push(modifier);
            this.addModifierToTable(modifier);
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

        row.innerHTML = `
            <td>${modifier.name}</td>
            <td>${modifier.type}</td>
            <td>${modifier.modifier}</td>
            <td>
                <input type="checkbox" class="modifier-toggle" checked data-modifier-id="${this.modifiers.length - 1}">
            </td>
        `;

        tbody.appendChild(row);
        this.setupModifierToggles(); // Re-setup event listeners
    }

    /**
     * Clear input fields after adding modifier
     */
    clearInputFields(rowIndex) {
        const row = this.dialogElement.querySelectorAll('.modifier-input-row')[rowIndex];
        const nameInput = row.querySelector('.modifier-name-input');
        const valueInput = row.querySelector('.modifier-value-input');

        nameInput.value = '';
        valueInput.value = '';
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
                rollButton.textContent = `${API.localize('interface.roll')}: 1d20`;
                return;
            }

            const diceModifiers = enabledModifiers.filter(m => m.isDice);
            const numberModifiers = enabledModifiers.filter(m => !m.isDice);

            // Combine dice modifiers
            const diceCounts = {};
            diceModifiers.forEach(m => {
                const dice = m.modifier;
                diceCounts[dice] = (diceCounts[dice] || 0) + 1;
            });

            // Sum number modifiers
            const numberSum = numberModifiers.reduce((sum, m) => {
                return sum + parseInt(m.modifier.replace(/[+-]/g, ''));
            }, 0);

            // Build label
            let label = `${API.localize('interface.roll')}: 1d20`;
            
            // Add dice
            Object.entries(diceCounts).forEach(([dice, count]) => {
                if (count === 1) {
                    label += `+${dice}`;
                } else {
                    label += `+${count}${dice}`;
                }
            });

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
        this.updateRollButtonLabel();
    }
}
