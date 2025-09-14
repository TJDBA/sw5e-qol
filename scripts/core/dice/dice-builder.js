/**
 * Dice Builder Class
 * Analyzes dialog state and builds Roll configurations
 * Location: scripts/core/dice/dice-builder.js
 */

import { API } from '../../api.js';
import { getDataPaths } from '../../core/utils/reference/data-lookup.js';
import { getActorFromTokenID } from '../../actors/actor-util.js';
import { featureManager } from '../../features/feature-manager.js';

/**
 * Dice Builder Class
 * Handles dice pool building and configuration
 */
export class DiceBuilder {
    constructor() {
        //this.dataPaths = getDataPaths();
        
    }

    /**
     * Build attack dice pool configuration
     * @param {Object} state - Workflow state
     * @returns {Object} Dice pool configuration
     */
    async buildAttackPool(state) {
        try {
            const { dialogState } = state;
            const actor = getActorFromTokenID(dialogState.ownerID);
            //const item = actor?.items.get(dialogState.itemID);
            
            if (actor == null) {
                throw new Error('Actor or item not found');
            }

            // Step 1: Add base d20 and build base dice pool from modifiers array
            dialogState.modifiers.unshift({modifierName: 'Attack Die', modifier: '1d20', modifierType: 'Untyped'});
            const basePool = this.buildBaseDicePool(dialogState.modifiers);
            console.log('DiceBuilder: Base pool:', basePool);

            // Step 2: Apply features and options
            const modifiedPool = await this.applyFeaturesAndOptions(basePool, state, 'attack');
            
            // Step 3: Build pool formula
            const poolFormula = this.buildPoolFormula(modifiedPool, 'attack');
            console.log('DiceBuilder: Pool formula:', poolFormula);
            
            // Step 6: Create Roll objects
            //const baseRoll = await this.createRollObject(poolFormula, advantage, disadvantage, 'attack');
            const critRoll = null; // Placeholder for crit rolls
            
            API.log('debug', 'DiceBuilder: Built attack dice configuration');
            return {
                basePool: basePool,
                formula: poolFormula
                //advantage: advantage,
                //disadvantage: disadvantage
            };
        } catch (error) {
            API.log('error', 'DiceBuilder: Error building attack pool:', error);
            throw error;
        }
    }

    /**
     * Build damage dice pool configuration
     * @param {Object} state - Workflow state
     * @returns {Object} Dice pool configuration
     */
    async buildDamagePool(state) {
        try {
            const { dialogState, targets } = state;
            const actor = getActorFromTokenID(dialogState.ownerID);
            const item = actor?.items.get(dialogState.itemID);
            
            if (actor == null) {
                throw new Error('Actor or item not found');
            }

            // Step 1: Build base dice pool from modifiers array
            const basePool = this.buildBaseDicePool(dialogState.modifiers);
            console.log('DiceBuilder: Base pool:', basePool);
            
            // Step 2: Apply features and options
            const modifiedPool = await this.applyFeaturesAndOptions(basePool, state, 'damage');
            console.log('DiceBuilder: Modified pool:', modifiedPool);

            // Step 3: Build pool formula (grouped by type for damage)
            const poolFormula = this.buildPoolFormula(modifiedPool, 'damage');
            console.log('DiceBuilder: Pool formula:', poolFormula);

            // Step 4: Create crit pool (placeholder for now)
            const critPool = null; // Will be implemented when crit logic is added
            console.log('DiceBuilder: Crit pool:', critPool);

            // Step 5: Apply pool level modifiers (advantage/disadvantage)
            const advantageType = dialogState.advantageSelection || 'Normal';
            const advantage = advantageType === 'Advantage';
            const disadvantage = advantageType === 'Disadvantage';
            
            // Step 6: Create Roll objects
            const baseRoll = await this.createRollObject(poolFormula, advantage, disadvantage, 'damage');
            const critRoll = null; // Placeholder for crit rolls
            
            API.log('debug', 'DiceBuilder: Built damage dice configuration');
            return {
                basePool: baseRoll,
                critPool: critRoll,
                formula: poolFormula,
                advantage: advantage,
                disadvantage: disadvantage
            };
        } catch (error) {
            API.log('error', 'DiceBuilder: Error building damage pool:', error);
            throw error;
        }
    }

