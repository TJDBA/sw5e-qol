// ============================================================================
// ITEM UTILITY FUNCTIONS
// ============================================================================

import { API } from '../api.js';
import { getDataPaths, getArrayFromPath } from '../core/utils/reference/data-lookup.js';

/**
 * Get all data paths from the ActorItem class and weapon category
 * @returns {Object|null} Object containing weapon data paths or null if not found
 */
export function getActorItemDataPaths() {
    try {
        const weaponPaths = getDataPaths('ActorItem', 'weapon');
        
        if (!weaponPaths) {
            API.log('warning', 'Could not retrieve weapon data paths from ActorItem');
            return null;
        }
        
        API.log('debug', 'Retrieved ActorItem weapon data paths:', weaponPaths);
        return weaponPaths;
        
    } catch (error) {
        API.log('error', 'Error getting ActorItem data paths:', error);
        return null;
    }
}

/**
 * Get weapon details from an actor
 * @param {Object} actor - The actor object to get weapons from
 * @param {string} [itemID] - Optional specific item ID to retrieve
 * @param {boolean} [isEquipped] - Optional filter for equipped weapons only
 * @returns {Array|null} Array of weapon objects or null if none found
 */
export function getWeaponDetails(actor, itemID = null, isEquipped = null) {
    try {
        if (!actor) {
            API.log('warning', 'No actor provided to getWeaponDetails');
            return null;
        }
        
        // Get weapon data paths
        const weaponPaths = getActorItemDataPaths();
        if (!weaponPaths) {
            API.log('warning', 'Could not get weapon data paths');
            return null;
        }
        
        // Get all weapons from actor
        const allWeapons = getArrayFromPath(actor, weaponPaths);
        
        if (!allWeapons || allWeapons.length === 0) {
            API.log('debug', 'No weapons found on actor');
            return null;
        }
        
        let weapons = allWeapons;
        
        // Filter by specific item ID if provided
        if (itemID) {
            weapons = weapons.filter(weapon => weapon.id === itemID);
            if (weapons.length === 0) {
                API.log('debug', `No weapon found with ID: ${itemID}`);
                return null;
            }
        }
        
        // Filter by equipped status if specified
        if (isEquipped !== null) {
            weapons = weapons.filter(weapon => {
                // Check if weapon is equipped (assuming equipped property exists)
                const equipped = weapon.system?.equipped !== false; // Default to true if not specified
                return isEquipped ? equipped : !equipped;
            });
        }
        
        // Extract weapon details using the subpaths
        const weaponDetails = weapons.map(weapon => {
            const details = {
                id: weapon.id,
                name: weapon.name,
                type: weapon.type,
                system: weapon.system || {}
            };
            
            // Add specific weapon properties from subpaths
            if (weaponPaths.subpaths) {
                // Damage information
                if (weapon.system?.damage) {
                    details.damage = weapon.system.damage;
                }
                
                // Attack bonus
                if (weapon.system?.attackBonus) {
                    details.attackBonus = weapon.system.attackBonus;
                }
                
                // Critical threshold
                if (weapon.system?.critical?.threshold !== undefined) {
                    details.criticalThreshold = weapon.system.critical.threshold;
                }
                
                // Properties
                if (weapon.system?.properties) {
                    details.properties = weapon.system.properties;
                }
                
                // Save information
                if (weapon.system?.save) {
                    details.save = weapon.system.save;
                }
                
                // Ability modifier
                if (weapon.system?.ability) {
                    details.ability = weapon.system.ability;
                }
                
                // Ammo information
                if (weapon.system?.ammo) {
                    details.ammo = weapon.system.ammo;
                }
                
                // Equipped status
                details.equipped = weapon.system?.equipped !== false;
                
                // Additional useful properties
                details.description = weapon.system?.description || '';
            }
            
            return details;
        });
        
        API.log('debug', `Retrieved ${weaponDetails.length} weapon(s)`, weaponDetails);
        return weaponDetails;
        
    } catch (error) {
        API.log('error', 'Error getting weapon details:', error);
        return null;
    }
}

/**
 * Get a single weapon by ID
 * @param {Object} actor - The actor object
 * @param {string} itemID - The weapon ID to retrieve
 * @returns {Object|null} Weapon object or null if not found
 */
export function getWeaponById(actor, itemID) {
    const weapons = getWeaponDetails(actor, itemID);
    return weapons && weapons.length > 0 ? weapons[0] : null;
}

