import { API } from '../api.js';

/**
 * Feature Manager
 * Handles discovery, loading, and caching of feature packs
 */
export class FeatureManager {
    /**
     * Create a new FeatureManager instance
     */
    constructor() {
        this.loadedFeatures = new Map();
        this.actorFeatureCache = new Map(); // Cache features per actor
        this.initialized = false;
    }

    /**
     * Initialize the feature manager
     */
    async init() {
        try {
            if (this.initialized) return;
            
            API.log('info', 'Initializing Feature Manager...');
            await this.loadFeaturePacks();
            this.initialized = true;
            API.log('info', `Feature Manager initialized with ${this.loadedFeatures.size} features`);
        } catch (error) {
            API.log('error', 'Failed to initialize Feature Manager', error);
        }
    }

    /**
     * Load all feature packs using simplified direct imports
     */
    async loadFeaturePacks() {
        try {
            // Import all feature classes directly - future-proof and maintainable
            const featureModules = [
                await import('./packs/force-empowered-self.js'),
                // Future features just add here:
                // await import('./packs/action-surge.js'),
                // await import('./packs/sneak-attack.js'),
            ];

            // Instantiate and register
            for (const module of featureModules) {
                try {
                    const feature = new module.default();
                    this.loadedFeatures.set(feature.id, feature);
                    API.log('debug', `Loaded feature pack: ${feature.name} (${feature.id})`);
                } catch (error) {
                    API.log('error', `Failed to instantiate feature from module:`, error);
                }
            }
        } catch (error) {
            API.log('error', 'Failed to load feature packs', error);
        }
    }

    /**
     * Get available features for actor and dialog type
     */
    getAvailableFeatures(actor, dialogType) {
        if (!this.initialized) {
            API.log('warning', 'Feature Manager not initialized');
            return [];
        }

        const actorId = actor.id;
        
        // Check cache first
        if (this.actorFeatureCache.has(actorId)) {
            const cachedFeatures = this.actorFeatureCache.get(actorId);
            return cachedFeatures.filter(f => f.affectsDialogType(dialogType));
        }

        // Discover features for this actor
        const availableFeatures = [];
        
        for (const [featureId, feature] of this.loadedFeatures) {
            if (this.isFeatureAvailable(actor, feature)) {
                availableFeatures.push(feature);
            }
        }

        // Cache the results
        this.actorFeatureCache.set(actorId, availableFeatures);
        
        return availableFeatures.filter(f => f.affectsDialogType(dialogType));
    }

    /**
     * Check if feature is available to actor
     */
    isFeatureAvailable(actor, feature) {
        try {
            // Check feats - exact name match
            const hasFeat = actor.itemTypes.feat.some(feat => 
                feat.name === feature.name
            );
            if (actor.itemTypes?.feat && Array.isArray(actor.itemTypes.feat)) {
                const hasFeat = actor.itemTypes.feat.some(feat => 
                    feat.name === feature.name
                );
                if (hasFeat) {
                    API.log('debug', `Feature ${feature.name} found in feats for actor ${actor.name}`);
                    return true;
                }
            }

            // Check equipment properties (with safety check)
            if (actor.itemTypes?.equipment && Array.isArray(actor.itemTypes.equipment)) {
                const hasEquipment = actor.itemTypes.equipment.some(item => 
                    item.system?.properties && 
                    item.system.properties[feature.name] === true
                );
                if (hasEquipment) {
                    API.log('debug', `Feature ${feature.name} found in equipment for actor ${actor.name}`);
                    return true;
                }
            }

            return false;
        } catch (error) {
            API.log('error', `Error checking feature availability for ${feature.name}:`, error);
            return false;
        }
    }

