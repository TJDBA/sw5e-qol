import { API } from '../api.js';
import { getDataPaths } from '../core/utils/reference/data-lookup.js';

const logThisFile = true;

/**
 * Feature Manager
 * Simplified feature management with cached feature data
 */
export class FeatureManager {
    /**
     * Create a new FeatureManager instance
     */
    constructor() {
        this.featureCache = new Map(); // Cached feature data: {id, affects[], workflowSteps[], section, isReactive}
        this.initialized = false;
    }

    /**
     * Initialize the feature manager and cache all features
     */
    async init() {
        try {
            if (this.initialized) return;
            
            if (logThisFile) API.log('info', 'Initializing Feature Manager...');
            await this.loadAndCacheFeatures();
            this.initialized = true;
            if (logThisFile) API.log('info', `Feature Manager initialized with ${this.featureCache.size} features`);
        } catch (error) {
            API.log('error', 'Failed to initialize Feature Manager', error);
        }
    }

    /**
     * Load and cache all feature data
     */
    async loadAndCacheFeatures() {
        try {
            // Import all feature classes
            const featureModules = [
                await import('./packs/force-empowered-self.js'),
                // Future features just add here:
                // await import('./packs/action-surge.js'),
                // await import('./packs/sneak-attack.js'),
            ];

            // Cache feature data
            for (const module of featureModules) {
                try {
                    const feature = new module.default();
                    this.featureCache.set(feature.id, feature);
                    if (logThisFile) API.log('debug', `Cached feature: ${feature.name} (${feature.id})`);
                } catch (error) {
                    API.log('error', `Failed to cache feature from module:`, error);
                }
            }
        } catch (error) {
            API.log('error', 'Failed to load and cache features', error);
        }
    }

    /**
     * Get actor from tokenID using data lookup utility
     * @param {string} tokenId - The token ID
     * @returns {Object|null} The actor object or null if not found
     */
    async getActorFromTokenId(tokenId) {
        try {
            const tokenPathConfig = getDataPaths('token', 'token');
            if (!tokenPathConfig) {
                API.log('error', 'Token data path configuration not found');
                return null;
            }

            const token = canvas.tokens.get(tokenId);
            if (!token) {
                if (logThisFile) API.log('warning', `Token with ID ${tokenId} not found in current scene`);
                return null;
            }

            const actorPath = tokenPathConfig.subpaths.actor;
            const actor = getProperty(token, actorPath);
            
            if (!actor) {
                if (logThisFile) API.log('warning', `Actor not found for token ${tokenId}`);
                return null;
            }

            return actor;
        } catch (error) {
            API.log('error', `Error getting actor from token ID ${tokenId}:`, error);
            return null;
        }
    }

    /**
     * Get features by actor and dialog type
     * @param {Object|string} actorOrTokenId - Actor object or token ID string
     * @param {string} dialogType - The dialog type
     * @returns {Array} Array of available features
     */
    async getFeaturesByActorAndDialog(actorOrTokenId, dialogType) {
        
        if (!this.initialized) {
            if (logThisFile) API.log('warning', 'Feature Manager not initialized');
            return [];
        }

        let actor;
        
        // Handle both actor object and token ID
        if (typeof actorOrTokenId === 'string') {
            actor = await this.getActorFromTokenId(actorOrTokenId);
            if (!actor) {
                return [];
            }
        } else {
            actor = actorOrTokenId;
        }

        // Get all features that affect this dialog type
        const allFeatures = Array.from(this.featureCache.values());
        console.warn('allFeatures', allFeatures);
        const dialogFeatures = allFeatures.filter(feature => feature.affectsDialogType(dialogType));
        console.warn('dialogFeatures', dialogFeatures);
        // Filter by actor availability
        const availableFeatures = dialogFeatures.filter(feature => this.isFeatureAvailable(actor, feature.id));
        
        if (logThisFile) {
            API.log('debug', `Found ${availableFeatures.length} available features for actor ${actor.name} and dialog type ${dialogType}`);
        }
        
        return availableFeatures;
    }

    /**
     * Check if feature is available to actor
     * @param {Object} actor - The actor object
     * @param {string} featureId - The feature ID
     * @returns {boolean} True if feature is available
     */
    isFeatureAvailable(actor, featureId) {
        try {
            // Get the feature from cache to get its name
            const feature = this.featureCache.get(featureId);
            if (!feature) {
                if (logThisFile) API.log('debug', `Feature ${featureId} not found in cache`);
                return false;
            }
            
            const featureName = feature.name;
            
            // Check feats - exact name match
            if (actor.itemTypes?.feat && Array.isArray(actor.itemTypes.feat)) {
                const hasFeat = actor.itemTypes.feat.some(feat => 
                    feat.name === featureName
                );
                if (hasFeat) {
                    if (logThisFile) API.log('debug', `Feature ${featureId} found in feats for actor ${actor.name}`);
                    return true;
                } else {
                    if (logThisFile) API.log('debug', `Feature ${featureId} not found in feats for actor ${actor.name}`);
                }
            }

            // Check equipment properties
            if (actor.itemTypes?.equipment && Array.isArray(actor.itemTypes.equipment)) {
                const hasEquipment = actor.itemTypes.equipment.some(item => 
                    item.system?.properties && 
                    item.system.properties[featureId] === true
                );
                if (hasEquipment) {
                    if (logThisFile) API.log('debug', `Feature ${featureId} found in equipment for actor ${actor.name}`);
                    return true;
                }
            }

            return false;
        } catch (error) {
            API.log('error', `Error checking feature availability for ${featureId}:`, error);
            return false;
        }
    }

    /**
     * Get all reactive features
     * @returns {Array} Array of reactive features
     */
    getReactiveFeatures() {
        if (!this.initialized) {
            if (logThisFile) API.log('warning', 'Feature Manager not initialized');
            return [];
        }

        return Array.from(this.featureCache.values())
            .filter(feature => feature.isReactive);
    }

    /**
     * Get all workflow steps for a given feature
     * @param {string} featureId - The feature ID
     * @returns {Array} Array of workflow steps
     */
    getWorkflowStepsForFeature(featureId) {
        const feature = this.featureCache.get(featureId);
        return feature ? feature.workflowSteps : [];
    }

    /**
     * Get all features for a given workflow step
     * @param {string} stepId - The workflow step ID
     * @returns {Array} Array of features that affect this step
     */
    getFeaturesForWorkflowStep(stepId) {
        if (!this.initialized) {
            if (logThisFile) API.log('warning', 'Feature Manager not initialized');
            return [];
        }

        return Array.from(this.featureCache.values())
            .filter(feature => feature.workflowSteps.includes(stepId));
    }

}

// Create singleton instance
export const featureManager = new FeatureManager();


