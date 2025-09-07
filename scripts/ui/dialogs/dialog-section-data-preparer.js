import { DialogLogger } from './dialog-logger.js';
import { buildItemSelectionList, getWeaponDamageData, isSmartWeapon, getSmartWeaponData } from '../../actors/item-util.js';
import { getAbilityModifier, getWeaponAbility, getProficiencyBonus } from '../../actors/actor-util.js';

/**
 * Dialog Section Data Preparer
 * Handles preparation of data for dialog sections
 */
export class DialogSectionDataPreparer {
    constructor() {
        this.logThisFile = false;
    }

    /**
     * Prepare section-specific data
     * @param {string} sectionName - Name of the section
     * @param {Object} dialogData - Dialog data
     * @returns {Object} Section-specific data
     */
    async prepareSectionData(sectionName, dialogData) {
        if (this.logThisFile) DialogLogger.log('debug', `Preparing section data for ${sectionName}`);
        
        const baseData = {
            modifiers: dialogData.modifiers || [],
            modifierTypes: this.getModifierTypes(dialogData.type)
        };
        const { actor, itemID } = dialogData;
        
        // Calculate selection data once for reuse across sections
        const itemType = this.getItemTypeForDialog(dialogData.type);
        const selectionData = actor ? buildItemSelectionList(actor, itemType, { itemID }) : null;
        const effectiveItemID = itemID || selectionData?.defaultSelection || '';
        
        if (this.logThisFile) DialogLogger.log('debug', `Effective itemID: ${effectiveItemID}, itemType: ${itemType}`);
        
        switch (sectionName) {
            case 'item-selection':
                return {
                    itemLabelKey: this.getItemLabelKey(dialogData.type),
                    items: this.getItemsForType(dialogData.type, dialogData),
                    presets: this.getPresetsForType(dialogData.type),
                    selectionData: selectionData,
                    isLocked: selectionData?.isLocked || false,
                    defaultSelection: selectionData?.defaultSelection || ''
                };
            case 'modifiers-table':
                // Add weapon-related data for the template
                // Use the effective item ID (either provided or default selection)
                if (this.logThisFile) DialogLogger.log('debug', `Preparing weapon data with itemID: ${effectiveItemID}`);
                const weaponData = await this.prepareItemData({ ...dialogData, itemID: effectiveItemID });
                if (this.logThisFile) DialogLogger.log('debug', 'Item data prepared:', weaponData);
                const finalData = {
                    ...baseData,
                    ...weaponData
                };
                if (this.logThisFile) DialogLogger.log('debug', 'Final modifiers-table data:', finalData);
                return finalData;
            case 'add-modifier-inputs':
                return baseData;
            case 'advantage-radio':
                return {};
            case 'roll-mode-dropdown':
                return {};
            case 'roll-button':
                return {};
            default:
                return baseData;
        }
    }

    /**
     * Get item type for dialog type
     * @param {string} dialogType - Type of dialog
     * @returns {string} Item type
     */
    getItemTypeForDialog(dialogType) {
        if (this.logThisFile) DialogLogger.log('debug', `Getting item type for dialog type: ${dialogType}`);
        
        switch (dialogType.toLowerCase()) {
            case 'attack':
            case 'damage':
                return 'weapon';
            case 'skill':
            case 'save':
                return 'weapon'; // These might use different types in the future
            default:
                return 'weapon';
        }
    }

    /**
     * Get modifier types based on dialog type
     * @param {string} dialogType - Type of dialog
     * @returns {Array} Array of modifier types
     */
    getModifierTypes(dialogType) {
        if (this.logThisFile) DialogLogger.log('debug', `Getting modifier types for dialog type: ${dialogType}`);
        
        switch (dialogType.toLowerCase()) {
            case 'attack':
            case 'skill':
            case 'save':
                return ['Item', 'Force', 'Tech', 'Untyped'];
            case 'damage':
                return ['kinetic','energy','ion','acid','cold','fire','force','lightning','necrotic','poison','psychic','sonic','true'];
            default:
                return ['Untyped'];
        }
    }