    /**
     * Check if character has Multiclass Improvement feat and return level adjustment
     * @param {Object} actor - The actor object
     * @param {string} class - The class name to exclude from the calculation
     * @returns {number} Level adjustment from the next highest class, or 0 if not applicable
     */
     multiclassImproveCheck(actor, className) {
        try {
            // Check if character has the "Multiclass Improvement" feat
            if (!actor.itemTypes?.feat || !Array.isArray(actor.itemTypes.feat)) {
                return 0;
            }

            const hasMulticlassImprovement = actor.itemTypes.feat.some(feat => 
                feat.name === "Multiclass Improvement"
            );

            if (!hasMulticlassImprovement) {
                return 0;
            }

            // Get all classes from the actor
            if (!actor.itemTypes?.class || !Array.isArray(actor.itemTypes.class)) {
                return 0;
            }

            const classes = actor.itemTypes.class;
            
            // Filter out the passed-in class and get classes with levels > 3
            const eligibleClasses = classes
                .filter(cls => cls.name !== className && cls.system?.levels > 3)
                .map(cls => ({
                    name: cls.name,
                    levels: cls.system.levels,
                    originalIndex: classes.indexOf(cls)
                }));

            // If there isn't at least 1 class with level > 3, return 0
            if (eligibleClasses.length < 1) {
                return 0;
            }

            // If there is at least 1 eligible class, return the highest level class or the first one if there are multiple with the same level
            if (eligibleClasses.length >= 1) {
                // Sort by level (highest first), then by original index (first in array wins tie)
                eligibleClasses.sort((a, b) => {
                    if (b.levels !== a.levels) {
                        return b.levels - a.levels; // Higher level first
                    }
                    return a.originalIndex - b.originalIndex; // Lower index first (tie-breaker)
                });
                
                const highestClass = eligibleClasses[0];
                const levelAdjustment = highestClass.levels;
                API.log('debug', `Multiclass Improvement: Found highest eligible class ${highestClass.name} with ${levelAdjustment} levels for actor ${actor.name}`);
                return levelAdjustment;
            }

            // No eligible classes found
            return 0;

        } catch (error) {
            API.log('error', `Error checking multiclass improvement for actor ${actor.name}:`, error);
            return 0;
        }
    }

    /**
     * Clear actor feature cache (call when actor changes)
     */
    clearActorCache(actorId) {
        if (actorId) {
            this.actorFeatureCache.delete(actorId);
        } else {
            this.actorFeatureCache.clear();
        }
        API.log('debug', `Cleared feature cache for actor: ${actorId || 'all'}`);
    }

    /**
     * Get all loaded features
     */
    getAllFeatures() {
        return Array.from(this.loadedFeatures.values());
    }

    /**
     * Get feature by ID
     */
    getFeature(featureId) {
        return this.loadedFeatures.get(featureId);
    }

    /**
     * Register a feature manually (for testing or dynamic features)
     */
    registerFeature(feature) {
        this.loadedFeatures.set(feature.id, feature);
        API.log('debug', `Registered feature: ${feature.name} (${feature.id})`);
    }

    /**
     * Unregister a feature
     */
    unregisterFeature(featureId) {
        const removed = this.loadedFeatures.delete(featureId);
        if (removed) {
            API.log('debug', `Unregistered feature: ${featureId}`);
            // Clear cache since available features may have changed
            this.clearActorCache();
        }
        return removed;
    }

    /**
     * Get features by dialog type
     */
    getFeaturesByDialogType(dialogType) {
        return Array.from(this.loadedFeatures.values())
            .filter(feature => feature.affectsDialogType(dialogType));
    }

    /**
     * Get reactive features (affect rolls against the owner)
     */
    getReactiveFeatures() {
        return Array.from(this.loadedFeatures.values())
            .filter(feature => feature.isReactive);
    }

    /**
     * Get active features (affect rolls the owner makes)
     */
    getActiveFeatures() {
        return Array.from(this.loadedFeatures.values())
            .filter(feature => feature.isActive);
    }

    /**
     * Get features that affect a specific workflow step
     * @param {string} stepId - The workflow step ID to check
     * @returns {Array} Array of features that affect this step
     */
    getFeaturesForStep(stepId) {
        if (!this.initialized) {
            API.log('warning', 'Feature Manager not initialized');
            return [];
        }

        return Array.from(this.loadedFeatures.values())
            .filter(feature => feature.affectsWorkflowStep && feature.affectsWorkflowStep(stepId));
    }
}

// Create singleton instance
export const featureManager = new FeatureManager();

// Export the multiclass improvement check function as a standalone utility
export function multiclassImproveCheck(actor, className) {
    return featureManager.multiclassImproveCheck(actor, className);
}
