import { BaseFeature } from '../base-feature.js';

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
            section: "features",
            isReactive: false,
            isActive: true,
            injectionType: {
                "damage": "html"
            }
        });
        
        // Feature-specific properties
        this.resourceName = "Force Points";
        this.resourceCost = 1;
        this.damageType = "kinetic";
        this.damageAmount = "1d4";
    }

    /**
     * HTML template - uses generic resource feature template
     */
    htmlTemplate(obj) {
        const { actor, dialogType, themeName, featureData } = obj;
        
        try {
            if (dialogType === "damage") {
                
                const dataPaths = getDataPaths("class");

                // Get the class array from the actor using the basePath in dataPaths
                const classArray = getProperty(actor, dataPaths.basePath.replace("{Actor}", "system").replace(/^system\./, ""));
                // Find the sentinel object (e.g., the class with a specific name or property)
                // Find the class object (sentinel) by matching the name subpath
                let sentinel = null;
                if (Array.isArray(classArray) && dataPaths.subpaths && dataPaths.subpaths.name) {
                    // Get the name subpath, e.g., "[].name" or ".name"
                    const nameKey = dataPaths.subpaths.name.replace(/^\[\]\.?/, '').replace(/^\./, '');
                    // Example: nameKey = "name"
                    sentinel = classArray.find(cls => cls && cls[nameKey] && typeof cls[nameKey] === "string");
                }

                // Find the class level (sentinel.system.levels)
                let classLevel = 0;
                if (sentinel && sentinel.system && typeof sentinel.system.levels === "number") {
                    classLevel = sentinel.system.levels;
                }

                // Find the Kinetic Combat advancement in the sentinel.system.advancement array
                let kineticAdvancement = null;
                if (sentinel && sentinel.system && Array.isArray(sentinel.system.advancement)) {
                    kineticAdvancement = sentinel.system.advancement.find(
                        adv => adv && adv.title === "Kinetic Combat" && adv.type === "ScaleValue"
                    );
                }

                // Look up the kinetic die combo from the scale object using classLevel
                let kineticDie = null;
                if (kineticAdvancement && kineticAdvancement.scale && typeof classLevel === "number") {
                    // The keys in scale are the levels at which the die changes
                    // Find the highest key <= classLevel
                    const scaleKeys = Object.keys(kineticAdvancement.scale)
                        .map(k => parseInt(k, 10))
                        .filter(k => !isNaN(k))
                        .sort((a, b) => a - b);

                    let bestKey = null;
                    for (let k of scaleKeys) {
                        if (classLevel >= k) bestKey = k;
                    }
                    if (bestKey !== null && kineticAdvancement.scale[bestKey]) {
                        kineticDie = kineticAdvancement.scale[bestKey];
                        // kineticDie should have .number and .faces
                        // Optionally, update this.damageAmount to match
                        if (kineticDie.number && kineticDie.faces) {
                            this.damageAmount = `${kineticDie.number}d${kineticDie.faces}`;
                        }
                    }
                }
                
                return this.renderResourceFeatureHTML(
                    themeName, 
                    featureData, 
                    this.resourceName, 
                    this.resourceCost
                );
            } else {
                // Not applicable to other dialog types
                return '';
            }
        } catch (error) {
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
            return [];
        }
    }

    /**
     * Get modifier display text for the feature
     */
    getModifierDisplay() {
        return `+${this.damageAmount} ${this.damageType}`;
    }

    /**
     * Damage modifiers
     */
    getDamageModifiers(actor, dialogState, featureData) {
        return [
            this.createModifier(
                `${this.name}`,
                this.damageType,
                this.damageAmount,
                true,
                true
            )
        ];
    }
}

