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
            const targets = state.dialogState.targetIDs;
            const rolls = [];

            if (state.dialogState.rollSeparate && !targets[0].noTarget) {
                // Roll separately for each target
                for (let i = 0; i < targets.length; i++) {
                    const roll = await this.createAttackRoll(diceConfig, targets[i].tokenID);
                    rolls.push(roll);
                }
            } else {
                // Roll once for all targets
                const tokenID = targets[0].noTarget ? 'noTarget' : targets[0].tokenID;
                const roll = await this.createAttackRoll(diceConfig, tokenID);
                rolls.push(roll);
            }

            API.log('debug', `DiceRoller: Created ${rolls.length} attack rolls`);
            console.log('Rolls:', rolls);
            return rolls;
        } catch (error) {
            API.log('error', 'DiceRoller: Error rolling attack pool:', error);
            throw error;
        }
    }

    /**
     * Create attack roll
     * @param {Object} diceConfig - Dice configuration
     * @param {string} targetID - Target ID
     * @returns {Roll} Roll object
     */
    async createAttackRoll(diceConfig, targetID) {
        try {
            const { formula } = diceConfig;

            // Check if baseFormula is valid
            if (!formula || formula.trim() === '') {
                throw new Error('Formula is empty or undefined');
            }
            
            // Create and evaluate roll
            const roll = await new Roll(formula)
            console.log('Roll object:', roll);
            await roll.evaluate({ async: true });
            console.log('Evaluated roll object:', roll);

            // Add roll metadata
            roll.options = {
                targetID: targetID,
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
     * @param {string} baseFormula - Dice configuration
     * @param {Object} state - Workflow state
     * @param {number} targetIndex - Target index
     * @returns {Roll} Roll object
     */
    async createDamageRoll(baseFormula, state) {
        try {
            const advantageType = state.dialogState.advantageSelection || 'Normal';
            let baseRoll = null;
            let critRoll = null;
            let normalRoll = null;
            let formula = baseFormula;
            
            if (advantageType != 'Normal') {
                // This will need to be adapted based on how critical damage is handled
                formula = baseFormula + ' + ' + baseFormula + '+ 1d12[ion] + 2[cold]'; //TODO: Implement brutal dice and vicous bonus including damage type and adding to state modifiers
            }
            
            if (advantageType == 'Advantage') {
                formula = `max(${formula}, ${formula})`;
            } else if (advantageType == 'Disadvantage') {
                formula = `min(${formula}, ${formula})`;
            }

            // Create and evaluate roll
            const roll = await new Roll(formula).evaluate({ async: true });
            
            if(advantageType != 'Normal') {
                const splitResult = this.splitCritAdvantageRoll(roll, advantageType);
                baseRoll = splitResult.baseRoll;  // Fixed destructuring
                critRoll = splitResult.critRoll;  // Fixed destructuring
            } else {
                normalRoll = roll;
            }

            return {
                normalRoll: normalRoll,
                baseRoll: baseRoll,
                critRoll: critRoll
            }
        } catch (error) {
            API.log('error', 'DiceRoller: Error creating damage roll:', error);
            throw error;
        }
    }

    splitCritAdvantageRoll(roll, advantageType) {
        // Calculate midpoint
        const midpoint = Math.floor(roll.dice.length / 2);

        // Get references to the dice arrays (not modifying the original roll)
        const firstHalfDice = roll.dice.slice(0, midpoint);
        const secondHalfDice = roll.dice.slice(midpoint);

        // Calculate sums directly from the dice arrays
        const firstHalfSum = firstHalfDice.reduce((total, die) => {
            return total + die.results
                .filter(result => result.active)
                .reduce((sum, result) => sum + result.result, 0);
        }, 0);

        const secondHalfSum = secondHalfDice.reduce((total, die) => {
            return total + die.results
                .filter(result => result.active)
                .reduce((sum, result) => sum + result.result, 0);
        }, 0);

        console.log('First half sum:', firstHalfSum);
        console.log('Second half sum:', secondHalfSum);

        // Determine winning dice set
        let winningDice;
        let winningRollReference = roll; // Keep reference to original roll for other properties
        if (secondHalfSum > firstHalfSum && advantageType === 'Advantage') {
            winningDice = secondHalfDice;
        } else {
            winningDice = firstHalfDice;
        }

        // Split the winning dice set
        const winningMidpoint = Math.floor(winningDice.length / 2);
        const baseRollDice = winningDice.slice(0, winningMidpoint);
        const critRollDice = winningDice.slice(winningMidpoint);

        // If you absolutely need Roll objects with the modified dice, you can create new ones:
        // (Note: This creates NEW Roll objects, not modifying the original)
        const baseRollFormula = baseRollDice.map(die => die.expression).join(' + ');
        const critRollFormula = critRollDice.map(die => die.expression).join(' + ');

        // Create new Roll objects if needed (they'll need to be evaluated)
        let baseRoll, critRoll;
        if (baseRollFormula) {
            baseRoll = new Roll(baseRollFormula);
            // Copy over the already-rolled dice results
            baseRoll._dice = baseRollDice;
            baseRoll._evaluated = true;
            baseRoll._total = baseRollDice.reduce((total, die) => {
                return total + die.results
                    .filter(result => result.active)
                    .reduce((sum, result) => sum + result.result, 0);
            }, 0);
        }

        if (critRollFormula) {
            critRoll = new Roll(critRollFormula);
            critRoll._dice = critRollDice;
            critRoll._evaluated = true;
            critRoll._total = critRollDice.reduce((total, die) => {
                return total + die.results
                    .filter(result => result.active)
                    .reduce((sum, result) => sum + result.result, 0);
            }, 0);
        }

        console.log('Base roll dice:', baseRollDice);
        console.log('Crit roll dice:', critRollDice);
        console.log('Base roll object:', baseRoll);
        console.log('Crit roll object:', critRoll);

        return {
            baseRoll: baseRoll,
            critRoll: critRoll
        }

    }

}
