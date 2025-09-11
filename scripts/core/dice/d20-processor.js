/**
 * D20 Processor Class
 * Handles d20-based checks for attacks, saves, and skill checks
 * Location: scripts/core/dice/d20-processor.js
 */

import { API } from '../../../api.js';

/**
 * D20 Processor Class
 * Manages d20-based check processing
 */
export class D20Processor {
    constructor() {
        // Initialize any required dependencies
    }

    /**
     * Check attack roll against target AC
     * @param {Roll} attackRoll - Attack roll object
     * @param {Object} target - Target object with AC
     * @returns {Object} Attack check result
     */
    checkAttack(attackRoll, target) {
        try {
            const attackTotal = attackRoll.total;
            const targetAC = target.ac;
            const hit = attackTotal >= targetAC;

            return {
                hit: hit,
                attackTotal: attackTotal,
                targetAC: targetAC,
                margin: attackTotal - targetAC,
                naturalRoll: this.getNaturalRoll(attackRoll)
            };
        } catch (error) {
            API.log('error', 'D20Processor: Error checking attack:', error);
            return {
                hit: false,
                attackTotal: 0,
                targetAC: 0,
                margin: 0,
                naturalRoll: 0,
                error: error.message
            };
        }
    }

    /**
     * Check saving throw against DC
     * @param {Roll} saveRoll - Saving throw roll object
     * @param {number} dc - Difficulty class
     * @param {Object} target - Target object
     * @returns {Object} Save check result
     */
    checkSave(saveRoll, dc, target) {
        try {
            const saveTotal = saveRoll.total;
            const success = saveTotal >= dc;

            return {
                success: success,
                saveTotal: saveTotal,
                dc: dc,
                margin: saveTotal - dc,
                naturalRoll: this.getNaturalRoll(saveRoll)
            };
        } catch (error) {
            API.log('error', 'D20Processor: Error checking save:', error);
            return {
                success: false,
                saveTotal: 0,
                dc: dc,
                margin: 0,
                naturalRoll: 0,
                error: error.message
            };
        }
    }

    /**
     * Check skill check against DC
     * @param {Roll} skillRoll - Skill check roll object
     * @param {number} dc - Difficulty class
     * @param {Object} target - Target object
     * @returns {Object} Skill check result
     */
    checkSkill(skillRoll, dc, target) {
        try {
            const skillTotal = skillRoll.total;
            const success = skillTotal >= dc;

            return {
                success: success,
                skillTotal: skillTotal,
                dc: dc,
                margin: skillTotal - dc,
                naturalRoll: this.getNaturalRoll(skillRoll)
            };
        } catch (error) {
            API.log('error', 'D20Processor: Error checking skill:', error);
            return {
                success: false,
                skillTotal: 0,
                dc: dc,
                margin: 0,
                naturalRoll: 0,
                error: error.message
            };
        }
    }

    /**
     * Get natural d20 roll from roll object
     * @param {Roll} roll - Roll object
     * @returns {number} Natural d20 result
     */
    getNaturalRoll(roll) {
        try {
            // Find the first d20 die in the roll
            for (const die of roll.dice) {
                if (die.faces === 20) {
                    return die.results[0]?.result || 0;
                }
            }
            return 0;
        } catch (error) {
            API.log('warning', 'D20Processor: Error getting natural roll:', error);
            return 0;
        }
    }
}