    /**
     * Get item label key based on dialog type
     * @param {string} dialogType - Type of dialog
     * @returns {string} Item label key
     */
    getItemLabelKey(dialogType) {
        if (this.logThisFile) DialogLogger.log('debug', `Getting item label key for dialog type: ${dialogType}`);
        
        switch (dialogType.toLowerCase()) {
            case 'attack':
                return 'SW5E-QOL.interface.weapon';
            case 'skill':
                return 'SW5E-QOL.interface.skill';
            case 'save':
                return 'SW5E-QOL.interface.save';
            case 'damage':
                return 'SW5E-QOL.interface.weapon';
            default:
                return 'SW5E-QOL.interface.item';
        }
    }

    /**
     * Get items for dialog type using item selection functions
     * @param {string} dialogType - Type of dialog
     * @param {Object} dialogData - Dialog data
     * @returns {Array} Array of items
     */
    getItemsForType(dialogType, dialogData = {}) {
        if (this.logThisFile) DialogLogger.log('debug', `Getting items for dialog type: ${dialogType}`);
        
        try {
            const { actor, itemID } = dialogData;
            
            if (!actor) {
                if (this.logThisFile) DialogLogger.log('warning', 'No actor provided for item selection');
                return [];
            }

            // Determine item type based on dialog type
            let itemType = 'weapon'; // Default to weapon
            switch (dialogType.toLowerCase()) {
                case 'attack':
                case 'damage':
                    itemType = 'weapon';
                    break;
                case 'skill':
                case 'save':
                    // These might use different item types in the future
                    itemType = 'weapon';
                    break;
                default:
                    itemType = 'weapon';
            }

            // Build item selection list
            const selectionData = buildItemSelectionList(actor, itemType, { itemID });
            
            if (!selectionData || !selectionData.options) {
                if (this.logThisFile) DialogLogger.log('warning', 'No item selection data returned');
                return [];
            }

            // Convert to format expected by template
            const items = selectionData.options
                .filter(option => option.value !== '') // Exclude the "--None--" option
                .map(option => ({
                    id: option.value,
                    name: option.text,
                    selected: option.selected
                }));

            if (this.logThisFile) DialogLogger.log('debug', `Retrieved ${items.length} items for ${dialogType} dialog`);
            return items;

        } catch (error) {
            DialogLogger.log('error', 'Failed to get items for dialog type', error);
            return [];
        }
    }

    /**
     * Get presets for dialog type (placeholder - will be implemented later)
     * @param {string} dialogType - Type of dialog
     * @returns {Array} Array of presets
     */
    getPresetsForType(dialogType) {
        if (this.logThisFile) DialogLogger.log('debug', `Getting presets for dialog type: ${dialogType} - placeholder`);
        
        // Placeholder - will be populated from saved presets
        return [];
    }

