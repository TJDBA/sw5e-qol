/**
 * SW5E QoL - Universal Dice Engine
 * Handles all dice rolling operations for the module
 * Based on planning documents: dice-engine.js - Universal dice roller
 */

import { FormulaParser } from './formula-parser.js';
import { D20Engine } from './d20-engine.js';

export class DiceEngine {
	constructor() {
		this.parser = new FormulaParser();
		this.d20Engine = new D20Engine();
		
		// Roll cache for performance
		this.rollCache = new Map();
		
		// Dice animation support
		this.diceSoNice = game.modules.get('dice-so-nice')?.active || false;
	}
	
	/**
	 * Execute a dice roll with the given formula and options
	 * @param {string} formula - Dice formula (e.g., "2d20kh1+5")
	 * @param {Object} options - Roll options
	 * @returns {Promise<Roll>} - Promise resolving to Roll object
	 */
	async executeRoll(formula, options = {}) {
		try {
			// Parse and validate formula
			const parsedFormula = this.parser.parseRollFormula(formula);
			if (!parsedFormula.valid) {
				throw new Error(`Invalid dice formula: ${parsedFormula.error}`);
			}
			
			// Build roll pool
			const rollPool = this.buildRollPool(parsedFormula, options);
			
			// Execute rolls
			const results = await this.executeRolls(rollPool, options.rollMode);
			
			// Apply roll modifications (advantage, rerolls, etc.)
			const modifiedResults = this.applyRollModifications(results, options);
			
			// Animate rolls if enabled
			if (this.diceSoNice && options.animate !== false) {
				await this.animateRolls(modifiedResults);
			}
			
			return modifiedResults;
		} catch (error) {
			console.error('SW5E QoL | Dice roll error:', error);
			throw error;
		}
	}
	
	/**
	 * Build roll pool from parsed formula
	 * @param {Object} parsedFormula - Parsed formula object
	 * @param {Object} options - Roll options
	 * @returns {Array} - Array of roll objects
	 */
	buildRollPool(parsedFormula, options) {
		const rollPool = [];
		
		// Process each dice group
		for (const diceGroup of parsedFormula.diceGroups) {
			const roll = new Roll(diceGroup.formula);
			
			// Add metadata
			roll.metadata = {
				type: diceGroup.type,
				quantity: diceGroup.quantity,
				sides: diceGroup.sides,
				modifiers: diceGroup.modifiers,
				options: options
			};
			
			rollPool.push(roll);
		}
		
		// Add flat modifiers
		if (parsedFormula.flatModifiers.length > 0) {
			const modifierRoll = new Roll(parsedFormula.flatModifiers.join('+'));
			modifierRoll.metadata = {
				type: 'modifier',
				flatModifiers: parsedFormula.flatModifiers
			};
			rollPool.push(modifierRoll);
		}
		
		return rollPool;
	}
	
	/**
	 * Execute all rolls in the pool
	 * @param {Array} rollPool - Array of roll objects
	 * @param {string} rollMode - Roll mode (public, gm, blind, self)
	 * @returns {Promise<Array>} - Promise resolving to array of roll results
	 */
	async executeRolls(rollPool, rollMode = 'publicroll') {
		const results = [];
		
		for (const roll of rollPool) {
			// Set roll mode
			roll.options.rollMode = rollMode;
			
			// Execute roll
			const result = await roll.evaluate({ async: true });
			results.push(result);
		}
		
		return results;
	}
	
	/**
	 * Apply roll modifications (advantage, rerolls, min dice, etc.)
	 * @param {Array} results - Array of roll results
	 * @param {Object} options - Roll options
	 * @returns {Array} - Modified roll results
	 */
	applyRollModifications(results, options) {
		let modifiedResults = [...results];
		
		// Apply advantage/disadvantage
		if (options.advantage || options.disadvantage) {
			modifiedResults = this.applyRollAdvantage(modifiedResults, options);
		}
		
		// Apply rerolls
		if (options.rerolls) {
			modifiedResults = this.applyRerolls(modifiedResults, options.rerolls);
		}
		
		// Apply minimum dice
		if (options.minDice) {
			modifiedResults = this.applyMinDice(modifiedResults, options.minDice);
		}
		
		return modifiedResults;
	}
	
	/**
	 * Apply advantage/disadvantage to rolls
	 * @param {Array} results - Array of roll results
	 * @param {Object} options - Roll options
	 * @returns {Array} - Modified results with advantage/disadvantage
	 */
	applyRollAdvantage(results, options) {
		const modifiedResults = [];
		
		for (const result of results) {
			if (result.metadata.type === 'd20') {
				if (options.advantage) {
					// Roll additional d20 and take highest
					const advantageRoll = new Roll('1d20');
					advantageRoll.evaluate({ async: false });
					
					if (result.total > advantageRoll.total) {
						result.metadata.advantageRoll = advantageRoll;
						result.metadata.advantageType = 'advantage';
					} else {
						result.total = advantageRoll.total;
						result.metadata.advantageRoll = result;
						result.metadata.advantageType = 'advantage';
					}
				} else if (options.disadvantage) {
					// Roll additional d20 and take lowest
					const disadvantageRoll = new Roll('1d20');
					disadvantageRoll.evaluate({ async: false });
					
					if (result.total < disadvantageRoll.total) {
						result.metadata.disadvantageRoll = disadvantageRoll;
						result.metadata.disadvantageType = 'disadvantage';
					} else {
						result.total = disadvantageRoll.total;
						result.metadata.disadvantageRoll = result;
						result.metadata.disadvantageType = 'disadvantage';
					}
				}
			}
			
			modifiedResults.push(result);
		}
		
		return modifiedResults;
	}
	
	/**
	 * Apply rerolls to rolls
	 * @param {Array} results - Array of roll results
	 * @param {Object} rerollOptions - Reroll configuration
	 * @returns {Array} - Modified results with rerolls
	 */
	applyRerolls(results, rerollOptions) {
		// Implementation for reroll logic
		// This will be expanded based on specific reroll requirements
		return results;
	}
	
	/**
	 * Apply minimum dice values
	 * @param {Array} results - Array of roll results
	 * @param {Object} minDiceOptions - Minimum dice configuration
	 * @returns {Array} - Modified results with minimum dice applied
	 */
	applyMinDice(results, minDiceOptions) {
		// Implementation for minimum dice logic
		// This will be expanded based on specific minimum dice requirements
		return results;
	}
	
	/**
	 * Animate dice rolls using Dice So Nice
	 * @param {Array} results - Array of roll results
	 * @returns {Promise} - Promise resolving when animation completes
	 */
	async animateRolls(results) {
		if (!this.diceSoNice) return;
		
		try {
			// Trigger Dice So Nice animations
			// This will be implemented when we integrate with Dice So Nice
			console.log('SW5E QoL | Dice animations to be implemented');
		} catch (error) {
			console.warn('SW5E QoL | Dice animation error:', error);
		}
	}
	
	/**
	 * Get damage by type from roll data
	 * @param {Object} rollData - Roll data object
	 * @param {string} damageType - Damage type to retrieve
	 * @returns {number} - Damage amount for the specified type
	 */
	getDamageByType(rollData, damageType) {
		// Implementation for retrieving specific damage types
		// This will be expanded based on damage type requirements
		return 0;
	}
	
	/**
	 * Clear roll cache
	 */
	clearCache() {
		this.rollCache.clear();
	}
	
	/**
	 * Get cache statistics
	 * @returns {Object} - Cache statistics
	 */
	getCacheStats() {
		return {
			size: this.rollCache.size,
			hits: 0, // To be implemented
			misses: 0 // To be implemented
		};
	}
}
