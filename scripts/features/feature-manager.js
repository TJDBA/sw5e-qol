import { API } from '../api.js';

/**
 * Feature Manager
 * Handles discovery, loading, and caching of feature packs
 */
export class FeatureManager {
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
     * Load all feature packs from the packs directory
     */
    async loadFeaturePacks() {
        try {
            // Import feature packs statically through index
            const { ForceEmpoweredSelfFeature } = await import('./packs/index.js');
            
            // Register features
            const features = [
                new ForceEmpoweredSelfFeature()
            ];

            for (const feature of features) {
                this.loadedFeatures.set(feature.id, feature);
                API.log('debug', `Loaded feature pack: ${feature.name} (${feature.id})`);
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
            const hasFeat = actor.itemTypes.feats.some(feat => 
                feat.name === feature.name
            );
            if (hasFeat) {
                API.log('debug', `Feature ${feature.name} found in feats for actor ${actor.name}`);
                return true;
            }

            // Check equipment properties
            const hasEquipment = actor.items.equipment.some(item => 
                item.system.properties && 
                item.system.properties[feature.name] === true
            );
            if (hasEquipment) {
                API.log('debug', `Feature ${feature.name} found in equipment for actor ${actor.name}`);
                return true;
            }

            return false;
        } catch (error) {
            API.log('error', `Error checking feature availability for ${feature.name}:`, error);
            return false;
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
}

// Create singleton instance
export const featureManager = new FeatureManager();
