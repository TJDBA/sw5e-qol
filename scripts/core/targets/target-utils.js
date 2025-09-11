/**
 * Target Utilities Class
 * Provides utilities for target data lookup and defensive stats
 * Location: scripts/core/targets/target-utils.js
 */

import { API } from '../../../api.js';

/**
 * Target Utilities Class
 * Handles target data retrieval and defensive stat calculations
 */
export class TargetUtils {
    /**
     * Get target data including defensive stats
     * @param {string} targetId - Target ID (token ID or actor ID)
     * @returns {Object|null} Target data or null if not found
     */
    async getTargetData(targetId) {
        try {
            // Try to get token first - check if it's still on the canvas
            let token = canvas.tokens.get(targetId);
            if (!token) {
                // Try to get actor directly
                const actor = game.actors.get(targetId);
                if (!actor) {
                    return {
                        id: targetId,
                        error: 'Target not found or no longer accessible',
                        name: 'Unknown Target'
                    };
                }
                // Create a mock token object for actor-only targets
                token = {
                    id: targetId,
                    actor: actor,
                    name: actor.name,
                    document: { id: targetId }
                };
            }

            const actor = token.actor || token;
            if (!actor) {
                return {
                    id: targetId,
                    error: 'Target actor not found',
                    name: 'Unknown Target'
                };
            }

            // Get defensive stats
            const ac = this.getArmorClass(actor);
            const saves = this.getSavingThrows(actor);
            const resistances = this.getResistances(actor);
            const immunities = this.getImmunities(actor);

            return {
                id: targetId,
                name: actor.name,
                token: token,
                actor: actor,
                ac: ac,
                saves: saves,
                resistances: resistances,
                immunities: immunities,
                // Additional target properties can be added here
                hasResilientArmor: this.hasResilientArmor(actor),
                hasShield: this.hasShield(actor)
            };
        } catch (error) {
            API.log('error', `TargetUtils: Error getting target data for ${targetId}:`, error);
            return null;
        }
    }

    /**
     * Get armor class for target
     * @param {Object} actor - Actor object
     * @returns {number} Armor class value
     */
    getArmorClass(actor) {
        try {
            // This will need to be adapted based on the SW5E system structure
            return actor.system.attributes.ac?.value || 10;
        } catch (error) {
            API.log('warning', 'TargetUtils: Error getting AC:', error);
            return 10; // Default AC
        }
    }

    /**
     * Get saving throw modifiers
     * @param {Object} actor - Actor object
     * @returns {Object} Saving throw modifiers by ability
     */
    getSavingThrows(actor) {
        try {
            // This will need to be adapted based on the SW5E system structure
            const saves = {};
            const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
            
            abilities.forEach(ability => {
                const save = actor.system.abilities[ability]?.save;
                saves[ability] = save?.mod || 0;
            });
            
            return saves;
        } catch (error) {
            API.log('warning', 'TargetUtils: Error getting saving throws:', error);
            return {};
        }
    }

    /**
     * Get damage resistances
     * @param {Object} actor - Actor object
     * @returns {Array} Array of damage types the target resists
     */
    getResistances(actor) {
        try {
            // This will need to be adapted based on the SW5E system structure
            return actor.system.traits?.resistances || [];
        } catch (error) {
            API.log('warning', 'TargetUtils: Error getting resistances:', error);
            return [];
        }
    }

    /**
     * Get damage immunities
     * @param {Object} actor - Actor object
     * @returns {Array} Array of damage types the target is immune to
     */
    getImmunities(actor) {
        try {
            // This will need to be adapted based on the SW5E system structure
            return actor.system.traits?.immunities || [];
        } catch (error) {
            API.log('warning', 'TargetUtils: Error getting immunities:', error);
            return [];
        }
    }

    /**
     * Check if target has resilient armor
     * @param {Object} actor - Actor object
     * @returns {boolean} True if target has resilient armor
     */
    hasResilientArmor(actor) {
        try {
            // This will need to be adapted based on the SW5E system structure
            const armor = actor.items.find(item => item.type === 'equipment' && item.system.equipped);
            return armor?.system?.properties?.includes('resilient') || false;
        } catch (error) {
            API.log('warning', 'TargetUtils: Error checking resilient armor:', error);
            return false;
        }
    }

    /**
     * Check if target has a shield
     * @param {Object} actor - Actor object
     * @returns {boolean} True if target has a shield
     */
    hasShield(actor) {
        try {
            // This will need to be adapted based on the SW5E system structure
            const shield = actor.items.find(item => item.type === 'equipment' && item.system.equipped && item.system.armor?.type === 'shield');
            return !!shield;
        } catch (error) {
            API.log('warning', 'TargetUtils: Error checking shield:', error);
            return false;
        }
    }
}