/**
 * Get all equipped weapons
 * @param {Object} actor - The actor object
 * @returns {Array|null} Array of equipped weapons or null if none found
 */
export function getEquippedWeapons(actor) {
    return getWeaponDetails(actor, null, true);
}

/**
 * Get all unequipped weapons
 * @param {Object} actor - The actor object
 * @returns {Array|null} Array of unequipped weapons or null if none found
 */
export function getUnequippedWeapons(actor) {
    return getWeaponDetails(actor, null, false);
}

/**
 * Build item selection list for dropdowns
 * @param {Object} actor - The actor object
 * @param {string} itemType - Type of items to build list for ('weapon', 'consumable', 'power')
 * @param {Object} options - Options object containing itemID and other parameters
 * @returns {Object} Object containing dropdown options and default selection
 */
export function buildItemSelectionList(actor, itemType = 'weapon', options = {}) {
    try {
        if (!actor) {
            API.log('warning', 'No actor provided to buildItemSelectionList');
            return { options: [], defaultSelection: '', isLocked: false };
        }

        const { itemID } = options;
        let items = [];
        let defaultSelection = '';
        let isLocked = false;

        // Handle different item types
        switch (itemType) {
            case 'weapon':
                // Default to equipped weapons if no specific filter provided
                const showEquipped = options.showEquipped !== false; // Default to true
                items = getWeaponDetails(actor, null, showEquipped);
                break;
            
            case 'consumable':
                // Placeholder for future consumable implementation
                API.log('debug', 'Consumable item selection not yet implemented');
                items = null;
                break;
            
            case 'power':
                // Placeholder for future power implementation
                API.log('debug', 'Power item selection not yet implemented');
                items = null;
                break;
            
            default:
                API.log('warning', `Unknown item type: ${itemType}`);
                items = null;
        }

        // Build dropdown options
        const dropdownOptions = [];
        
        // Always add "None" option at the top
        dropdownOptions.push({
            value: '',
            text: '--None--',
            selected: false
        });

        // Add items to dropdown if any found
        if (items && items.length > 0) {
            items.forEach(item => {
                dropdownOptions.push({
                    value: item.id,
                    text: item.name,
                    selected: false
                });
            });
        }

        // Determine default selection and locking
        if (itemID) {
            // ItemID provided - lock to that specific item
            isLocked = true;
            defaultSelection = itemID;
            
            // Mark the specified item as selected
            const targetOption = dropdownOptions.find(option => option.value === itemID);
            if (targetOption) {
                targetOption.selected = true;
            } else {
                // ItemID not found in list, default to "None"
                dropdownOptions[0].selected = true;
                defaultSelection = '';
            }
        } else {
            // No itemID provided - default to first equipped weapon
            if (items && items.length > 0) {
                // Select the first item (after "None")
                dropdownOptions[1].selected = true;
                defaultSelection = items[0].id;
            } else {
                // No items found, default to "None"
                dropdownOptions[0].selected = true;
                defaultSelection = '';
            }
        }

        const result = {
            options: dropdownOptions,
            defaultSelection: defaultSelection,
            isLocked: isLocked,
            itemType: itemType
        };

        API.log('debug', `Built ${itemType} selection list:`, result);
        return result;

    } catch (error) {
        API.log('error', 'Error building item selection list:', error);
        return { options: [], defaultSelection: '', isLocked: false };
    }
}

/**
 * Build weapon selection list (convenience function)
 * @param {Object} actor - The actor object
 * @param {Object} options - Options object containing itemID and other parameters
 * @returns {Object} Object containing dropdown options and default selection
 */
export function buildWeaponSelectionList(actor, options = {}) {
    return buildItemSelectionList(actor, 'weapon', options);
}

/**
 * Build consumable selection list (placeholder for future implementation)
 * @param {Object} actor - The actor object
 * @param {Object} options - Options object containing itemID and other parameters
 * @returns {Object} Object containing dropdown options and default selection
 */
export function buildConsumableSelectionList(actor, options = {}) {
    return buildItemSelectionList(actor, 'consumable', options);
}

/**
 * Build power selection list (placeholder for future implementation)
 * @param {Object} actor - The actor object
 * @param {Object} options - Options object containing itemID and other parameters
 * @returns {Object} Object containing dropdown options and default selection
 */
export function buildPowerSelectionList(actor, options = {}) {
    return buildItemSelectionList(actor, 'power', options);
}
