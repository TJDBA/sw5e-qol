import { DialogLogger } from './dialog-logger.js';

/**
 * Dialog Event Handler
 * Handles all event listeners and input interactions for dialogs
 */
export class DialogEventHandler {
    constructor(dialogElement, handler = null) {
        this.dialogElement = dialogElement;
        this.handler = handler;
        this.logThisFile = true; // Temporarily enable for debugging
        if (this.logThisFile) DialogLogger.log('debug', 'DialogEventHandler constructor called');
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for all interactive components
     */
    setupEventListeners() {
        if (this.logThisFile) DialogLogger.log('debug', 'Setting up event listeners for dialog');
        if (this.logThisFile) DialogLogger.log('debug', `Dialog element: ${this.dialogElement ? 'found' : 'not found'}`);
        if (this.logThisFile) DialogLogger.log('debug', `Handler: ${this.handler ? 'found' : 'not found'}`);
        
        try {
            this.setupModifierToggles();
            this.setupAddModifierButtons();
            this.setupAdvantageRadios();
            this.setupItemSelection();
            this.setupRollModeSelect();
            this.setupRollButton();
            this.setupCollapsibleSections();
            this.setupAttributeSelect();
        } catch (error) {
            DialogLogger.log('error', 'Failed to setup event listeners', error);
        }
    }

    /**
     * Setup modifier toggle checkboxes using event delegation
     */
    setupModifierToggles() {
        if (this.logThisFile) DialogLogger.log('debug', 'Setting up modifier toggles');
        
        // Use event delegation on the dialog body to catch all toggle switches
        const dialogBody = this.dialogElement.querySelector('#dialog-body');
        if (this.logThisFile) DialogLogger.log('debug', `Dialog body found: ${!!dialogBody}`);
        if (this.logThisFile) DialogLogger.log('debug', `Dialog element classes: ${this.dialogElement.className}`);
        if (this.logThisFile) DialogLogger.log('debug', `Dialog element HTML: ${this.dialogElement.outerHTML.substring(0, 200)}...`);
        
        if (!dialogBody) {
            if (this.logThisFile) DialogLogger.log('warning', 'Dialog body not found');
            return;
        }
    
        // Remove any existing listeners first
        const oldClickHandler = dialogBody._clickHandler;
        const oldChangeHandler = dialogBody._changeHandler;
        if (oldClickHandler) dialogBody.removeEventListener('click', oldClickHandler);
        if (oldChangeHandler) dialogBody.removeEventListener('change', oldChangeHandler);
    
        // Create delegated click handler for toggle sliders and checkboxes
        const clickHandler = (event) => {
            if (this.logThisFile) DialogLogger.log('debug', 'Click event detected on:', event.target);
            if (this.logThisFile) DialogLogger.log('debug', 'Target classes:', event.target.className);
            
            // If clicked on the toggle-switch div, find the checkbox inside
            if (event.target.classList.contains('toggle-switch')) {
                const checkbox = event.target.querySelector('.modifier-toggle');
                if (checkbox) {
                    if (this.logThisFile) DialogLogger.log('debug', 'Toggling checkbox via toggle-switch click');
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
            // If clicked on the slider span, toggle the associated checkbox
            else if (event.target.classList.contains('toggle-slider')) {
                const checkbox = event.target.previousElementSibling;
                if (checkbox && checkbox.classList.contains('modifier-toggle')) {
                    if (this.logThisFile) DialogLogger.log('debug', 'Toggling checkbox via slider click');
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
            // If clicked directly on a modifier-toggle checkbox, let the change event handle it
            else if (event.target.classList.contains('modifier-toggle')) {
                if (this.logThisFile) DialogLogger.log('debug', 'Direct checkbox click detected');
                // The change event will be triggered automatically
                return;
            }
        };
    
        // Create delegated change handler for checkboxes
        const changeHandler = (event) => {
            if (this.logThisFile) DialogLogger.log('debug', 'Change event detected on:', event.target);
            if (this.logThisFile) DialogLogger.log('debug', 'Target classes:', event.target.className);
            if (this.logThisFile) DialogLogger.log('debug', 'Target dataset:', event.target.dataset);
            
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
     * @param {Event} event - The change event
     */
    handleToggleChange(event) {
        const modifierId = event.target.dataset.modifierId;
        const featureId = event.target.dataset.featureId;
        const isChecked = event.target.checked;
        
        if (this.logThisFile) DialogLogger.log('debug', 'Toggle switch change event detected');
        if (this.logThisFile) DialogLogger.log('debug', `Toggle changed - Modifier ID: ${modifierId}, Feature ID: ${featureId}, Checked: ${isChecked}`);
        
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
                if (this.logThisFile) DialogLogger.log('warning', 'Could not find modifier row for toggle');
                return;
            }

            // Handle special case for attribute row
            if (modifierId === 'attribute') {
                if (this.logThisFile) DialogLogger.log('debug', 'Handling attribute row toggle');
                this.toggleRowState(row, isChecked);
                this.updateRollButtonLabel();
                return;
            }

            // Handle special case for proficiency row
            if (modifierId === 'proficiency') {
                if (this.logThisFile) DialogLogger.log('debug', 'Handling proficiency row toggle');
                this.toggleRowState(row, isChecked);
                this.updateRollButtonLabel();
                return;
            }

            // Handle regular modifier rows
            const modifierIndex = parseInt(modifierId);
            if (modifierIndex >= 0 && this.handler?.modifierManager) {
                if (this.logThisFile) DialogLogger.log('debug', `Handling modifier ${modifierIndex} toggle`);
                this.handler.modifierManager.modifiers[modifierIndex].isEnabled = isChecked;
                this.toggleRowState(row, isChecked);
                this.updateRollButtonLabel();
            } else {
                if (this.logThisFile) DialogLogger.log('warning', `Invalid modifier ID: ${modifierId}`);
            }
        } else {
            if (this.logThisFile) DialogLogger.log('warning', 'Toggle switch has neither modifier ID nor feature ID');
        }
    }

    /**
     * Handle feature toggle changes
     * @param {string} featureId - The feature ID
     * @param {boolean} isChecked - Whether the feature is checked
     * @param {Event} event - The event object
     */
    handleFeatureToggle(featureId, isChecked, event) {
        if (this.logThisFile) DialogLogger.log('debug', `Handling feature toggle - ID: ${featureId}, Checked: ${isChecked}`);
        
        try {
            // Find the row containing this toggle - try multiple selectors
            let row = event.target.closest('.modifier-row');
            if (!row) {
                row = event.target.closest('.feature-row');
            }
            if (!row) {
                row = event.target.closest('tr');
            }
            
            if (!row) {
                if (this.logThisFile) DialogLogger.log('warning', 'Could not find feature row for toggle');
                return;
            }

            // Update feature state through feature manager
            if (this.handler?.featureManager) {
                this.handler.featureManager.updateFeatureState(featureId, isChecked);
            }
            
            // Update row visual state
            this.toggleRowState(row, isChecked);
            
            // Update roll button label if needed
            this.updateRollButtonLabel();
            
            // Trigger feature-specific logic if needed
            if (this.handler?.featureManager) {
                this.handler.featureManager.onFeatureToggle(featureId, isChecked);
            }
            
        } catch (error) {
            DialogLogger.log('error', `Error handling feature toggle: ${error.message}`);
        }
    }

    /**
     * Setup add modifier buttons
     */
    setupAddModifierButtons() {
        if (this.logThisFile) DialogLogger.log('debug', 'Setting up add modifier buttons');
        
        const addButtons = this.dialogElement.querySelectorAll('.add-modifier-btn');
        addButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                if (this.handler?.modifierManager) {
                    this.handler.modifierManager.addModifier(index);
                }
            });
        });
    }

    /**
     * Setup advantage radio buttons
     */
    setupAdvantageRadios() {
        if (this.logThisFile) DialogLogger.log('debug', 'Setting up advantage radios');
        
        const radios = this.dialogElement.querySelectorAll('.advantage-radio');
        radios.forEach(radio => {
            radio.addEventListener('change', (event) => {
                if (this.handler?.stateManager) {
                    this.handler.stateManager.advantageType = event.target.value;
                }
                if (this.logThisFile) DialogLogger.log('debug', `Advantage type changed to: ${event.target.value}`);
            });
        });
    }

    /**
     * Setup item selection
     */
    setupItemSelection() {
        if (this.logThisFile) DialogLogger.log('debug', 'Setting up item selection');
        
        const itemSelect = this.dialogElement.querySelector('#item-select');
        const presetSelect = this.dialogElement.querySelector('#preset-select');
        const savePresetBtn = this.dialogElement.querySelector('.save-preset-btn');
        const deletePresetBtn = this.dialogElement.querySelector('.delete-preset-btn');
        const attributeSelect = this.dialogElement.querySelector('#attribute-select');
        const targetRollToggle = this.dialogElement.querySelector('#target-roll-toggle');

        if (itemSelect) {
            itemSelect.addEventListener('change', async (event) => {
                if (this.handler?.stateManager) {
                    this.handler.stateManager.selectedItem = event.target.value;
                }
                
                if (this.logThisFile) DialogLogger.log('debug', `Item selection changed to: ${event.target.value}`);
                
                // Update item-related rows when item selection changes
                if (this.handler && this.handler.currentOptions && this.handler.currentOptions.actor) {
                    if (this.handler?.itemHandler) {
                        await this.handler.itemHandler.updateItemRows(
                            this.dialogElement, 
                            this.handler.currentOptions.actor, 
                            event.target.value
                        );
                    }
                    // Update roll button label after item change
                    this.updateRollButtonLabel();
                }
            });
        }

        if (presetSelect) {
            presetSelect.addEventListener('change', (event) => {
                if (this.handler?.stateManager) {
                    this.handler.stateManager.selectedPreset = event.target.value;
                }
                if (this.logThisFile) DialogLogger.log('debug', `Preset selection changed to: ${event.target.value}`);
            });
        }

        if (savePresetBtn) {
            savePresetBtn.addEventListener('click', () => {
                if (this.handler?.presetManager) {
                    this.handler.presetManager.savePreset();
                }
            });
        }

        if (deletePresetBtn) {
            deletePresetBtn.addEventListener('click', () => {
                if (this.handler?.presetManager) {
                    this.handler.presetManager.deletePreset();
                }
            });
        }

        if (attributeSelect) {
            attributeSelect.addEventListener('change', async (event) => {
                if (this.handler?.stateManager) {
                    this.handler.stateManager.selectedAttribute = event.target.value;
                }
                
                if (this.logThisFile) DialogLogger.log('debug', `Attribute selection changed to: ${event.target.value}`);
                
                // Update the attribute modifier when selection changes
                if (this.handler && this.handler.currentOptions && this.handler.currentOptions.actor) {
                    if (this.handler?.itemHandler) {
                        await this.handler.itemHandler.updateAttributeModifier(
                            this.dialogElement, 
                            this.handler.currentOptions.actor, 
                            event.target.value
                        );
                    }
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
                        if (this.handler?.stateManager) {
                            this.handler.stateManager.rollForEachTarget = targetRollToggle.checked;
                        }
                    }
                });
                
                // Change handler for the checkbox itself
                targetRollToggle.addEventListener('change', (event) => {
                    if (this.handler?.stateManager) {
                        this.handler.stateManager.rollForEachTarget = event.target.checked;
                    }
                    if (this.logThisFile) DialogLogger.log('debug', `Target roll toggle changed to: ${event.target.checked}`);
                });
            }
        }
    }

