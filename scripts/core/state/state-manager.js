// scripts/core/state/state-manager.js
// SW5E QoL - State Management System
// Handles flexible state structure, pack features, and serialization

export class StateManager {
  constructor() {
    this.validators = new Map();
    this.listeners = new Map();
  }

  /**
   * Create a new workflow state object
   * @param {string} workflowType - Type of workflow (attack, damage, save, etc.)
   * @param {Object} initialData - Initial state data
   * @returns {Object} New state object
   */
  createWorkflowState(workflowType, initialData = {}) {
    const baseState = {
      // Core workflow data
      workflowType,
      timestamp: Date.now(),
      actor: null,
      targets: [],
      
      // Workflow progression
      currentPhase: 'start',
      completedPhases: [],
      
      // Core data (varies by workflow type)
      data: {},
      
      // Pack-extensible features
      packFeatures: [],
      
      // UI state
      ui: {
        dialogOpen: false,
        cardRendered: false
      },
      
      // Validation and error state
      validation: {
        isValid: true,
        errors: [],
        warnings: []
      }
    };

    // Merge with initial data
    return this.deepMerge(baseState, initialData);
  }

  /**
   * Update state with new data
   * @param {Object} state - Current state object
   * @param {Object} updates - Updates to apply
   * @param {string} source - Source of the update (for tracking)
   * @returns {Object} Updated state object
   */
  updateState(state, updates, source = 'unknown') {
    if (!state || typeof state !== 'object') {
      throw new Error('Invalid state object provided');
    }

    // Create a copy of the current state
    const updatedState = { ...state };
    
    // Apply updates
    const mergedState = this.deepMerge(updatedState, updates);
    
    // Update timestamp
    mergedState.lastModified = Date.now();
    mergedState.lastModifiedBy = source;
    
    // Validate the updated state
    this.validateState(mergedState);
    
    return mergedState;
  }

  /**
   * Add a pack feature to the state
   * @param {Object} state - Current state object
   * @param {string} packId - Pack identifier
   * @param {Object} featureData - Feature-specific data
   * @returns {Object} Updated state object
   */
  addPackFeature(state, packId, featureData = {}) {
    if (!packId || typeof packId !== 'string') {
      throw new Error('Invalid pack ID provided');
    }

    const updatedState = { ...state };
    
    // Initialize packFeatures array if it doesn't exist
    if (!updatedState.packFeatures) {
      updatedState.packFeatures = [];
    }

    // Check if feature already exists
    const existingIndex = updatedState.packFeatures.findIndex(f => f.id === packId);
    
    if (existingIndex >= 0) {
      // Update existing feature
      updatedState.packFeatures[existingIndex] = {
        ...updatedState.packFeatures[existingIndex],
        ...featureData,
        lastUpdated: Date.now()
      };
    } else {
      // Add new feature
      updatedState.packFeatures.push({
        id: packId,
        addedAt: Date.now(),
        lastUpdated: Date.now(),
        ...featureData
      });
    }

    return updatedState;
  }

  /**
   * Remove a pack feature from the state
   * @param {Object} state - Current state object
   * @param {string} packId - Pack identifier to remove
   * @returns {Object} Updated state object
   */
  removePackFeature(state, packId) {
    if (!packId || typeof packId !== 'string') {
      throw new Error('Invalid pack ID provided');
    }

    const updatedState = { ...state };
    
    if (updatedState.packFeatures) {
      updatedState.packFeatures = updatedState.packFeatures.filter(f => f.id !== packId);
    }

    return updatedState;
  }

  /**
   * Get a pack feature from the state
   * @param {Object} state - Current state object
   * @param {string} packId - Pack identifier
   * @returns {Object|null} Feature data or null if not found
   */
  getPackFeature(state, packId) {
    if (!state?.packFeatures || !packId) return null;
    
    return state.packFeatures.find(f => f.id === packId) || null;
  }

  /**
   * Check if a pack feature exists in the state
   * @param {Object} state - Current state object
   * @param {string} packId - Pack identifier
   * @returns {boolean} True if feature exists
   */
  hasPackFeature(state, packId) {
    return this.getPackFeature(state, packId) !== null;
  }

  /**
   * Serialize state for storage in chat card flags
   * @param {Object} state - State object to serialize
   * @returns {Object} Serialized state data
   */
  serializeState(state) {
    if (!state) return null;

    const serialized = {
      workflowType: state.workflowType,
      timestamp: state.timestamp,
      lastModified: state.lastModified,
      currentPhase: state.currentPhase,
      completedPhases: state.completedPhases,
      
      // Extract key data (not full objects)
      actor: this.extractActorData(state.actor),
      targets: this.extractTargetsData(state.targets),
      data: this.extractCoreData(state.data),
      packFeatures: state.packFeatures || [],
      
      // UI state
      ui: {
        dialogOpen: state.ui?.dialogOpen || false,
        cardRendered: state.ui?.cardRendered || false
      },
      
      // Validation state
      validation: {
        isValid: state.validation?.isValid || true,
        errors: state.validation?.errors || [],
        warnings: state.validation?.warnings || []
      }
    };

    return serialized;
  }

