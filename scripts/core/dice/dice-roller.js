/**
 * Dice Roller Class
 * Executes Roll objects and handles roll-time modifications
 * Location: scripts/core/dice/dice-roller.js
 */

import { API } from '../../api.js';

/**
 * Dice Roller Class
 * Handles dice rolling execution
 */
export class DiceRoller {
    constructor() {
        // Initialize any required dependencies
    }


    /**
     * Roll attack pool
     * @param {Object} diceConfig - Dice configuration
     * @param {Object} state - Workflow state
     * @returns {Array} Array of Roll objects
     */
    async rollAttackPool(diceConfig, state) {
        try {
            const { targets, rollSeparate, basePool } = diceConfig;
            const rolls = [];

            if (rollSeparate && targets.length > 1) {
                // Roll separately for each target
                for (let i = 0; i < targets.length; i++) {
                    const roll = await this.createAttackRoll(diceConfig, state, i);
                    rolls.push(roll);
                }
            } else {
                // Roll once for all targets
                const roll = await this.createAttackRoll(diceConfig, state, 0);
                rolls.push(roll);
            }

            API.log('debug', `DiceRoller: Created ${rolls.length} attack rolls`);
            return rolls;
        } catch (error) {
            API.log('error', 'DiceRoller: Error rolling attack pool:', error);
            throw error;
        }
    }

    /**
     * Roll damage pool
     * @param {Object} diceConfig - Dice configuration
     * @param {Object} state - Workflow state
     * @returns {Array} Array of Roll objects
     */
    async rollDamagePool(diceConfig, state) {
        try {
            const { targets, rollSeparate, critical } = diceConfig;
            const rolls = [];

            if (rollSeparate && targets.length > 1) {
                // Roll separately for each target
                for (let i = 0; i < targets.length; i++) {
                    const roll = await this.createDamageRoll(diceConfig, i);
                    rolls.push(roll);
                }
            } else {
                // Roll once for all targets
                const roll = await this.createDamageRoll(diceConfig, 0);
                rolls.push(roll);
            }

            API.log('debug', `DiceRoller: Created ${rolls.length} damage rolls`);
            return rolls;
        } catch (error) {
            API.log('error', 'DiceRoller: Error rolling damage pool:', error);
            throw error;
        }
    }

    /**
     * Create attack roll
     * @param {Object} diceConfig - Dice configuration
     * @param {Object} state - Workflow state
     * @param {number} targetIndex - Target index
     * @returns {Roll} Roll object
     */
    async createAttackRoll(diceConfig, targetIndex) {
        try {
            const { baseFormula } = diceConfig;
            
            // Create and evaluate roll
            const roll = await new Roll(baseFormula).evaluate({ async: true });
            
            // Add roll metadata
            roll.options = {
                basePool: basePool,
                targetIndex: targetIndex,
                rollType: 'attack'
            };

            return roll;
        } catch (error) {
            API.log('error', 'DiceRoller: Error creating attack roll:', error);
            throw error;
        }
    }

    /**
     * Create damage roll
     * @param {Object} diceConfig - Dice configuration
     * @param {Object} state - Workflow state
     * @param {number} targetIndex - Target index
     * @returns {Roll} Roll object
     */
    async createDamageRoll(diceConfig, state, targetIndex) {
        try {
            const { baseFormula, critical } = diceConfig;
            
            let formula = baseFormula;

            const advantageType = state.dialogState.advantageSelection || 'Normal';
            if (advantageType === 'Advantage') {
                formula = `max(${baseFormula}, ${baseFormula})`;
            } else if (advantageType === 'Disadvantage') {
                formula = `min(${baseFormula}, ${baseFormula})`;
            }

           
            // Apply critical hit doubling if applicable
            if (critical) {
                // This will need to be adapted based on how critical damage is handled
                formula = `(${baseFormula}) * 2`;
            }

            // Create and evaluate roll
            const roll = await new Roll(formula).evaluate({ async: true });
            
            // Add roll metadata
            roll.options = {
                targetIndex: targetIndex,
                rollType: 'damage',
                critical: critical || false
            };

            return roll;
        } catch (error) {
            API.log('error', 'DiceRoller: Error creating damage roll:', error);
            throw error;
        }
    }
}
