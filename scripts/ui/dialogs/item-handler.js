import { DialogLogger } from './dialog-logger.js';
import { getWeaponDamageData, isSmartWeapon, getSmartWeaponData } from '../../actors/item-util.js';
import { getAbilityModifier, getWeaponAbility, getProficiencyBonus } from '../../actors/actor-util.js';

/**
 * Item Handler
 * Handles generic item-specific logic for weapons, grenades, mines, consumables, etc.
 */
export class ItemHandler {
    constructor() {
        this.logThisFile = false;
    }

    /**
     * Generic function to get item data based on item type
     * @param {Actor} actor - The actor
     * @param {string} itemID - The item ID
     * @param {string} itemType - The type of item ('weapon', 'grenade', 'mine', 'consumable')
     * @returns {Object} Item data object
     */
    async getItemData(actor, itemID, itemType = 'weapon') {
        if (this.logThisFile) DialogLogger.log('debug', `Getting item data - itemID: ${itemID}, itemType: ${itemType}`);
        
        switch (itemType.toLowerCase()) {
            case 'weapon':
                return await this.getWeaponData(actor, itemID);
            case 'grenade':
                return await this.getGrenadeData(actor, itemID);
            case 'mine':
                return await this.getMineData(actor, itemID);
            case 'consumable':
                return await this.getConsumableData(actor, itemID);
            default:
                if (this.logThisFile) DialogLogger.log('warning', `Unknown item type: ${itemType}, defaulting to weapon`);
                return await this.getWeaponData(actor, itemID);
        }
    }

    /**
     * Get weapon-specific data
     * @param {Actor} actor - The actor
     * @param {string} itemID - The weapon ID
     * @returns {Object} Weapon data
     */
    async getWeaponData(actor, itemID) {
        if (this.logThisFile) DialogLogger.log('debug', `Getting weapon data for itemID: ${itemID}`);
        
        try {
            const item = itemID ? actor.items.get(itemID) : null;
            const isSmart = item && item.type === 'weapon' && isSmartWeapon(actor, itemID);
            const weaponDamageData = getWeaponDamageData(actor, itemID);
            const proficiencyBonus = await getProficiencyBonus(actor);
            const smartWeaponData = isSmart ? await getSmartWeaponData(actor, itemID) : null;
            const weaponAbility = await getWeaponAbility(actor, itemID);
            const abilityModifier = await getAbilityModifier(actor, weaponAbility);
            const attributeDisabled = weaponAbility === 'none';

            return {
                itemType: 'weapon',
                damageData: weaponDamageData,
                isSmart: isSmart,
                smartWeaponData: smartWeaponData,
                proficiencyBonus: proficiencyBonus,
                ability: weaponAbility,
                abilityModifier: abilityModifier,
                attributeDisabled: attributeDisabled
            };
        } catch (error) {
            DialogLogger.log('error', 'Failed to get weapon data', error);
            return this.getDefaultItemData('weapon');
        }
    }

    /**
     * Get grenade-specific data (placeholder for future implementation)
     * @param {Actor} actor - The actor
     * @param {string} itemID - The grenade ID
     * @returns {Object} Grenade data
     */
    async getGrenadeData(actor, itemID) {
        if (this.logThisFile) DialogLogger.log('debug', `Getting grenade data for itemID: ${itemID} - PLACEHOLDER`);
        
        // TODO: Implement grenade-specific data retrieval
        // This would include:
        // - Grenade damage data
        // - Throw ability (usually Dexterity)
        // - Range data
        // - Area of effect data
        
        return this.getDefaultItemData('grenade');
    }

    /**
     * Get mine-specific data (placeholder for future implementation)
     * @param {Actor} actor - The actor
     * @param {string} itemID - The mine ID
     * @returns {Object} Mine data
     */
    async getMineData(actor, itemID) {
        if (this.logThisFile) DialogLogger.log('debug', `Getting mine data for itemID: ${itemID} - PLACEHOLDER`);
        
        // TODO: Implement mine-specific data retrieval
        // This would include:
        // - Mine damage data
        // - Placement ability (usually Dexterity)
        // - Trigger mechanism data
        // - Area of effect data
        
        return this.getDefaultItemData('mine');
    }

    /**
     * Get consumable-specific data (placeholder for future implementation)
     * @param {Actor} actor - The actor
     * @param {string} itemID - The consumable ID
     * @returns {Object} Consumable data
     */
    async getConsumableData(actor, itemID) {
        if (this.logThisFile) DialogLogger.log('debug', `Getting consumable data for itemID: ${itemID} - PLACEHOLDER`);
        
        // TODO: Implement consumable-specific data retrieval
        // This would include:
        // - Consumable effect data
        // - Usage ability (varies by consumable type)
        // - Duration data
        // - Effect modifiers
        
        return this.getDefaultItemData('consumable');
    }

    /**
     * Get default item data for unknown or error cases
     * @param {string} itemType - The item type
     * @returns {Object} Default item data
     */
    getDefaultItemData(itemType) {
        return {
            itemType: itemType,
            damageData: { type: 'None', modifier: '0', isEnabled: true },
            isSmart: false,
            smartWeaponData: null,
            proficiencyBonus: 0,
            ability: 'none',
            abilityModifier: '+0',
            attributeDisabled: true
        };
    }