  /**
   * Deserialize state from chat card flags
   * @param {Object} serializedState - Serialized state data
   * @returns {Object} Reconstructed state object
   */
  deserializeState(serializedState) {
    if (!serializedState) return null;

    const state = {
      ...serializedState,
      // Reconstruct any needed objects
      actor: this.reconstructActorData(serializedState.actor),
      targets: this.reconstructTargetsData(serializedState.targets),
      data: this.reconstructCoreData(serializedState.data)
    };

    return state;
  }

  /**
   * Extract key actor data for serialization
   * @param {Actor|Object} actor - Actor object or actor data
   * @returns {Object} Extracted actor data
   */
  extractActorData(actor) {
    if (!actor) return null;
    
    if (actor instanceof Actor) {
      return {
        id: actor.id,
        name: actor.name,
        type: actor.type,
        img: actor.img
      };
    }
    
    return actor;
  }

  /**
   * Extract key target data for serialization
   * @param {Array} targets - Array of target objects
   * @returns {Array} Extracted target data
   */
  extractTargetsData(targets) {
    if (!Array.isArray(targets)) return [];
    
    return targets.map(target => {
      if (target instanceof Token) {
        return {
          id: target.id,
          name: target.name,
          img: target.document?.texture?.src || target.document?.img,
          sceneId: target.document?.parent?.id
        };
      }
      
      return target;
    });
  }

  /**
   * Extract key core data for serialization
   * @param {Object} data - Core workflow data
   * @returns {Object} Extracted core data
   */
  extractCoreData(data) {
    if (!data || typeof data !== 'object') return {};
    
    const extracted = {};
    
    // Handle different data types
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof Roll) {
        // Extract roll formula and results
        extracted[key] = {
          formula: value.formula,
          total: value.total,
          results: value.results,
          type: 'roll'
        };
      } else if (value instanceof Item) {
        // Extract item data
        extracted[key] = {
          id: value.id,
          name: value.name,
          type: value.type,
          img: value.img
        };
      } else if (typeof value === 'object' && value !== null) {
        // Recursively extract nested objects
        extracted[key] = this.extractCoreData(value);
      } else {
        // Primitive values
        extracted[key] = value;
      }
    }
    
    return extracted;
  }

  /**
   * Reconstruct actor data from serialized form
   * @param {Object} actorData - Serialized actor data
   * @returns {Actor|null} Actor object or null
   */
  reconstructActorData(actorData) {
    if (!actorData?.id) return null;
    
    // Try to get the actor from the game
    const actor = game.actors.get(actorData.id);
    return actor || actorData;
  }

  /**
   * Reconstruct target data from serialized form
   * @param {Array} targetsData - Serialized target data
   * @returns {Array} Reconstructed target data
   */
  reconstructTargetsData(targetsData) {
    if (!Array.isArray(targetsData)) return [];
    
    return targetsData.map(targetData => {
      if (targetData.id && targetData.sceneId) {
        // Try to get the token from the scene
        const scene = game.scenes.get(targetData.sceneId);
        if (scene) {
          const token = scene.tokens.get(targetData.id);
          if (token) return token;
        }
      }
      
      return targetData;
    });
  }

  /**
   * Reconstruct core data from serialized form
   * @param {Object} data - Serialized core data
   * @returns {Object} Reconstructed core data
   */
  reconstructCoreData(data) {
    if (!data || typeof data !== 'object') return {};
    
    const reconstructed = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (value?.type === 'roll' && value.formula) {
        // Reconstruct roll object if needed
        try {
          reconstructed[key] = new Roll(value.formula);
          // Set the total if available
          if (value.total !== undefined) {
            reconstructed[key].total = value.total;
          }
        } catch (error) {
          console.warn(`Failed to reconstruct roll for ${key}:`, error);
          reconstructed[key] = value;
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recursively reconstruct nested objects
        reconstructed[key] = this.reconstructCoreData(value);
      } else {
        // Primitive values
        reconstructed[key] = value;
      }
    }
    
    return reconstructed;
  }

  /**
   * Validate state object
   * @param {Object} state - State object to validate
   * @returns {boolean} True if valid
   */
  validateState(state) {
    if (!state || typeof state !== 'object') {
      throw new Error('State must be an object');
    }

    if (!state.workflowType || typeof state.workflowType !== 'string') {
      throw new Error('State must have a valid workflowType');
    }

    // Additional validation can be added here
    return true;
  }

  /**
   * Deep merge objects
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   * @returns {Object} Merged object
   */
  deepMerge(target, source) {
    if (!source || typeof source !== 'object') return target;
    
    const result = { ...target };
    
    for (const [key, value] of Object.entries(source)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.deepMerge(result[key] || {}, value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Add state change listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addStateChangeListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove state change listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  removeStateChangeListener(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index >= 0) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Notify state change listeners
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  notifyStateChange(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in state change listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.validators.clear();
    this.listeners.clear();
  }
}