    /**
     * Prepare item data for the modifiers table template
     * @param {Object} dialogData - Dialog data
     * @returns {Object} Item data
     */
    async prepareItemData(dialogData) {
        if (this.logThisFile) DialogLogger.log('debug', `Preparing item data for dialog type: ${dialogData.type}`);
        
        try {
            const { actor, itemID, type: dialogType } = dialogData;
            
            // Determine which rows to show based on dialog type
            const isDamageDialog = dialogType?.toLowerCase() === 'damage';
            const showProficiencyRow = dialogType?.toLowerCase() === 'attack' || dialogType?.toLowerCase() === 'save';
            
            if (this.logThisFile) DialogLogger.log('debug', `Dialog type: ${dialogType}, isDamageDialog: ${isDamageDialog}, showProficiencyRow: ${showProficiencyRow}`);
            
            if (!actor) {
                if (this.logThisFile) DialogLogger.log('debug', 'No actor provided, returning default data');
                return {
                    isDamageDialog,
                    showProficiencyRow,
                    weaponDamageType: 'None',
                    weaponDamageModifier: '0',
                    proficiencyDescription: '',
                    proficiencyModifier: '+0',
                    isSmartWeapon: false,
                    smartWeaponDex: 0,
                    smartWeaponDexModifier: 0,
                    smartWeaponProficiency: 0,
                    attributeModifier: '',
                    selectedAttribute: 'none',
                    attributeDisabled: false
                };
            }

            const item = itemID ? actor.items.get(itemID) : null;
            if (this.logThisFile) DialogLogger.log('debug', `Item found: ${item ? item.name : 'null'}`);
            
            const isSmart = item && item.type === 'weapon' && isSmartWeapon(actor, itemID);
            const weaponDamageData = getWeaponDamageData(actor, itemID);
            if (this.logThisFile) DialogLogger.log('debug', 'Weapon damage data:', weaponDamageData);
            
            const proficiencyBonus = await getProficiencyBonus(actor);
            const smartWeaponData = isSmart ? await getSmartWeaponData(actor, itemID) : null;
            
            // Determine weapon ability and set attribute
            const weaponAbility = await getWeaponAbility(actor, itemID);
            const abilityModifier = await getAbilityModifier(actor, weaponAbility);
            const attributeDisabled = weaponAbility === 'none';
            
            if (this.logThisFile) DialogLogger.log('debug', `Weapon ability: ${weaponAbility}, ability modifier: ${abilityModifier}, disabled: ${attributeDisabled}`);

            const result = {
                isDamageDialog,
                showProficiencyRow,
                weaponDamageType: weaponDamageData.type,
                weaponDamageModifier: weaponDamageData.modifier,
                proficiencyDescription: isSmart ? 'Smart Weapon' : '',
                proficiencyModifier: isSmart ? '' : `${proficiencyBonus}`,
                isSmartWeapon: isSmart,
                smartWeaponDex: smartWeaponData?.dex || 0,
                smartWeaponDexModifier: smartWeaponData?.dexModifier || 0,
                smartWeaponProficiency: smartWeaponData?.proficiency || proficiencyBonus,
                abilityModifier,
                selectedAttribute: weaponAbility,
                attributeDisabled
            };
            
            if (this.logThisFile) DialogLogger.log('debug', 'Item data prepared successfully:', result);
            return result;
            
        } catch (error) {
            DialogLogger.log('error', 'Failed to prepare item data', error);
            return {
                isDamageDialog: false,
                showProficiencyRow: true,
                weaponDamageType: 'None',
                weaponDamageModifier: '0',
                proficiencyDescription: '',
                proficiencyModifier: '+0',
                isSmartWeapon: false,
                smartWeaponDex: 0,
                smartWeaponDexModifier: 0,
                smartWeaponProficiency: 0,
                abilityModifier: '',
                selectedAttribute: 'none',
                attributeDisabled: false
            };
        }
    }

    /**
     * Get section order based on dialog type
     * @param {string} dialogType - Type of dialog
     * @returns {Array} Array of section names in order
     */
    getSectionOrder(dialogType) {
        if (this.logThisFile) DialogLogger.log('debug', `Getting section order for dialog type: ${dialogType}`);
        
        switch (dialogType.toLowerCase()) {
            case 'attack':
                return [
                    'item-selection',
                    'modifiers-table',
                    'add-modifier-inputs',
                    'features',
                    'advantage-radio',
                    'roll-mode-dropdown',
                    'roll-button'
                ];
            case 'skill':
                return [
                    'modifiers-table',
                    'add-modifier-inputs',
                    'features',
                    'advantage-radio',
                    'roll-mode-dropdown',
                    'roll-button'
                ];
            case 'save':
                return [
                    'modifiers-table',
                    'add-modifier-inputs',
                    'features',
                    'advantage-radio',
                    'roll-mode-dropdown',
                    'roll-button'
                ];
            case 'damage':
                return [
                    'item-selection',
                    'modifiers-table',
                    'add-modifier-inputs',
                    'features',
                    'roll-mode-dropdown',
                    'roll-button'
                ];
            default:
                throw new Error(`Invalid dialog type: ${dialogType}`);
        }
    }
}
