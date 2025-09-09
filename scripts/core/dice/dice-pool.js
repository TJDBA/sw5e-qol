/**
 * DicePool Class - Manages dice rolling for various roll types
 * Extracted and refactored from damage_refactor_wip.js
 * Location: scripts/core/dice/dice-pool.js
 * is damage advantage this: 2d8kh1 + 3 + 2d6kh1 
or this: max(2d8 + 2d6, 2d8 + 2d6) + 3 as there is a difference
 */

// Constants from damage refactor
const signed = n => `${n >= 0 ? "+" : ""}${n}`;
const DIE_RE = /(\d+)d(\d+)(?:\s*min\s*(\d+))?/gi;
const MIN_BY_FACES = { 4: 2, 6: 2, 8: 3, 10: 4, 12: 5, 20: 8 };

export class DicePool {
    /**
     * Create a new DicePool instance
     * @param {string} tokenID - The token ID for the roll
     * @param {string} rollType - The type of roll (damage, ability, save, skill, other)
     * @param {Array} [initialPool=[]] - Initial dice pool array
     * @param {Object} [target=null] - Target object for the roll
     * @param {Object} [options={}] - Additional options for the roll
     */
    constructor(tokenID, rollType, initialPool, target = null, options = {}) {
        this.tokenID = tokenID;
        this.rollType = rollType.toLowerCase();
        this.initialPool = initialPool || [];
        this.target = target;
        this.options = options;
        
        this.basePool = [];
        this.critPool = [];
        this.item = null;
        
        // Validate roll type
        const validTypes = ['damage', 'ability', 'save', 'skill', 'other'];
        if (!validTypes.includes(this.rollType)) {
            throw new Error(`Invalid roll type: ${rollType}. Must be one of: ${validTypes.join(', ')}`);
        }
    }

    /**
     * Main execution method
     */
    async execute() {
        // Get item data if needed
        if (this.rollType === 'damage' && this.options.itemID) {
            this.item = game.items.get(this.options.itemID) || game.actors.get(this.tokenID)?.items.get(this.options.itemID);
            if (!this.item) {
                throw new Error(`Item not found: ${this.options.itemID}`);
            }
        }

        // Build pools
        this.buildPools();
        
        // Apply modifiers
        this.applyModifiers();
        
        // Roll the pools
        const baseRolls = await this.rollPool(this.basePool);
        const critRolls = this.shouldRollCrit() ? await this.rollPool(this.critPool) : [];
        
        // Calculate results
        return this.calculateResults(baseRolls, critRolls);
    }

    /**
     * Build base and critical pools based on roll type
     */
    buildPools() {
        switch (this.rollType) {
            case 'damage':
                this.buildDamagePools();
                break;
            case 'ability':
            case 'save':
            case 'skill':
                this.buildCheckPools();
                break;
            case 'other':
                this.buildGenericPools();
                break;
        }
    }

    /**
     * Build damage pools (base + crit)
     */
    buildDamagePools() {
        // Convert dice objects to legacy format for processing
        const damageParts = this.initialPool.map(die => [die.formula, die.type, die.partOfCrit]);
        
        // Get default damage type from item if needed
        const defaultType = this.item?.system?.damage?.parts?.[0]?.[1] || "kinetic";
        
        // Fill in missing damage types
        const normalizedParts = damageParts.map(([formula, type, partOfCrit]) => [
            formula,
            type || defaultType,
            partOfCrit
        ]);

        // Build base pool (all dice)
        for (const [formula, type, partOfCrit] of normalizedParts) {
            const terms = formula.split('+').map(term => term.trim());
            
            for (const term of terms) {
                if (term === "") continue;
                this.basePool.push([term, type, partOfCrit]);
            }
        }

        // Build crit pool (only dice from partOfCrit=true parts)
        if (this.shouldRollCrit()) {
            for (const [formula, type, partOfCrit] of normalizedParts) {
                if (!partOfCrit) continue;
                
                const terms = formula.split('+').map(term => term.trim());
                for (const term of terms) {
                    if (term === "" || !isNaN(term)) continue; // Skip empty and numeric terms
                    this.critPool.push([term, type, partOfCrit]);
                }
            }

            // Add brutal dice if specified
            if (this.options.brutalXdY) {
                this.critPool.push([this.options.brutalXdY, this.options.brutalDamType || defaultType, true]);
            }
        }
    }

    /**
     * Build pools for ability/save/skill checks
     */
    buildCheckPools() {
        // For checks, we typically don't have crit pools
        this.basePool = this.initialPool.map(die => [die.formula, die.type || "", die.partOfCrit]);
    }

    /**
     * Build generic pools
     */
    buildGenericPools() {
        this.basePool = this.initialPool.map(die => [die.formula, die.type || "", die.partOfCrit]);
    }

