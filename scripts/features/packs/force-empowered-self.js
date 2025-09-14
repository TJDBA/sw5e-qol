import { BaseFeature } from '../base-feature.js';
import { API } from '../../api.js';
import { getDataPaths } from '../../core/utils/reference/data-lookup.js';

/**
 * Force-Empowered Self Feature Pack
 * A simple resource-based feature that adds kinetic damage
 */
export default class ForceEmpoweredSelfFeature extends BaseFeature {
    constructor() {
        super({
            id: "force-empowered-self",
            name: "Force-Empowered Self", 
            description: "Channel the Force to enhance your physical strikes with kinetic energy",
            affects: ["damage"],
            workflowSteps: ["base-dice-pool-features-attack"],
            section: "features",
            isReactive: true, //Should be false, but for testing purposes we want it to be true
            isActive: true,
            injectionType: {
                "damage": "html"
            }
        });
        
        // Feature-specific properties
        this.resourceName = "Force Points";
        this.resourceCost = 1;
        this.modifierType = "kinetic";
        this.modifier = "1d4";
    }

    /**
     * HTML template - uses generic resource feature template
     */
    htmlTemplate(obj) {
        const { actor, dialogType, themeName, featureData } = obj;
        
        try {
            if (dialogType === "damage") {
                // Calculate the kinetic die based on class level and multiclass improvement
                const calculatedDamage = this.calculateKineticDie(actor);
                
                // Build comprehensive featureData object
                const enhancedFeatureData = {
                    ...featureData, // Preserve existing data
                    enabled: featureData.enabled || false,
                    resourceName: this.resourceName,
                    resourceCost: this.resourceCost,
                    modifier: calculatedDamage,
                    modifierType: this.modifierType,
                    modifierName: 'Double Strike'
                };
                
                // Update instance variable for consistency
                this.modifier = calculatedDamage;
                
                return this.renderResourceFeatureHTML(themeName, enhancedFeatureData);
            } else {
                // Not applicable to other dialog types
                return '';
            }
        } catch (error) {
            API.log('error', `Failed to render Force-Empowered Self HTML:`, error);
            return this.renderErrorHTML(themeName, error);
        }
    }

    /**
     * Roll modifiers - only for damage dialog
     */
    rollModifiers(obj) {
        const { actor, dialogType, dialogState, featureData } = obj;
        
        try {
            // Only apply to damage dialog and if feature is enabled
            if (dialogType !== "damage" || !featureData?.enabled) {
                return [];
            }

            return this.getDamageModifiers(actor, dialogState, featureData);
        } catch (error) {
            API.log('error', `Failed to get Force-Empowered Self modifiers:`, error);
            return [];
        }
    }

    /**
     * Get modifier display text for the feature
     * @param {Object} featureData - Feature data containing damage information
     */
    getModifierDisplay(featureData = {}) {
        const modifier = featureData.modifier || this.modifier;
        return `+${modifier} ${featureData.modifierType || this.modifierType}`;
    }

    /**
     * Calculate the kinetic die based on class level and multiclass improvement
     * @param {Object} actor - The actor object
     * @returns {string} The calculated damage amount (e.g., "1d6")
     */
    calculateKineticDie(actor) {
        try {
            // Use foundry.utils.getProperty directly
            const getProperty = foundry.utils.getProperty;
            const dataPaths = getDataPaths("actor", "class");

            // Get the class array from the actor using the basePath in dataPaths
            const classArray = getProperty(actor, dataPaths.basePath.replace("{Actor}", "system").replace(/^system\./, ""));
            
            // Find the sentinel object (e.g., the class with a specific name or property)
            let sentinel = null;
            if (Array.isArray(classArray) && dataPaths.subpaths && dataPaths.subpaths.name) {
                const nameKey = dataPaths.subpaths.name.replace(/^\[\]\.?/, '').replace(/^\./, '');
                sentinel = classArray.find(cls => cls && cls[nameKey] && typeof cls[nameKey] === "string");
            }

            // Find the class level (sentinel.system.levels)
            let classLevel = 0;
            if (sentinel && sentinel.system && typeof sentinel.system.levels === "number") {
                classLevel = sentinel.system.levels;
                // Add the multiclass improvement level to the class level
                const multiclassAdjustment = this.checkMulticlassImprovement(actor, sentinel.name);
                classLevel += multiclassAdjustment;
            }

            // Find the Kinetic Combat advancement in the sentinel.system.advancement array
            let kineticAdvancement = null;
            if (sentinel && sentinel.system && Array.isArray(sentinel.system.advancement)) {
                kineticAdvancement = sentinel.system.advancement.find(
                    adv => adv && adv.title === "Kinetic Combat" && adv.type === "ScaleValue"
                );
            }

            // Look up the kinetic die combo from the scale object using classLevel
            if (kineticAdvancement?.configuration?.scale && typeof classLevel === "number") {
                const scaleKeys = Object.keys(kineticAdvancement.configuration.scale)
                    .map(k => parseInt(k, 10))
                    .filter(k => !isNaN(k))
                    .sort((a, b) => a - b);

                let bestKey = null;
                for (let k of scaleKeys) {
                    if (classLevel >= k) bestKey = k;
                }
                
                if (bestKey !== null && kineticAdvancement.configuration.scale[bestKey]) {
                    const kineticDie = kineticAdvancement.configuration.scale[bestKey];
                    if (kineticDie.number && kineticDie.faces) {
                        return `${kineticDie.number}d${kineticDie.faces}`;
                    }
                }
            }

            // Fallback to default
            return this.modifier;
        } catch (error) {
            API.log('error', `Failed to calculate kinetic die:`, error);
            return this.modifier;
        }
    }

   /**
     * Get damage modifier in dice pool element format
     * @param {Object} actor - The actor object
     * @returns {Object} Dice pool element object
     */
    getDamageModifier(actor) {
        try {
            // Calculate the kinetic die based on class level and multiclass improvement
            const kineticDie = this.calculateKineticDie(actor);
            
            // Return in dice pool element format
            return {
                element: kineticDie,
                elementType: 'dice',
                modifierType: this.modifierType,
                modifierName: this.name,
                featureName: this.id
            };
        } catch (error) {
            API.log('error', `Failed to get damage modifier:`, error);
            // Return fallback in dice pool element format
            return {
                element: this.modifier,
                elementType: 'dice',
                modifierType: this.modifierType,
                modifierName: this.modifierName,
                featureName: this.id
            };
        }
    }

    apply(dicePool, state, featureWorkflowStep) {
        console.log('ForceEmpoweredSelfFeature: Applying feature to dice pool', dicePool);
        switch (featureWorkflowStep) {
            case "base-dice-pool-features-attack":
                console.log('ForceEmpoweredSelfFeature: Applying feature to attack dice pool');
                dicePool.forEach(dice => {
                    if (dice.elementType == 'dice') {
                    // Add '+0' to the element string to ensure a modifier is always present
                    if (typeof dice.element === 'string' && !dice.element.includes('+0')) {
                        dice.element += '+1';
                    }
                    }
                });
                dicePool.push(this.getDamageModifier(state.actor));
                break;
        }
        console.log('ForceEmpoweredSelfFeature: Applied feature to dice pool', dicePool);
        return dicePool;
    }
}

