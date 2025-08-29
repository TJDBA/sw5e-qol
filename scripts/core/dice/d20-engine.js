/**
 * SW5E QoL - D20 Engine
 * Handles d20 vs target number resolution and contested rolls
 * Based on planning documents: d20-engine.js - D20 check evaluator
 */

export class D20Engine {
	constructor() {
		// Critical ranges for different check types
		this.criticalRanges = {
			attack: { min: 20, max: 20 },
			skill: { min: 20, max: 20 },
			save: { min: 20, max: 20 },
			ability: { min: 20, max: 20 },
			contested: { min: 20, max: 20 }
		};
		
		// Critical failure ranges
		this.criticalFailureRanges = {
			attack: { min: 1, max: 1 },
			skill: { min: 1, max: 1 },
			save: { min: 1, max: 1 },
			ability: { min: 1, max: 1 },
			contested: { min: 1, max: 1 }
		};
		
		// Check type configurations
		this.checkTypes = {
			attack: {
				successThreshold: 'targetAC',
				criticalSuccess: 'autoHit',
				criticalFailure: 'autoMiss',
				degreeOfSuccess: false
			},
			skill: {
				successThreshold: 'targetDC',
				criticalSuccess: 'autoSuccess',
				criticalFailure: 'autoFailure',
				degreeOfSuccess: true
			},
			save: {
				successThreshold: 'targetDC',
				criticalSuccess: 'autoSuccess',
				criticalFailure: 'autoFailure',
				degreeOfSuccess: true
			},
			ability: {
				successThreshold: 'targetDC',
				criticalSuccess: 'autoSuccess',
				criticalFailure: 'autoFailure',
				degreeOfSuccess: true
			},
			contested: {
				successThreshold: 'opponentRoll',
				criticalSuccess: 'autoSuccess',
				criticalFailure: 'autoFailure',
				degreeOfSuccess: false
			}
		};
	}
	
	/**
	 * Execute a d20 roll with the given formula and options
	 * @param {string} formula - Dice formula (e.g., "1d20+5")
	 * @param {Object} rollOptions - Roll options
	 * @returns {Promise<Object>} - Promise resolving to roll result object
	 */
	async executeD20Roll(formula, rollOptions = {}) {
		try {
			// Create roll object
			const roll = new Roll(formula);
			
			// Set roll options
			roll.options = { ...roll.options, ...rollOptions };
			
			// Execute roll
			const result = await roll.evaluate({ async: true });
			
			// Process result
			const processedResult = this.processD20Result(result, rollOptions);
			
			return processedResult;
		} catch (error) {
			console.error('SW5E QoL | D20 roll error:', error);
			throw error;
		}
	}
	
	/**
	 * Calculate d20 results against a target number
	 * @param {Object} rollResult - Roll result object
	 * @param {number} targetNumber - Target number (AC, DC, etc.)
	 * @param {string} checkType - Type of check being made
	 * @returns {Object} - Result evaluation object
	 */
	calculateD20Results(rollResult, targetNumber, checkType = 'attack') {
		const checkConfig = this.checkTypes[checkType] || this.checkTypes.attack;
		const rollTotal = rollResult.total;
		const rollValue = rollResult.dice[0]?.results[0]?.result || rollTotal;
		
		// Determine critical ranges
		const criticalRange = this.getCriticalRange(checkType, rollOptions);
		const criticalFailureRange = this.getCriticalFailureRange(checkType, rollOptions);
		
		// Check for critical success
		const isCriticalSuccess = this.isCriticalSuccess(rollValue, criticalRange);
		
		// Check for critical failure
		const isCriticalFailure = this.isCriticalFailure(rollValue, criticalFailureRange);
		
		// Determine success/failure
		let success = false;
		let degree = 'failure';
		
		if (isCriticalSuccess && checkConfig.criticalSuccess === 'autoSuccess') {
			success = true;
			degree = 'criticalSuccess';
		} else if (isCriticalFailure && checkConfig.criticalFailure === 'autoFailure') {
			success = false;
			degree = 'criticalFailure';
		} else {
			// Normal success/failure check
			success = rollTotal >= targetNumber;
			degree = success ? 'success' : 'failure';
			
			// Calculate degree of success if enabled
			if (checkConfig.degreeOfSuccess && success) {
				degree = this.calculateDegreeOfSuccess(rollTotal, targetNumber);
			}
		}
		
		// Calculate margin
		const margin = rollTotal - targetNumber;
		
		return {
			rollTotal,
			rollValue,
			targetNumber,
			success,
			degree,
			margin,
			isCriticalSuccess,
			isCriticalFailure,
			checkType,
			checkConfig
		};
	}
	
	/**
	 * Handle contested roll between multiple participants
	 * @param {Array} participants - Array of participant objects
	 * @returns {Promise<Object>} - Promise resolving to contested roll result
	 */
	async handleContestedRoll(participants) {
		try {
			const results = [];
			
			// Roll for each participant
			for (const participant of participants) {
				const rollResult = await this.executeD20Roll(
					participant.formula,
					participant.options || {}
				);
				
				results.push({
					participant: participant.name || participant.id,
					rollResult,
					total: rollResult.total
				});
			}
			
			// Sort by roll total (highest first)
			results.sort((a, b) => b.total - a.total);
			
			// Determine winner(s)
			const highestRoll = results[0].total;
			const winners = results.filter(r => r.total === highestRoll);
			
			// Check for ties
			const isTie = winners.length > 1;
			
			return {
				results,
				winners: isTie ? winners : [winners[0]],
				highestRoll,
				isTie,
				participantCount: participants.length
			};
		} catch (error) {
			console.error('SW5E QoL | Contested roll error:', error);
			throw error;
		}
	}
	
