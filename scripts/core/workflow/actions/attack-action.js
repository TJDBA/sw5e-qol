/**
 * Attack Action
 * Handles attack roll execution
 * Location: scripts/core/workflow/actions/attack-action.js
 */

import { API } from '../../../api.js';
import { DiceBuilder, DiceRoller, D20Processor, CriticalDetector } from '../../dice/index.js';
import { getActorFromTokenID } from '../../../actors/actor-util.js';
import { getWeaponById } from '../../../actors/item-util.js';

const logThisFile = false;

/**
 * Attack Action Class
 * Handles attack roll processing with three steps:
 * 1. Build dice pool
 * 2. Roll dice
 * 3. Check results
 */
export class AttackAction {
    constructor() {
        if (logThisFile) API.log('debug', 'AttackAction: Constructor called');
        this.diceBuilder = new DiceBuilder();
        this.diceRoller = new DiceRoller();
        this.d20Processor = new D20Processor();
        this.criticalDetector = new CriticalDetector();
    }

    /**
     * Execute the attack action
     * @param {Object} state - Workflow state object
     * @returns {Object} Modified workflow state
     */
    async execute(state) {
        try {
            if (logThisFile) API.log('debug', 'AttackAction: Starting execution');
            let results = [];
            
            console.log('⚔️ AttackAction called!');
            console.log('Current state:', state);
            
            // Step 1: Build the dice pool
            const diceConfig = await this.buildDicePool(state);
            if (logThisFile) API.log('debug', 'AttackAction: Step 1 - Dice pool built', diceConfig);
            
            // Step 2: Roll the dice
            const rolls = await this.rollDice(diceConfig, state);
            if (logThisFile) API.log('debug', 'AttackAction: Step 2 - Dice rolled', rolls);
            
            // Step 3: Check results
            if(!state.dialogState.targetIDs[0].noTarget) {
                results = await this.checkResults(state, rolls, state.dialogState.targetIDs);
            } else {
                results = [{rollTotal: rolls[0].total, target: state.dialogState.targetIDs[0]}];
            }
            if (logThisFile) API.log('debug', 'AttackAction: Step 3 - Results checked', results);
            
            // Update state with attack results
            state.attackResults = results;
            state.diceConfig = diceConfig;
            state.rolls = rolls;
            
            if (logThisFile) API.log('debug', 'AttackAction: Execution completed');
            return state;
            
        } catch (error) {
            API.log('error', 'AttackAction: Failed to execute:', error);
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
            if (logThisFile) API.log('debug', 'AttackAction: Building dice pool');
            const diceConfig = await this.diceBuilder.buildAttackPool(state);
            console.log('🎲 Step 1 - Dice pool built:', diceConfig);
            return diceConfig;
        } catch (error) {
            API.log('error', 'AttackAction: Error building dice pool:', error);
            throw error;
        }
    }

    /**
     * Step 2: Roll the dice
     * @param {Object} diceConfig - Dice configuration
     * @param {Object} state - Workflow state
     * @returns {Array} Array of Roll objects
     */
    async rollDice(diceConfig, state) {
        try {
            if (logThisFile) API.log('debug', 'AttackAction: Rolling dice');
            const rolls = await this.diceRoller.rollAttackPool(diceConfig, state);
            console.log('🎲 Step 2 - Dice rolled:', rolls.length, 'rolls');
            return rolls;
        } catch (error) {
            API.log('error', 'AttackAction: Error rolling dice:', error);
            throw error;
        }
    }

    /**
     * Step 3: Check results
     * @param {Object} state - Workflow state
     * @param {Array} rolls - Array of Roll objects
     * @param {Array} targetIDs - Array of targets
     * @returns {Array} Array of attack results
     */
    async checkResults(state, rolls, targetIDs) {
        try {
            if (logThisFile) API.log('debug', 'AttackAction: Checking results');
            
            const results = [];
            const actor = await getActorFromTokenID(state.dialogState.ownerID);
            const weapon = getWeaponById(actor, state.dialogState.itemID);
            
            console.log('🎯 Step 3 - Target IDs:', targetIDs);
            for (let i = 0; i < rolls.length; i++) {
                const roll = rolls[i];
                
                // Use getActorFromTokenID utility to retrieve the target actor from the token ID
                console.log('🎯 Step 3 - Target ID:', targetIDs[i].tokenId);
                const target = await getActorFromTokenID(targetIDs[i].tokenId);
                
                API.log('debug', 'AttackAction: Checking results for target:', target);
                
                // Check if there is a target
                const hitResult = this.d20Processor.checkAttack(roll, target);

                const criticalResult = this.criticalDetector.checkCritical(roll, hitResult, target, weapon.criticalThreshold);
                
                results.push({
                    rollTotal: roll.total,
                    target: target,
                    hitResult: hitResult,
                    criticalResult: criticalResult,
                    success: hitResult.hit,
                    isCritical: criticalResult.isCritical
                });
                
            }
            
            console.log('🎯 Step 3 - Results checked:', results.length, 'results');
            return results;
        } catch (error) {
            API.log('error', 'AttackAction: Error checking results:', error);
            throw error;
        }
    }
}