    /**
     * Apply modifiers in the correct order
     */
    applyModifiers() {
        // Apply min die faces if enabled
        if (this.options.useMinDie) {
            this.basePool = this.applyMinByFaces(this.basePool);
            this.critPool = this.applyMinByFaces(this.critPool);
        }

        // Apply target-specific modifiers
        if (this.target?.opt) {
            // Handle target-specific options here
            // This is where reroll max damage, etc. would go
        }

        // Apply advantage/disadvantage last
        if (this.options.advantage || this.options.disadvantage) {
            const useAdvantage = !!this.options.advantage;
            this.basePool = this.applyAdvantage(this.basePool, useAdvantage);
            this.critPool = this.applyAdvantage(this.critPool, useAdvantage);
        }
    }

    /**
     * Apply per-face minimums
     */
    applyMinByFaces(pool) {
        return pool.map(([formula, type, partOfCrit]) => {
            const modifiedFormula = String(formula).replace(DIE_RE, (_, n, f, min) => {
                const faces = Number(f);
                const wanted = MIN_BY_FACES[faces];
                if (!wanted) return `${n}d${f}${min ? `min${min}` : ""}`;
                const eff = Math.max(Number(min ?? 0), wanted);
                return `${n}d${f}min${eff}`;
            });
            return [modifiedFormula, type, partOfCrit];
        });
    }

    /**
     * Apply advantage/disadvantage using min/max functions
     */
    applyAdvantage(pool, useAdvantage) {
        const func = useAdvantage ? 'max' : 'min';
        
        return pool.map(([formula, type, partOfCrit]) => {
            // Only apply to dice (partOfCrit=true for damage, or all dice for other types)
            const shouldModify = this.rollType === 'damage' ? partOfCrit : !isNaN(formula) === false;
            const modifiedFormula = shouldModify ? `${func}(${formula}, ${formula})` : formula;
            return [modifiedFormula, type, partOfCrit];
        });
    }

    /**
     * Roll a pool of dice
     */
    async rollPool(pool) {
        const rolls = [];
        
        for (const [formula, type, partOfCrit] of pool) {
            const roll = await this.createRoll(formula, type);
            if (roll) rolls.push(roll);
        }
        
        return rolls;
    }

    /**
     * Create and evaluate a single roll
     */
    async createRoll(rollFormula, type) {
        if (rollFormula === null) return null;

        const finalFormula = String(rollFormula).trim() || "0";
        const finalType = type ?? undefined;
           
        const roll = await new Roll(finalFormula).evaluate({async: true});
        
        // Add flavor for damage type
        roll.terms
            .filter(term => term instanceof Die || term instanceof NumericTerm)
            .forEach(term => { term.options.flavor = finalType });
        
        if (roll.dice.length > 0) {
            roll.dice.forEach(die => {
                die.options.flavor = finalType;
            });
        }
        
        return roll;
    }

    /**
     * Determine if critical pool should be rolled
     */
    shouldRollCrit() {
        return this.target?.crit || this.options.crit;
    }

    /**
     * Calculate final results
     */
    calculateResults(baseRolls, critRolls) {
        const isCrit = this.shouldRollCrit();
        const targetRef = this.target?.tokenID || "";

        if (this.rollType === 'damage') {
            return this.calculateDamageResults(baseRolls, critRolls, isCrit, targetRef);
        } else {
            return this.calculateCheckResults(baseRolls, critRolls, isCrit, targetRef);
        }
    }

    /**
     * Calculate damage results (matches damageCalc structure)
     */
    calculateDamageResults(rollArray, critRollArray, isCrit, ref) {
        const _sumRolls = (rolls) => {
            let total = 0;
            const byType = {};

            for (const roll of rolls) {
                if (!roll) continue;
                total += roll.total;

                for (const term of roll.terms) {
                    const type = term.options.flavor;
                    if (!type) continue;

                    byType[type] = byType[type] || 0;

                    if (term instanceof Die) {
                        const dieTotal = term.results.reduce((sum, result) => sum + result.result, 0);
                        byType[type] += dieTotal;
                    } else if (term instanceof NumericTerm) {
                        byType[type] += term.number;
                    }
                }
            }
            return { total, byType };
        };

        const baseDamage = _sumRolls(rollArray);
        const critDamage = isCrit ? _sumRolls(critRollArray) : { total: 0, byType: {} };

        return {
            TotalDam: baseDamage.total,
            TotalCritDam: critDamage.total,
            TotalDamByType: baseDamage.byType,
            TotalCritDamByType: critDamage.byType,
            RollArray: rollArray,
            CritRollArray: critRollArray,
            TargetRef: ref,
            // Future development placeholder
            _reserved: null
        };
    }

    /**
     * Calculate check results (ability/save/skill)
     */
    calculateCheckResults(rollArray, critRollArray, isCrit, ref) {
        const total = rollArray.reduce((sum, roll) => sum + (roll?.total || 0), 0);
        const critTotal = critRollArray.reduce((sum, roll) => sum + (roll?.total || 0), 0);

        return {
            TotalDam: total,
            TotalCritDam: critTotal,
            TotalDamByType: {},
            TotalCritDamByType: {},
            RollArray: rollArray,
            CritRollArray: critRollArray,
            TargetRef: ref,
            // Future development placeholder
            _reserved: null
        };
    }
}