    /**
     * Step 1: Build base dice pool from modifiers array
     * @param {Array} modifiers - Array of modifier objects
     * @returns {Array} Parsed dice pool elements
     */
    buildBaseDicePool(modifiers) {
        const dicePool = [];
        let elementType = '';
        
        modifiers.forEach(modifier => {
            if (!modifier.modifier || modifier.modifier.trim() === '') return;
            
            // Remove all spaces
            const cleanedModifier = modifier.modifier.replace(/\s/g, '');
            
            // Split on + symbols
            const plusSplit = cleanedModifier.split('+');
            
            // Process each part from plus split
            plusSplit.forEach(part => {
                if (part === '') return; // Skip empty elements
                
                // Split on - that is not the first character
                const minusSplit = this.splitOnMinus(part);
                
                minusSplit.forEach(element => {
                    if (element === '') return; // Skip empty elements
                    if (element === '0') return; // Skip zero values
                    
                    // Determine if the element is a dice or a number
                    if (isNaN(element)) elementType = 'dice';
                    else elementType = 'number';
                    
                    dicePool.push({
                        element: element,
                        elementType: elementType,
                        modifierType: modifier.modifierType || '',
                        modifierName: modifier.modifierName || 'Unknown',
                        featureName: modifier.featureName || null
                    });
                });
            });
        });
        
        return dicePool;
    }

    /**
     * Split string on minus that is not the first character
     * @param {string} str - String to split
     * @returns {Array} Array of split elements
     */
    splitOnMinus(str) {
        if (str.length <= 1) return [str];
        
        const result = [];
        let current = '';
        
        for (let i = 0; i < str.length; i++) {
            if (str[i] === '-' && i > 0) {
                if (current !== '') {
                    result.push(current);
                    current = '';
                }
                current += '-';
            } else {
                current += str[i];
            }
        }
        
        if (current !== '') {
            result.push(current);
        }
        
        return result;
    }

    /**
     * Step 2: Apply features and options
     * @param {Array} dicePool - Base dice pool
     * @param {Object} state - Workflow state
     * @param {string} actionType - Type of action (attack, damage, etc.)
     * @returns {Array} Modified dice pool
     */
    async applyFeaturesAndOptions(dicePool, state, actionType) {
        // Placeholder for feature application
        // This will be implemented when feature system integration is complete
        API.log('debug', `DiceBuilder: Applying features and options for ${actionType}`);

        

        const featureWorkflowStep = "base-dice-pool-features-"+actionType;
        console.log('DiceBuilder: Feature workflow step:', featureWorkflowStep);
        
        const features = await featureManager.getFeaturesForWorkflowStep(featureWorkflowStep);
        console.log('DiceBuilder: Features:', features);
        features.forEach(feature => {
            dicePool = feature.apply(dicePool, state, featureWorkflowStep);
        });


        if (actionType === 'attack') {
            const advantageType = state.dialogState.advantageSelection || 'Normal';
            
            if (advantageType === 'Advantage') {
                dicePool[0].modifier = 'max(1d20, 1d20)';
            } else if (advantageType === 'Disadvantage') {
                dicePool[0].modifier = 'min(1d20, 1d20)';
            }
        }
        // For now, return the pool as-is
        return dicePool;
    }

    /**
     * Step 3: Build pool formula
     * @param {Array} dicePool - Modified dice pool
     * @param {string} actionType - Type of action (attack, damage, etc.)
     * @returns {string} Final dice formula
     */
    buildPoolFormula(dicePool, actionType) {
        if (actionType === 'damage') {
            return this.buildDamageFormula(dicePool);
        } else {
            return this.buildNonDamageFormula(dicePool);
        }
    }

    /**
     * Build formula for damage pools (grouped by type)
     * @param {Array} dicePool - Dice pool elements
     * @returns {string} Damage formula
     */
    buildDamageFormula(dicePool) {
        // Group by type
        const groups = {};
        dicePool.forEach(element => {
            const type = element.modifierType || 'kinetic';
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(element.element);
        });
        
        // Build formula for each type
        const typeFormulas = [];
        Object.keys(groups).forEach(type => {
            const elements = groups[type];
            const combined = this.combineElements(elements);
            if (combined) {
                typeFormulas.push(`(${combined})[${type}]`);
            }
        });
        
        return typeFormulas.join('+');
    }

    /**
     * Build formula for non-damage pools
     * @param {Array} dicePool - Dice pool elements
     * @returns {string} Non-damage formula
     */
    buildNonDamageFormula(dicePool) {
        const elements = dicePool.map(element => element.element);
        return this.combineElements(elements);
    }