    /**
     * Setup roll mode select
     */
    setupRollModeSelect() {
        if (this.logThisFile) DialogLogger.log('debug', 'Setting up roll mode select');
        
        const select = this.dialogElement.querySelector('#roll-mode-select');
        if (select) {
            select.addEventListener('change', (event) => {
                if (this.handler?.stateManager) {
                    this.handler.stateManager.rollMode = event.target.value;
                }
                if (this.logThisFile) DialogLogger.log('debug', `Roll mode changed to: ${event.target.value}`);
            });
        }
    }

    /**
     * Setup roll button click handler
     */
    setupRollButton() {
        if (this.logThisFile) DialogLogger.log('debug', 'Setting up roll button');
        
        const rollButton = this.dialogElement.querySelector('#roll-button');
        if (rollButton) {
            rollButton.addEventListener('click', () => {
                if (this.logThisFile) DialogLogger.log('info', 'Roll button clicked');
                
                // Get the result and close the dialog
                const result = this.getDialogState();
                
                // Log the returned object for debugging
                if (this.logThisFile) DialogLogger.log('info', 'Roll button clicked - Dialog result:', result);
                
                if (this.handler && this.handler.resolveDialog) {
                    this.handler.currentDialog = null; // Clean up dialog reference
                    this.handler.resolveDialog(result);
                }
            });
        }
    }

