/**
 * Damage Action
 * Handles damage roll execution
 * Location: scripts/core/workflow/actions/damage-action.js
 */

import { API } from '../../../api.js';
import { DiceBuilder, DiceRoller } from '../../dice/index.js';
import { getActorFromTokenID } from '../../../actors/actor-util.js';
import { getWeaponById } from '../../../actors/item-util.js';

const logThisFile = true;

/**
 * Damage Action Class
 * Handles damage roll processing with three steps:
 * 1. Build dice pool
 * 2. Roll dice
 * 3. Process results
 */
export class DamageAction {
    constructor() {
        if (logThisFile) API.log('debug', 'DamageAction: Constructor called');
        this.diceBuilder = new DiceBuilder();
        this.diceRoller = new DiceRoller();
    }

    /**
     * Execute the damage action
     * @param {Object} state - Workflow state object
     * @returns {Object} Modified workflow state
     */
    async execute(state) {
        try {
            if (logThisFile) API.log('debug', 'DamageAction: Starting execution');
            let results = [];
            
            console.log('💥 DamageAction called!');
            console.log('Current state:', state);
            
            // Step 1: Build the dice pool
            const diceConfig = await this.buildDicePool(state);
            if (logThisFile) API.log('debug', 'DamageAction: Step 1 - Dice pool built', diceConfig);
            
            // Step 2: Roll the dice
            const rolls = await this.rollDice(diceConfig, state);
            if (logThisFile) API.log('debug', 'DamageAction: Step 2 - Dice rolled', rolls);
            
            // Step 3: Process results
            if(!state.dialogState.targetIDs[0].noTarget) {
                results = await this.processDamageResults(state, rolls, state.dialogState.targetIDs);
            } else {
                results = [{damageTotal: rolls.normalRoll?.total || 0, target: state.dialogState.targetIDs[0]}];
            }
            if (logThisFile) API.log('debug', 'DamageAction: Step 3 - Results processed', results);
            
            // Update state with damage results
            state.damageResults = results;
            state.diceConfig = diceConfig;
            state.rolls = rolls;
            
            if (logThisFile) API.log('debug', 'DamageAction: Execution completed');
            return state;
            
        } catch (error) {
            API.log('error', 'DamageAction: Failed to execute:', error);
            throw error;
        }
    }

    /**
     * Step 1: Build the dice pool
     * @param {Object} state - Workflow state
     * @returns {Object} Dice pool configuration
     */
    async buildDicePool(state) {
        try {
            if (logThisFile) API.log('debug', 'DamageAction: Building dice pool');
            const diceConfig = await this.diceBuilder.buildDamagePool(state);
            console.log('🎲 Step 1 - Damage dice pool built:', diceConfig);
            return diceConfig;
        } catch (error) {
            API.log('error', 'DamageAction: Error building dice pool:', error);
            throw error;
        }
    }

    /**
     * Step 2: Roll the dice
     * @param {Object} diceConfig - Dice configuration
     * @param {Object} state - Workflow state
     * @returns {Object} Roll results object
     */
    async rollDice(diceConfig, state) {
        try {
            if (logThisFile) API.log('debug', 'DamageAction: Rolling dice');
            const rolls = await this.diceRoller.createDamageRoll(diceConfig.formula, state);
            console.log('🎲 Step 2 - Damage dice rolled:', rolls);
            return rolls;
        } catch (error) {
            API.log('error', 'DamageAction: Error rolling dice:', error);
            throw error;
        }
    }

    /**
     * Step 3: Process damage results
     * @param {Object} state - Workflow state
     * @param {Object} rolls - Roll results object
     * @param {Array} targetIDs - Array of targets
     * @returns {Array} Array of damage results
     */
    async processDamageResults(state, rolls, targetIDs) {
        try {
            if (logThisFile) API.log('debug', 'DamageAction: Processing damage results');
            
            const results = [];
            const actor = await getActorFromTokenID(state.dialogState.ownerID);
            const weapon = getWeaponById(actor, state.dialogState.itemID);
            
            console.log('💥 Step 3 - Target IDs:', targetIDs);
            
            // Process each target
            for (let i = 0; i < targetIDs.length; i++) {
                const targetID = targetIDs[i];
                
                // Use getActorFromTokenID utility to retrieve the target actor from the token ID
                console.log('💥 Step 3 - Target ID:', targetID.tokenId);
                const target = await getActorFromTokenID(targetID.tokenId);
                
                API.log('debug', 'DamageAction: Processing damage for target:', target);
                
                // Calculate damage based on critical hit status from attack results
                const isCritical = state.attackResults?.[i]?.isCritical || false;
                const damageTotal = this.calculateDamageTotal(rolls, isCritical);
                
                // Calculate damage by type
                const damageByType = this.calculateDamageByType(rolls, isCritical);
                
                results.push({
                    damageTotal: damageTotal,
                    damageByType: damageByType,
                    target: target,
                    isCritical: isCritical,
                    normalRoll: rolls.normalRoll,
                    baseRoll: rolls.baseRoll,
                    critRoll: rolls.critRoll
                });
            }
            
            console.log('💥 Step 3 - Damage results processed:', results.length, 'results');
            return results;
        } catch (error) {
            API.log('error', 'DamageAction: Error processing damage results:', error);
            throw error;
        }
    }

    /**
     * Calculate total damage based on critical hit status
     * @param {Object} rolls - Roll results object
     * @param {boolean} isCritical - Whether this is a critical hit
     * @returns {number} Total damage amount
     */
    calculateDamageTotal(rolls, isCritical) {
        try {
            if (isCritical) {
                // For critical hits, use base roll + crit roll if available
                const baseTotal = rolls.baseRoll?.total || 0;
                const critTotal = rolls.critRoll?.total || 0;
                return baseTotal + critTotal;
            } else {
                // For normal hits, use normal roll
                return rolls.normalRoll?.total || 0;
            }
        } catch (error) {
            API.log('error', 'DamageAction: Error calculating damage total:', error);
            return 0;
        }
    }

    /**
     * Calculate damage by type
     * @param {Object} rolls - Roll results object
     * @param {boolean} isCritical - Whether this is a critical hit
     * @returns {Object} Damage amounts by type
     */
    calculateDamageByType(rolls, isCritical) {
        try {
            const damageByType = {};
            
            // Process normal roll
            if (rolls.normalRoll) {
                this.addRollToDamageByType(rolls.normalRoll, damageByType);
            }
            
            // Process critical rolls if applicable
            if (isCritical) {
                if (rolls.baseRoll) {
                    this.addRollToDamageByType(rolls.baseRoll, damageByType);
                }
                if (rolls.critRoll) {
                    this.addRollToDamageByType(rolls.critRoll, damageByType);
                }
            }
            
            return damageByType;
        } catch (error) {
            API.log('error', 'DamageAction: Error calculating damage by type:', error);
            return {};
        }
    }

    /**
     * Add roll results to damage by type calculation
     * @param {Roll} roll - Roll object
     * @param {Object} damageByType - Damage by type object to update
     */
    addRollToDamageByType(roll, damageByType) {
        try {
            if (!roll || !roll.terms) return;
            
            roll.terms.forEach(term => {
                const flavor = term.options?.flavor;
                if (flavor) {
                    damageByType[flavor] = (damageByType[flavor] || 0) + term.total;
                }
            });
        } catch (error) {
            API.log('error', 'DamageAction: Error adding roll to damage by type:', error);
        }
    }
}