    /**
     * Update item damage row in dialog
     * @param {HTMLElement} dialogElement - Dialog element
     * @param {Actor} actor - The actor
     * @param {string} itemID - The item ID
     * @param {string} itemType - The item type
     */
    async updateItemDamageRow(dialogElement, actor, itemID, itemType = 'weapon') {
        if (this.logThisFile) DialogLogger.log('debug', `Updating item damage row - itemID: ${itemID}, itemType: ${itemType}`);
        
        try {
            const itemData = await this.getItemData(actor, itemID, itemType);
            const damageRow = dialogElement.querySelector('.weapon-damage-row, .item-damage-row');
            
            if (!damageRow) {
                if (this.logThisFile) DialogLogger.log('warning', 'Could not find damage row in dialog');
                return;
            }

            const typeElement = damageRow.querySelector('.weapon-damage-type, .item-damage-type');
            const modifierElement = damageRow.querySelector('.weapon-damage-modifier, .item-damage-modifier');
            const toggle = damageRow.querySelector('.modifier-toggle');

            if (typeElement) typeElement.textContent = itemData.damageData.type;
            if (modifierElement) modifierElement.textContent = itemData.damageData.modifier;
            if (toggle) toggle.checked = itemData.damageData.isEnabled;

            // Update row state
            this.toggleRowState(damageRow, itemData.damageData.isEnabled);
        } catch (error) {
            DialogLogger.log('error', 'Failed to update item damage row', error);
        }
    }

    /**
     * Update proficiency row in dialog
     * @param {HTMLElement} dialogElement - Dialog element
     * @param {Actor} actor - The actor
     * @param {string} itemID - The item ID
     * @param {string} itemType - The item type
     */
    async updateProficiencyRow(dialogElement, actor, itemID, itemType = 'weapon') {
        if (this.logThisFile) DialogLogger.log('debug', `Updating proficiency row - itemID: ${itemID}, itemType: ${itemType}`);
        
        try {
            const itemData = await this.getItemData(actor, itemID, itemType);
            const proficiencyRow = dialogElement.querySelector('.proficiency-row');
            
            if (!proficiencyRow) {
                if (this.logThisFile) DialogLogger.log('warning', 'Could not find proficiency row in dialog');
                return;
            }

            const descriptionElement = proficiencyRow.querySelector('.proficiency-description');
            const modifierElement = proficiencyRow.querySelector('.proficiency-modifier');
            const smartInput = proficiencyRow.querySelector('.smart-weapon-proficiency-input');

            if (descriptionElement) {
                // For weapons, show "Smart Weapon" if applicable
                // For other items, show item-specific description
                if (itemType === 'weapon' && itemData.isSmart) {
                    descriptionElement.textContent = 'Smart Weapon';
                } else {
                    descriptionElement.textContent = this.getProficiencyDescription(itemType);
                }
            }

            if (modifierElement) {
                if (itemType === 'weapon' && itemData.isSmart) {
                    modifierElement.style.display = 'none';
                    if (smartInput) {
                        smartInput.style.display = 'inline-block';
                        smartInput.value = itemData.smartWeaponData?.proficiency || itemData.proficiencyBonus;
                    }
                } else {
                    modifierElement.style.display = 'inline-block';
                    modifierElement.textContent = `+${itemData.proficiencyBonus}`;
                    if (smartInput) {
                        smartInput.style.display = 'none';
                    }
                }
            }
        } catch (error) {
            DialogLogger.log('error', 'Failed to update proficiency row', error);
        }
    }

