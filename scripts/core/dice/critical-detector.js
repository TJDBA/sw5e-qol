/**
 * Critical Detector Class
 * Handles critical hit detection logic
 * Location: scripts/core/dice/critical-detector.js
 */

import { API } from '../../api.js';
import { getDataPaths } from '../../core/utils/reference/data-lookup.js';

/**
 * Critical Detector Class
 * Manages critical hit detection and classification
 */
export class CriticalDetector {
    constructor() {
        // Initialize any required dependencies
    }

    /**
     * Check if attack is a critical hit
     * @param {Roll} attackRoll - Attack roll object
     * @param {Object} hitResult - Hit result from D20Processor
     * @param {Object} target - Target object
     * @param {number} criticalThreshold - Critical threshold
     * @returns {Object} Critical hit result
     */
    checkCritical(attackRoll, hitResult, target, criticalThreshold) {
        try {
            const naturalRoll = this.getNaturalRoll(attackRoll);
            const isNatural20 = naturalRoll === 20;
            
            const isCriticalThreshold = (isNatural20 || hitResult.hit) ? this.checkCriticalThreshold(attackRoll, target, criticalThreshold || 20) : false;
            const isCritical = isNatural20 || (isCriticalThreshold && hitResult.hit);

            return {
                isCritical: isCritical,
                naturalRoll: naturalRoll,
                isNatural20: isNatural20,
                isCriticalThreshold: isCriticalThreshold,
                type: isNatural20 ? 'natural20' : isCriticalThreshold ? 'threshold' : 'none',
                threshold: criticalThreshold
            };
        } catch (error) {
            API.log('error', 'CriticalDetector: Error checking critical:', error);
            return {
                isCritical: false,
                naturalRoll: 0,
                isNatural20: false,
                isCriticalThreshold: false,
                type: 'none',
                threshold: 20,
                error: error.message
            };
        }
    }

    /**
     * Check if roll meets critical threshold
     * @param {Roll} attackRoll - Attack roll object
     * @param {Object} target - Target object
     * @param {number} criticalThreshold - Critical threshold
     * @returns {boolean} True if meets critical threshold
     */
    checkCriticalThreshold(attackRoll, target, criticalThreshold) {
        try {
            const naturalRoll = this.getNaturalRoll(attackRoll);
            return naturalRoll >= criticalThreshold;
        } catch (error) {
            API.log('warning', 'CriticalDetector: Error checking critical threshold:', error);
            return false;
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
            API.log('warning', 'CriticalDetector: Error getting natural roll:', error);
            return 0;
        }
    }
}