	/**
	 * Apply d20 modifiers to a base roll
	 * @param {Object} baseRoll - Base roll object
	 * @param {Array} modifiers - Array of modifier objects
	 * @returns {Object} - Modified roll object
	 */
	applyD20Modifiers(baseRoll, modifiers) {
		let modifiedRoll = { ...baseRoll };
		let totalModifier = 0;
		
		// Apply each modifier
		for (const modifier of modifiers) {
			if (modifier.enabled !== false) {
				totalModifier += modifier.value;
				
				// Track applied modifiers
				if (!modifiedRoll.appliedModifiers) {
					modifiedRoll.appliedModifiers = [];
				}
				modifiedRoll.appliedModifiers.push({
					...modifier,
					appliedAt: Date.now()
				});
			}
		}
		
		// Update total
		modifiedRoll.total += totalModifier;
		modifiedRoll.totalModifier = totalModifier;
		
		return modifiedRoll;
	}
	
	/**
	 * Process d20 roll result
	 * @param {Object} result - Raw roll result
	 * @param {Object} options - Roll options
	 * @returns {Object} - Processed result
	 */
	processD20Result(result, options) {
		// Extract d20 value
		const d20Result = result.dice.find(d => d.faces === 20);
		const d20Value = d20Result ? d20Result.results[0]?.result : null;
		
		// Add metadata
		result.metadata = {
			...result.metadata,
			d20Value,
			checkType: options.checkType || 'attack',
			rollOptions: options
		};
		
		return result;
	}
	
	/**
	 * Get critical range for a check type
	 * @param {string} checkType - Type of check
	 * @param {Object} options - Roll options
	 * @returns {Object} - Critical range object
	 */
	getCriticalRange(checkType, options = {}) {
		let baseRange = this.criticalRanges[checkType] || this.criticalRanges.attack;
		
		// Apply weapon/power specific critical ranges
		if (options.criticalRange) {
			baseRange = { ...baseRange, ...options.criticalRange };
		}
		
		// Apply class feature modifications
		if (options.classFeatures) {
			baseRange = this.applyClassFeatureModifications(baseRange, options.classFeatures);
		}
		
		return baseRange;
	}
	
	/**
	 * Get critical failure range for a check type
	 * @param {string} checkType - Type of check
	 * @param {Object} options - Roll options
	 * @returns {Object} - Critical failure range object
	 */
	getCriticalFailureRange(checkType, options = {}) {
		let baseRange = this.criticalFailureRanges[checkType] || this.criticalFailureRanges.attack;
		
		// Apply class feature modifications
		if (options.classFeatures) {
			baseRange = this.applyClassFeatureModifications(baseRange, options.classFeatures);
		}
		
		return baseRange;
	}
	
	/**
	 * Check if a roll is a critical success
	 * @param {number} rollValue - Raw d20 value
	 * @param {Object} criticalRange - Critical range object
	 * @returns {boolean} - True if critical success
	 */
	isCriticalSuccess(rollValue, criticalRange) {
		return rollValue >= criticalRange.min && rollValue <= criticalRange.max;
	}
	
	/**
	 * Check if a roll is a critical failure
	 * @param {number} rollValue - Raw d20 value
	 * @param {Object} criticalFailureRange - Critical failure range object
	 * @returns {boolean} - True if critical failure
	 */
	isCriticalFailure(rollValue, criticalFailureRange) {
		return rollValue >= criticalFailureRange.min && rollValue <= criticalFailureRange.max;
	}
	
	/**
	 * Calculate degree of success for skill checks
	 * @param {number} rollTotal - Total roll result
	 * @param {number} targetDC - Target difficulty class
	 * @returns {string} - Degree of success
	 */
	calculateDegreeOfSuccess(rollTotal, targetDC) {
		const margin = rollTotal - targetDC;
		
		if (margin >= 10) return 'criticalSuccess';
		if (margin >= 5) return 'majorSuccess';
		if (margin >= 0) return 'success';
		if (margin >= -5) return 'minorFailure';
		if (margin >= -10) return 'majorFailure';
		return 'criticalFailure';
	}
	
	/**
	 * Apply class feature modifications to critical ranges
	 * @param {Object} baseRange - Base critical range
	 * @param {Array} classFeatures - Array of class features
	 * @returns {Object} - Modified critical range
	 */
	applyClassFeatureModifications(baseRange, classFeatures) {
		let modifiedRange = { ...baseRange };
		
		for (const feature of classFeatures) {
			if (feature.type === 'criticalRange') {
				// Expand critical range
				if (feature.expand) {
					modifiedRange.min = Math.min(modifiedRange.min, feature.expand.min);
					modifiedRange.max = Math.max(modifiedRange.max, feature.expand.max);
				}
				
				// Set specific critical range
				if (feature.set) {
					modifiedRange = { ...feature.set };
				}
			}
		}
		
		return modifiedRange;
	}
	
	/**
	 * Validate d20 roll options
	 * @param {Object} options - Roll options
	 * @returns {Object} - Validation result
	 */
	validateRollOptions(options) {
		const errors = [];
		
		// Check for valid check type
		if (options.checkType && !this.checkTypes[options.checkType]) {
			errors.push(`Invalid check type: ${options.checkType}`);
		}
		
		// Check for valid critical range
		if (options.criticalRange) {
			if (options.criticalRange.min < 1 || options.criticalRange.max > 20) {
				errors.push('Critical range must be between 1 and 20');
			}
			if (options.criticalRange.min > options.criticalRange.max) {
				errors.push('Critical range min cannot be greater than max');
			}
		}
		
		return {
			valid: errors.length === 0,
			errors
		};
	}
}