    /**
     * Update attribute row in dialog
     * @param {HTMLElement} dialogElement - Dialog element
     * @param {Actor} actor - The actor
     * @param {string} itemID - The item ID
     * @param {string} itemType - The item type
     */
    async updateAttributeRow(dialogElement, actor, itemID, itemType = 'weapon') {
        if (this.logThisFile) DialogLogger.log('debug', `Updating attribute row - itemID: ${itemID}, itemType: ${itemType}`);
        
        try {
            const itemData = await this.getItemData(actor, itemID, itemType);
            const attributeRow = dialogElement.querySelector('.attribute-row');
            
            if (!attributeRow) {
                if (this.logThisFile) DialogLogger.log('warning', 'Could not find attribute row in dialog');
                return;
            }

            const attributeCell = attributeRow.querySelector('td:first-child');
            const modifierCell = attributeRow.querySelector('td:nth-child(3)');
            const toggle = attributeRow.querySelector('.modifier-toggle');

            if (itemType === 'weapon' && itemData.isSmart) {
                // Smart weapon display
                if (attributeCell) {
                    attributeCell.innerHTML = `
                        <span class="smart-weapon-attribute-description">Smart Weapon Dex: ${itemData.smartWeaponData?.dex || 0}</span>
                    `;
                }
                
                if (modifierCell) {
                    modifierCell.innerHTML = `
                        <span class="smart-weapon-attribute-modifier">${itemData.smartWeaponData?.dexModifier >= 0 ? '+' : ''}${itemData.smartWeaponData?.dexModifier || 0}</span>
                    `;
                }
            } else {
                // Normal attribute display
                const abilityName = this.getAbilityDisplayName(itemData.ability);
                
                if (attributeCell) {
                    attributeCell.innerHTML = `
                        <label class="attribute-label">${game.i18n.localize("SW5E-QOL.interface.attribute")}:</label>
                        <select class="attribute-select" id="attribute-select">
                            <option value="str" ${itemData.ability === 'str' ? 'selected' : ''}>${game.i18n.localize("SW5E-QOL.attributes.str")}</option>
                            <option value="dex" ${itemData.ability === 'dex' ? 'selected' : ''}>${game.i18n.localize("SW5E-QOL.attributes.dex")}</option>
                            <option value="con" ${itemData.ability === 'con' ? 'selected' : ''}>${game.i18n.localize("SW5E-QOL.attributes.con")}</option>
                            <option value="int" ${itemData.ability === 'int' ? 'selected' : ''}>${game.i18n.localize("SW5E-QOL.attributes.int")}</option>
                            <option value="wis" ${itemData.ability === 'wis' ? 'selected' : ''}>${game.i18n.localize("SW5E-QOL.attributes.wis")}</option>
                            <option value="cha" ${itemData.ability === 'cha' ? 'selected' : ''}>${game.i18n.localize("SW5E-QOL.attributes.cha")}</option>
                            <option value="none" ${itemData.ability === 'none' ? 'selected' : ''}>${game.i18n.localize("SW5E-QOL.attributes.none")}</option>
                        </select>
                    `;
                }
                
                if (modifierCell) {
                    modifierCell.innerHTML = `<span class="attribute-modifier">${itemData.abilityModifier}</span>`;
                }

                // Update toggle state
                if (toggle) {
                    toggle.checked = !itemData.attributeDisabled;
                }
            }
        } catch (error) {
            DialogLogger.log('error', 'Failed to update attribute row', error);
        }
    }

    /**
     * Update all item-related rows in dialog
     * @param {HTMLElement} dialogElement - Dialog element
     * @param {Actor} actor - The actor
     * @param {string} itemID - The item ID
     * @param {string} itemType - The item type
     */
    async updateItemRows(dialogElement, actor, itemID, itemType = 'weapon') {
        if (this.logThisFile) DialogLogger.log('debug', `Updating all item rows - itemID: ${itemID}, itemType: ${itemType}`);
        
        try {
            await this.updateItemDamageRow(dialogElement, actor, itemID, itemType);
            await this.updateProficiencyRow(dialogElement, actor, itemID, itemType);
            await this.updateAttributeRow(dialogElement, actor, itemID, itemType);
        } catch (error) {
            DialogLogger.log('error', 'Failed to update item rows', error);
        }
    }

    /**
     * Initialize item rows with default data
     * @param {HTMLElement} dialogElement - Dialog element
     * @param {Actor} actor - The actor
     * @param {string} itemID - The item ID
     * @param {string} itemType - The item type
     */
    async initializeItemRows(dialogElement, actor, itemID, itemType = 'weapon') {
        if (this.logThisFile) DialogLogger.log('debug', `Initializing item rows - itemID: ${itemID}, itemType: ${itemType}`);
        
        try {
            if (actor) {
                await this.updateItemRows(dialogElement, actor, itemID, itemType);
            }
        } catch (error) {
            DialogLogger.log('error', 'Failed to initialize item rows', error);
        }
    }

    /**
     * Update attribute modifier when selection changes
     * @param {HTMLElement} dialogElement - Dialog element
     * @param {Actor} actor - The actor
     * @param {string} ability - The selected ability
     */
    async updateAttributeModifier(dialogElement, actor, ability) {
        if (this.logThisFile) DialogLogger.log('debug', `Updating attribute modifier - ability: ${ability}`);
        
        try {
            const attributeRow = dialogElement.querySelector('.attribute-row');
            if (!attributeRow) return;

            const modifierElement = attributeRow.querySelector('.attribute-modifier');
            if (!modifierElement) return;

            const modifier = await getAbilityModifier(actor, ability);
            modifierElement.textContent = modifier;
        } catch (error) {
            DialogLogger.log('error', 'Failed to update attribute modifier', error);
        }
    }

    /**
     * Get proficiency description for item type
     * @param {string} itemType - The item type
     * @returns {string} Proficiency description
     */
    getProficiencyDescription(itemType) {
        switch (itemType.toLowerCase()) {
            case 'grenade':
                return 'Grenade Proficiency';
            case 'mine':
                return 'Mine Proficiency';
            case 'consumable':
                return 'Item Proficiency';
            default:
                return '';
        }
    }

    /**
     * Get ability display name
     * @param {string} ability - The ability key
     * @returns {string} Display name
     */
    getAbilityDisplayName(ability) {
        const abilityMap = {
            'str': 'Strength',
            'dex': 'Dexterity',
            'con': 'Constitution',
            'int': 'Intelligence',
            'wis': 'Wisdom',
            'cha': 'Charisma',
            'none': 'None'
        };
        return abilityMap[ability] || ability;
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
