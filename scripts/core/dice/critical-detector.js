/**
 * Critical Detector Class
 * Handles critical hit detection logic
 * Location: scripts/core/dice/critical-detector.js
 */

import { API } from '../../../api.js';

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
     * @returns {Object} Critical hit result
     */
    checkCritical(attackRoll, hitResult, target) {
        try {
            const naturalRoll = this.getNaturalRoll(attackRoll);
            const isNatural20 = naturalRoll === 20;
            const isCriticalThreshold = this.checkCriticalThreshold(attackRoll, target);
            const isCritical = isNatural20 || (isCriticalThreshold && hitResult.hit);

            return {
                isCritical: isCritical,
                naturalRoll: naturalRoll,
                isNatural20: isNatural20,
                isCriticalThreshold: isCriticalThreshold,
                type: this.getCriticalType(isNatural20, isCriticalThreshold),
                threshold: this.getCriticalThreshold(target)
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
     * @returns {boolean} True if meets critical threshold
     */
    checkCriticalThreshold(attackRoll, target) {
        try {
            const naturalRoll = this.getNaturalRoll(attackRoll);
            const criticalThreshold = this.getCriticalThreshold(target);
            return naturalRoll >= criticalThreshold;
        } catch (error) {
            API.log('warning', 'CriticalDetector: Error checking critical threshold:', error);
            return false;
        }
    }

    /**
     * Get critical threshold for target
     * @param {Object} target - Target object
     * @returns {number} Critical threshold (default 20)
     */
    getCriticalThreshold(target) {
        try {
            // This will need to be adapted based on the SW5E system structure
            // For now, return default threshold
            return 20;
        } catch (error) {
            API.log('warning', 'CriticalDetector: Error getting critical threshold:', error);
            return 20;
        }
    }

    /**
     * Get critical type based on detection method
     * @param {boolean} isNatural20 - Is natural 20
     * @param {boolean} isCriticalThreshold - Meets critical threshold
     * @returns {string} Critical type
     */
    getCriticalType(isNatural20, isCriticalThreshold) {
        if (isNatural20) {
            return 'natural20';
        } else if (isCriticalThreshold) {
            return 'threshold';
        } else {
            return 'none';
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
