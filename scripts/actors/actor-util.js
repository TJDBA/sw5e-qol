// ============================================================================
// ACTOR UTILITY FUNCTIONS
// ============================================================================

import { API } from '../api.js';

/**
 * Get ability modifier for the actor using data paths
 * @param {Object} actor - The actor object
 * @param {string} ability - The ability name (str, dex, con, int, wis, cha, none)
 * @returns {string} The ability modifier as a string (e.g., "3", "-1", "")
 */
export async function getAbilityModifier(actor, ability) {
    try {
        if (!actor || ability === 'none') return '';

        // Use data paths to get ability modifier
        const { getDataPaths } = await import('../core/utils/reference/data-lookup.js');
        const dataPaths = getDataPaths("actor", "character");
        
        if (!dataPaths || !dataPaths.subpaths || !dataPaths.subpaths.abilities) {
            API.log('warning', 'Could not find abilities path in data paths');
            return '';
        }

        // Get the ability modifier from the stored mod value
        const abilityPath = `${dataPaths.subpaths.abilities}.${ability}.mod`;
        const modifier = foundry.utils.getProperty(actor, abilityPath);
        
        if (modifier === undefined || modifier === null) {
            API.log('warning', `Could not find modifier for ability: ${ability}`);
            return '';
        }
        
            return modifier >= 0 ? `${modifier}` : `${modifier}`;
    } catch (error) {
        API.log('error', 'Failed to get ability modifier', error);
        return '';
    }
}

/**
 * Get weapon ability from data paths
 * @param {Object} actor - The actor object
 * @param {string} itemID - The weapon item ID
 * @returns {string} The weapon ability (str, dex, con, int, wis, cha, none)
 */
export async function getWeaponAbility(actor, itemID) {
    API.log('debug', `Weapon ability: ${actor}`, (itemID!==null ? itemID : null));
    try {
        if (!actor || !itemID) {
            return 'none';
        }

        const item = actor.items.get(itemID);
        API.log('debug', `Weapon ability ITEM: ${item}`, item);
        if (!item || item.type !== 'weapon') {
            return 'none';
        }

        // Get ability from data paths
        const ability = item.system?.ability;
        API.log('debug', `Weapon ability: ${ability}`, ability);
        API.log('debug', `Weapon ability: ${ability}`, ability!=='');
        API.log('debug', `Weapon ability: ${ability}`, ability!==null ? typeof ability : null);
        API.log('debug', `Weapon ability: ${ability}`, ability && ability !== 'none' && ability !== ''? true : false);
        //something is wrong here, but it works. I will check this later.
        if (ability && ability !== 'none' && ability !== '') {
            return ability;
        }

        // If ability is empty/null, check properties to determine ability
        const properties = item.system?.properties;
        
        if (typeof properties === 'object' && properties !== null) { 
            // Properties is an object with boolean values
            const hasMig = properties.mig === true; // Mighty property, allows for dex or str
            const hasFin = properties.fin === true; // Finesse balanced property, allows for dex or str
            const hasRng = properties.rng === true; // Ranged property, usually dex unless has either mig or fin
            
            if (hasMig || hasFin) {
                // Get the ability modifiers to compare
                const dexMod = await getAbilityModifier(actor, 'dex');
                const strMod = await getAbilityModifier(actor, 'str');
                const dexValue = parseInt(dexMod.replace(/[+-]/g, '')) || 0;
                const strValue = parseInt(strMod.replace(/[+-]/g, '')) || 0;
                return dexValue >= strValue ? 'dex' : 'str';
            } else if (hasRng) {
                return 'dex';
            } else {
                return 'str';
            }
        } 

        return 'str'; // Default to strength
    } catch (error) {
        API.log('error', 'Failed to get weapon ability', error);
        return 'str';
    }
}

/**
 * Get proficiency bonus for the actor using data paths
 * @param {Object} actor - The actor object
 * @returns {Promise<number>} The proficiency bonus
 */
export async function getProficiencyBonus(actor) {
    try {
        if (!actor) return 0;
        
        // Use data paths to get proficiency bonus
        const { getDataPaths } = await import('../core/utils/reference/data-lookup.js');
        const dataPaths = getDataPaths("actor", "character");
        
        if (!dataPaths || !dataPaths.subpaths || !dataPaths.subpaths.prof) {
            API.log('warning', 'Could not find proficiency bonus path in data paths');
            return 0;
        }

        const profPath = dataPaths.subpaths.prof;
        const proficiencyBonus = foundry.utils.getProperty(actor, profPath);
        
        return proficiencyBonus || 0;
    } catch (error) {
        API.log('error', 'Failed to get proficiency bonus', error);
        return 0;
    }
}

/**
 * Get actor from token ID
 * @param {string} tokenID - The token ID
 * @returns {Object} The actor object
 */
export async function getActorFromTokenID(tokenID) {
    let actor = game.actors.get(tokenID);
    if (!actor) {
        actor = game.canvas.tokens.get(tokenID).actor;
        if (!actor) {
            API.log('warning', `Actor not found for token ${tokenID}`);
            return null;
        }
    }
    return actor;
}