    /**
     * Setup collapsible section functionality
     */
    setupCollapsibleSections() {
        if (this.logThisFile) DialogLogger.log('debug', 'Setting up collapsible sections');
        
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
                        if (this.logThisFile) DialogLogger.log('debug', `Expanded section: ${sectionName}`);
                    } else {
                        content.style.display = 'none';
                        toggle.textContent = '▶';
                        toggle.style.transform = 'rotate(0deg)';
                        if (this.logThisFile) DialogLogger.log('debug', `Collapsed section: ${sectionName}`);
                    }
                }
            }
        });
    }

    /**
     * Setup attribute select dropdown
     */
    setupAttributeSelect() {
        if (this.logThisFile) DialogLogger.log('debug', 'Setting up attribute select');
        
        const attributeSelect = this.dialogElement.querySelector('#attribute-select');
        if (attributeSelect) {
            // Remove existing listeners
            attributeSelect.removeEventListener('change', this.handleAttributeChange);
            
            // Add new listener
            this.handleAttributeChange = (event) => {
                if (this.handler?.stateManager) {
                    this.handler.stateManager.selectedAttribute = event.target.value;
                }
                
                if (this.logThisFile) DialogLogger.log('debug', `Attribute changed to: ${event.target.value}`);
                
                // Update the attribute modifier
                if (this.handler && this.handler.currentOptions && this.handler.currentOptions.actor) {
                    if (this.handler?.itemHandler) {
                        this.handler.itemHandler.updateAttributeModifier(
                            this.dialogElement, 
                            this.handler.currentOptions.actor, 
                            event.target.value
                        );
                    }
                }
            };
            
            attributeSelect.addEventListener('change', this.handleAttributeChange);
        }
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

    /**
     * Update the roll button label with current modifiers
     */
    updateRollButtonLabel() {
        if (this.handler?.rollButtonManager) {
            this.handler.rollButtonManager.updateRollButtonLabel();
        }
    }

    /**
     * Get current dialog state
     * @returns {Object} Dialog state
     */
    getDialogState() {
        if (this.handler?.stateManager) {
            return this.handler.stateManager.getDialogState();
        }
        return {};
    }
}
