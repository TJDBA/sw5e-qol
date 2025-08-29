/**
 * SW5E QoL - Formula Parser
 * Parses and validates dice formulas
 * Based on planning documents: formula-parser.js - Formula parsing and validation
 */

export class FormulaParser {
	constructor() {
		// Valid dice patterns
		this.dicePattern = /^(\d+)d(\d+)([kklh](\d+))?$/i;
		
		// Valid modifier patterns
		this.modifierPattern = /^[+\-]\d+$/;
		
		// Supported dice types
		this.supportedDice = [4, 6, 8, 10, 12, 20, 100];
		
		// Formula cache for performance
		this.formulaCache = new Map();
	}
	
	/**
	 * Parse a dice formula and return structured data
	 * @param {string} formula - Raw dice formula string
	 * @returns {Object} - Parsed formula object
	 */
	parseRollFormula(formula) {
		// Check cache first
		if (this.formulaCache.has(formula)) {
			return this.formulaCache.get(formula);
		}
		
		try {
			// Clean and normalize formula
			const cleanFormula = this.cleanFormula(formula);
			
			// Parse the formula
			const parsed = this.parseFormula(cleanFormula);
			
			// Validate the parsed result
			const validation = this.validateParsedFormula(parsed);
			
			// Create result object
			const result = {
				original: formula,
				clean: cleanFormula,
				valid: validation.valid,
				error: validation.error,
				diceGroups: parsed.diceGroups,
				flatModifiers: parsed.flatModifiers,
				total: parsed.total,
				complexity: parsed.complexity
			};
			
			// Cache the result
			this.formulaCache.set(formula, result);
			
			return result;
		} catch (error) {
			return {
				original: formula,
				clean: formula,
				valid: false,
				error: `Parse error: ${error.message}`,
				diceGroups: [],
				flatModifiers: [],
				total: 0,
				complexity: 'simple'
			};
		}
	}
	