    /**
     * Combine elements into a single formula
     * @param {Array} elements - Array of dice elements
     * @returns {string} Combined formula
     */
    combineElements(elements) {
        if (elements.length === 0) return '';
        
        // Separate dice and numbers
        const diceElements = [];
        const numberElements = [];
        
        elements.forEach(element => {
            if (element.includes('d')) {
                diceElements.push(element);
            } else {
                const num = parseInt(element);
                if (!isNaN(num)) {
                    numberElements.push(num);
                }
            }
        });
        
        // Combine dice elements
        const combinedDice = this.combineDiceElements(diceElements);
        
        // Sum number elements
        const numberSum = numberElements.reduce((sum, num) => sum + num, 0);
        
        // Build final formula
        let formula = '';
        
        if (combinedDice) {
            formula += combinedDice;
        }
        
        if (numberSum !== 0) {
            if (formula) {
                formula += numberSum >= 0 ? `+${numberSum}` : `${numberSum}`;
            } else {
                formula += `${numberSum}`;
            }
        }
        
        return formula || '0';
    }

    /**
     * Combine dice elements (e.g., ["1d6", "1d6", "1d4"] -> "2d6+1d4")
     * @param {Array} diceElements - Array of dice strings
     * @returns {string} Combined dice string
     */
    combineDiceElements(diceElements) {
        if (diceElements.length === 0) return '';
        
        // Group by die type
        const groups = {};
        diceElements.forEach(dice => {
            const match = dice.match(/^(\d+)d(\d+)/);
            if (match) {
                const quantity = parseInt(match[1]);
                const dieType = `d${match[2]}`;
                groups[dieType] = (groups[dieType] || 0) + quantity;
            }
        });
        
        // Build combined string
        const dieTypeOrder = ['d20', 'd12', 'd10', 'd8', 'd6', 'd4'];
        const sortedTypes = Object.keys(groups).sort((a, b) => {
            const indexA = dieTypeOrder.indexOf(a);
            const indexB = dieTypeOrder.indexOf(b);
            return indexA - indexB;
        });
        
        return sortedTypes.map(type => `${groups[type]}${type}`).join('+');
    }

    /**
     * Step 6: Create Roll object
     * @param {string} formula - Dice formula
     * @param {boolean} advantage - Has advantage
     * @param {boolean} disadvantage - Has disadvantage
     * @param {string} actionType - Type of action
     * @returns {Roll} Roll object
     */
    async createRollObject(formula, advantage, disadvantage, actionType) {
        try {
            let finalFormula = formula;
            
            // Apply advantage/disadvantage
            if (advantage && !disadvantage) {
                if (actionType === 'damage') {
                    // For damage, apply to whole pool
                    finalFormula = `max(${formula}, ${formula})`;
                } else {
                    // For attack/save/skill, apply to first d20 only
                    finalFormula = this.applyAdvantageToFirstD20(formula);
                }
            } else if (disadvantage && !advantage) {
                if (actionType === 'damage') {
                    // For damage, apply to whole pool
                    finalFormula = `min(${formula}, ${formula})`;
                } else {
                    // For attack/save/skill, apply to first d20 only
                    finalFormula = this.applyDisadvantageToFirstD20(formula);
                }
            }
            
            // Create and evaluate roll
            const roll = await new Roll(finalFormula).evaluate({ async: true });
            
            // Add metadata
            roll.options = {
                advantage: advantage || false,
                disadvantage: disadvantage || false,
                actionType: actionType,
                originalFormula: formula
            };
            
            return roll;
        } catch (error) {
            API.log('error', 'DiceBuilder: Error creating roll object:', error);
            throw error;
        }
    }

    /**
     * Apply advantage to first d20 in formula
     * @param {string} formula - Original formula
     * @returns {string} Modified formula
     */
    applyAdvantageToFirstD20(formula) {
        // Find first d20 and apply max() to it
        return formula.replace(/(\d+d20)/, 'max($1, $1)');
    }

    /**
     * Apply disadvantage to first d20 in formula
     * @param {string} formula - Original formula
     * @returns {string} Modified formula
     */
    applyDisadvantageToFirstD20(formula) {
        // Find first d20 and apply min() to it
        return formula.replace(/(\d+d20)/, 'min($1, $1)');
    }

    /**
     * Parse ability modifier from dialog state
     * @param {string} abilityModifier - Ability modifier string (e.g., "+3", "-1")
     * @returns {number} Parsed modifier value
     */
    parseAbilityModifier(abilityModifier) {
        try {
            if (typeof abilityModifier === 'string') {
                // Parse the string directly, preserving positive/negative values
                return parseInt(abilityModifier) || 0;
            }
            return parseInt(abilityModifier) || 0;
        } catch (error) {
            API.log('warning', 'DiceBuilder: Error parsing ability modifier:', error);
            return 0;
        }
    }

    /**
     * Apply feature modifications to dice configuration
     * @param {Object} diceConfig - Dice configuration
     * @param {Object} state - Workflow state
     * @returns {Object} Modified dice configuration
     */
    async applyFeatureModifications(diceConfig, state) {
        // This will be implemented when feature system integration is complete
        // For now, return the configuration as-is
        return diceConfig;
    }
}