	/**
	 * Clean and normalize a formula string
	 * @param {string} formula - Raw formula string
	 * @returns {string} - Cleaned formula string
	 */
	cleanFormula(formula) {
		if (typeof formula !== 'string') {
			throw new Error('Formula must be a string');
		}
		
		// Remove extra whitespace
		let clean = formula.trim().replace(/\s+/g, '');
		
		// Normalize operators
		clean = clean.replace(/[−–—]/g, '-'); // Replace various minus signs
		clean = clean.replace(/[＋]/g, '+'); // Replace various plus signs
		
		// Ensure formula starts with a valid character
		if (!/^[\d\(]/.test(clean)) {
			clean = '0' + clean;
		}
		
		return clean;
	}
	
	/**
	 * Parse the cleaned formula into structured data
	 * @param {string} cleanFormula - Cleaned formula string
	 * @returns {Object} - Parsed formula data
	 */
	parseFormula(cleanFormula) {
		const parts = this.splitFormula(cleanFormula);
		const diceGroups = [];
		const flatModifiers = [];
		let total = 0;
		let complexity = 'simple';
		
		for (const part of parts) {
			if (this.isDiceExpression(part)) {
				const diceGroup = this.parseDiceExpression(part);
				diceGroups.push(diceGroup);
				complexity = this.updateComplexity(complexity, diceGroup);
			} else if (this.isModifier(part)) {
				const modifier = this.parseModifier(part);
				flatModifiers.push(modifier);
				total += modifier.value;
			} else {
				// Try to parse as a number
				const number = parseFloat(part);
				if (!isNaN(number)) {
					flatModifiers.push({
						type: 'flat',
						value: number,
						source: 'formula',
						formula: part
					});
					total += number;
				}
			}
		}
		
		return {
			diceGroups,
			flatModifiers,
			total,
			complexity
		};
	}
	
	/**
	 * Split formula into parts for parsing
	 * @param {string} formula - Clean formula string
	 * @returns {Array} - Array of formula parts
	 */
	splitFormula(formula) {
		// Split on + and - operators, but preserve the operators
		const parts = [];
		let current = '';
		let inParentheses = 0;
		
		for (let i = 0; i < formula.length; i++) {
			const char = formula[i];
			
			if (char === '(') {
				inParentheses++;
				current += char;
			} else if (char === ')') {
				inParentheses--;
				current += char;
			} else if ((char === '+' || char === '-') && inParentheses === 0) {
				if (current) {
					parts.push(current);
				}
				parts.push(char);
				current = '';
			} else {
				current += char;
			}
		}
		
		if (current) {
			parts.push(current);
		}
		
		// Reconstruct parts with operators
		const reconstructed = [];
		for (let i = 0; i < parts.length; i++) {
			if (parts[i] === '+' || parts[i] === '-') {
				if (i + 1 < parts.length) {
					reconstructed.push(parts[i] + parts[i + 1]);
					i++; // Skip next part since we combined it
				}
			} else {
				reconstructed.push(parts[i]);
			}
		}
		
		return reconstructed;
	}
	
	/**
	 * Check if a part is a dice expression
	 * @param {string} part - Formula part
	 * @returns {boolean} - True if dice expression
	 */
	isDiceExpression(part) {
		return this.dicePattern.test(part);
	}
	
	/**
	 * Check if a part is a modifier
	 * @param {string} part - Formula part
	 * @returns {boolean} - True if modifier
	 */
	isModifier(part) {
		return this.modifierPattern.test(part);
	}
	
	/**
	 * Parse a dice expression
	 * @param {string} expression - Dice expression string
	 * @returns {Object} - Parsed dice group
	 */
	parseDiceExpression(expression) {
		const match = expression.match(this.dicePattern);
		if (!match) {
			throw new Error(`Invalid dice expression: ${expression}`);
		}
		
		const [, quantity, sides, , keepType, keepCount] = match;
		
		return {
			type: 'dice',
			formula: expression,
			quantity: parseInt(quantity),
			sides: parseInt(sides),
			keepType: keepType || null,
			keepCount: keepCount ? parseInt(keepCount) : null,
			modifiers: this.extractDiceModifiers(expression),
			complexity: this.calculateDiceComplexity(quantity, sides, keepType)
		};
	}
	
	/**
	 * Parse a modifier
	 * @param {string} modifier - Modifier string
	 * @returns {Object} - Parsed modifier
	 */
	parseModifier(modifier) {
		const value = parseInt(modifier);
		
		return {
			type: 'modifier',
			value: value,
			source: 'formula',
			formula: modifier,
			operator: modifier.charAt(0)
		};
	}
	
	/**
	 * Extract modifiers from dice expression
	 * @param {string} expression - Dice expression
	 * @returns {Array} - Array of modifiers
	 */
	extractDiceModifiers(expression) {
		const modifiers = [];
		
		// Extract keep/drop modifiers
		if (expression.includes('kh') || expression.includes('kl')) {
			const keepMatch = expression.match(/([kklh])(\d+)/);
			if (keepMatch) {
				modifiers.push({
					type: 'keep',
					operation: keepMatch[1],
					count: parseInt(keepMatch[2])
				});
			}
		}
		
		// Extract reroll modifiers
		if (expression.includes('r')) {
			const rerollMatch = expression.match(/r(\d+)/);
			if (rerollMatch) {
				modifiers.push({
					type: 'reroll',
					threshold: parseInt(rerollMatch[1])
				});
			}
		}
		
		return modifiers;
	}
	
	/**
	 * Calculate dice complexity
	 * @param {number} quantity - Number of dice
	 * @param {number} sides - Number of sides
	 * @param {string} keepType - Keep type modifier
	 * @returns {string} - Complexity level
	 */
	calculateDiceComplexity(quantity, sides, keepType) {
		if (quantity > 10 || sides > 100) return 'complex';
		if (quantity > 5 || keepType) return 'moderate';
		return 'simple';
	}
	
	/**
	 * Update overall complexity based on dice group
	 * @param {string} current - Current complexity
	 * @param {Object} diceGroup - Dice group object
	 * @returns {string} - Updated complexity
	 */
	updateComplexity(current, diceGroup) {
		if (diceGroup.complexity === 'complex') return 'complex';
		if (diceGroup.complexity === 'moderate' && current === 'simple') return 'moderate';
		return current;
	}
	
	/**
	 * Validate parsed formula
	 * @param {Object} parsed - Parsed formula object
	 * @returns {Object} - Validation result
	 */
	validateParsedFormula(parsed) {
		// Check for empty formula
		if (parsed.diceGroups.length === 0 && parsed.flatModifiers.length === 0) {
			return {
				valid: false,
				error: 'Formula contains no valid dice or modifiers'
			};
		}
		
		// Validate dice groups
		for (const diceGroup of parsed.diceGroups) {
			const validation = this.validateDiceGroup(diceGroup);
			if (!validation.valid) {
				return validation;
			}
		}
		
		// Validate modifiers
		for (const modifier of parsed.flatModifiers) {
			const validation = this.validateModifier(modifier);
			if (!validation.valid) {
				return validation;
			}
		}
		
		return { valid: true, error: null };
	}
	
	/**
	 * Validate a dice group
	 * @param {Object} diceGroup - Dice group object
	 * @returns {Object} - Validation result
	 */
	validateDiceGroup(diceGroup) {
		// Check quantity
		if (diceGroup.quantity <= 0 || diceGroup.quantity > 1000) {
			return {
				valid: false,
				error: `Invalid dice quantity: ${diceGroup.quantity}`
			};
		}
		
		// Check sides
		if (diceGroup.sides <= 0 || diceGroup.sides > 10000) {
			return {
				valid: false,
				error: `Invalid dice sides: ${diceGroup.sides}`
			};
		}
		
		// Check keep modifiers
		if (diceGroup.keepType && diceGroup.keepCount) {
			if (diceGroup.keepCount > diceGroup.quantity) {
				return {
					valid: false,
					error: `Cannot keep ${diceGroup.keepCount} dice from ${diceGroup.quantity}d${diceGroup.sides}`
				};
			}
		}
		
		return { valid: true, error: null };
	}
	
	/**
	 * Validate a modifier
	 * @param {Object} modifier - Modifier object
	 * @returns {Object} - Validation result
	 */
	validateModifier(modifier) {
		// Check for reasonable values
		if (Math.abs(modifier.value) > 1000000) {
			return {
				valid: false,
				error: `Modifier value too large: ${modifier.value}`
			};
		}
		
		return { valid: true, error: null };
	}
	
	/**
	 * Sanitize a dice formula for safe execution
	 * @param {string} formula - Raw formula string
	 * @returns {string} - Sanitized formula string
	 */
	sanitizeDiceFormula(formula) {
		// Remove potentially dangerous characters
		let sanitized = formula.replace(/[<>\"'&]/g, '');
		
		// Limit formula length
		if (sanitized.length > 1000) {
			sanitized = sanitized.substring(0, 1000);
		}
		
		// Validate the sanitized formula
		const parsed = this.parseRollFormula(sanitized);
		if (!parsed.valid) {
			throw new Error(`Sanitized formula is invalid: ${parsed.error}`);
		}
		
		return sanitized;
	}
	
	/**
	 * Clear formula cache
	 */
	clearCache() {
		this.formulaCache.clear();
	}
	
	/**
	 * Get cache statistics
	 * @returns {Object} - Cache statistics
	 */
	getCacheStats() {
		return {
			size: this.formulaCache.size,
			hits: 0, // To be implemented
			misses: 0 // To be implemented
		};
	}
}
