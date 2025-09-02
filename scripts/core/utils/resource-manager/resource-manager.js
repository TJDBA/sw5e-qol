/**
 * SW5E QoL Resource Manager - Class-based Resource Management
 * Location: scripts/core/utils/resource-manager/resource-manager.js
 */

// ============================================================================
// RESOURCE MANAGER CLASS
// ============================================================================

/**
 * ResourceManager class for handling SW5E resource operations
 * Integrates with data-paths.json for flexible resource discovery and management
 */
class ResourceManager {
    /**
     * Create a new ResourceManager instance
     * @param {Object} objectToSearch - The object to manage resources for (Actor, Item, etc.)
     * @param {string} resourceCategory - The category of resource (attribute, power, resource, etc.)
     * @param {string} resourceType - The specific type of resource (hp, ammo, etc.)
     */
    constructor(objectToSearch, resourceCategory, resourceType) {
        this.objectId = objectToSearch.id;
        this.objectType = this._determineObjectType(objectToSearch);
        this.resourceCategory = resourceCategory;
        this.resourceType = resourceType;
        this.hasDeducted = false;
        this.hasRefunded = false;
        
        // Store path configuration for efficiency
        this.pathConfig = getDataPaths(resourceCategory, resourceType);
        if (!this.pathConfig) {
            API.log('warning', `No data paths found for ${resourceCategory}.${resourceType}`);
        }
        
        // Data tracking structure
        this.data = {
            original: {},    // Original values before any operations
            spend: {},       // Amount being spent/deducted
            new: {}          // New values after operations
        };
    }

    // ============================================================================
    // INITIALIZATION & SETUP
    // ============================================================================

    /**
     * Determine the type of object being managed
     * @private
     * @param {Object} object - The object to analyze
     * @returns {string} Object type (Actor, Item, etc.)
     */
    _determineObjectType(object) {
        if (object?.documentName === "Actor") return "Actor";
        if (object?.documentName === "Item") return "Item";
        if (object?.system) return "Actor"; // Fallback for actors
        return "Unknown";
    }

    /**
     * Get the current object from Foundry's collections
     * @private
     * @returns {Object|null} The current object or null if not found
     */
    _getObjectFromId() {
        try {
            if (this.objectType === "Actor") {
                return game.actors.get(this.objectId);
            } else if (this.objectType === "Item") {
                return game.items.get(this.objectId);
            }
            return null;
        } catch (error) {
            API.log('error', `Error getting object from ID: ${error.message}`);
            return null;
        }
    }



    // ============================================================================
    // CORE RESOURCE OPERATIONS
    // ============================================================================

    /**
     * Get the current value of the resource and store in data.original
     * @param {string} subpath - Specific subpath to access (optional)
     * @returns {*} Current resource value(s)
     */
    getCurrentValue(subpath = null) {
        const object = this._getObjectFromId();
        if (!object) {
            API.log('error', 'Object not found for resource management');
            return null;
        }

        if (!this.pathConfig) {
            API.log('warning', `No data paths found for ${this.resourceCategory}.${this.resourceType}`);
            return null;
        }

        try {
            // For single value resources
            const basePath = resolveDataPath(this.pathConfig.basePath, this.objectType);
            const actualPath = basePath.replace('object', '');
            let currentValue = getProperty(object, actualPath);
            
            // Store original values for all subpaths
            this.data.original = {};
            if (subpath && this.pathConfig.subpaths[subpath]) {
                const subpathValue = getProperty(object, actualPath + this.pathConfig.subpaths[subpath]);
                this.data.original[subpath] = subpathValue;
                currentValue = subpathValue;
            } else {
                // Store all available subpaths
                Object.entries(this.pathConfig.subpaths).forEach(([key, path]) => {
                    this.data.original[key] = getProperty(object, actualPath + path);
                });
            }

            API.log('debug', `Current value for ${this.resourceCategory}.${this.resourceType}:`, currentValue);
            return currentValue;
        } catch (error) {
            API.log('error', `Error getting current value: ${error.message}`);
            return null;
        }
    }

    /**
     * Deduct resources from the object
     * @param {number} amount - Amount to deduct
     * @param {string} resourceName - Specific resource name (optional)
     * @returns {boolean} Success status
     */
    deductResource(amount, resourceName = null) {
        // Check if already deducted
        if (this.hasDeducted) {
            API.log('warning', `Resource ${this.resourceCategory}.${this.resourceType} has already been deducted`);
            return false;
        }

        const object = this._getObjectFromId();
        if (!object) {
            API.log('error', 'Object not found for resource deduction');
            return false;
        }

        // Ensure we have original values
        if (Object.keys(this.data.original).length === 0) {
            this.getCurrentValue();
        }

        if (!this.pathConfig) {
            API.log('warning', `No data paths found for ${this.resourceCategory}.${this.resourceType}`);
            return false;
        }

        try {
            // Validate sufficient resources
            if (!this._validateDeduction(amount, resourceName)) {
                return false;
            }

            // Store spend amount
            this.data.spend = { amount: amount, resourceName: resourceName };

            // Handle single value resources (like HP, ammo)
            const success = this._deductSingleResource(object, this.pathConfig, amount);

            if (success) {
                this.hasDeducted = true;
                // Update new values
                this._updateNewValues(object, this.pathConfig);
                API.log('debug', `Successfully deducted ${amount} of ${this.resourceCategory}.${this.resourceType}`);
            }

            return success;
        } catch (error) {
            API.log('error', `Error deducting resource: ${error.message}`);
            return false;
        }
    }

    /**
     * Refund resources to the object
     * @param {number} amount - Amount to refund
     * @param {string} resourceName - Specific resource name (optional)
     * @returns {boolean} Success status
     */
    refundResource(amount, resourceName = null) {
        // Check if already refunded
        if (this.hasRefunded) {
            API.log('warning', `Resource ${this.resourceCategory}.${this.resourceType} has already been refunded`);
            return false;
        }

        const object = this._getObjectFromId();
        if (!object) {
            API.log('error', 'Object not found for resource refund');
            return false;
        }

        if (!this.pathConfig) {
            API.log('warning', `No data paths found for ${this.resourceCategory}.${this.resourceType}`);
            return false;
        }

        try {
            // Validate refund won't exceed max (if applicable)
            if (!this._validateRefund(amount, resourceName)) {
                return false;
            }

            // Handle single value resources (like HP, ammo)
            const success = this._refundSingleResource(object, this.pathConfig, amount);

            if (success) {
                this.hasRefunded = true;
                // Update new values
                this._updateNewValues(object, this.pathConfig);
                API.log('debug', `Successfully refunded ${amount} of ${this.resourceCategory}.${this.resourceType}`);
            }

            return success;
        } catch (error) {
            API.log('error', `Error refunding resource: ${error.message}`);
            return false;
        }
}

// ============================================================================
    // HELPER METHODS
// ============================================================================

/**
     * Validate that sufficient resources exist for deduction
     * @private
     * @param {number} amount - Amount to deduct
     * @param {string} resourceName - Specific resource name (optional)
     * @returns {boolean} True if deduction is valid
     */
    _validateDeduction(amount, resourceName = null) {
        if (Object.keys(this.data.original).length === 0) {
            API.log('warning', 'No original values available for validation');
            return false;
        }

        // For single value resources, check if enough value exists
        if (this.data.original.value !== undefined) {
            if (this.data.original.value < amount) {
                API.log('warning', `Insufficient ${this.resourceType} available for deduction`);
                return false;
            }
        }

        return true;
    }

    /**
     * Validate that refund won't exceed maximum values
     * @private
     * @param {number} amount - Amount to refund
     * @param {string} resourceName - Specific resource name (optional)
     * @returns {boolean} True if refund is valid (always true, but may log warnings)
     */
    _validateRefund(amount, resourceName = null) {
        if (Object.keys(this.data.original).length === 0) {
            API.log('warning', 'No original values available for validation');
            return false;
        }

        // For single value resources, check if refund would exceed max
        if (this.data.original.max !== undefined) {
            const currentValue = this.data.original.value || 0;
            if (currentValue + amount > this.data.original.max) {
                API.log('info', `Refund will be capped at maximum ${this.resourceType} (${this.data.original.max})`);
            }
        }

        return true;
    }

    /**
     * Deduct from single value resource
     * @private
     * @param {Object} object - The object to modify
     * @param {Object} pathConfig - Path configuration
     * @param {number} amount - Amount to deduct
     * @returns {boolean} Success status
     */
    _deductSingleResource(object, pathConfig, amount) {
        const basePath = resolveDataPath(pathConfig.basePath, this.objectType);
        const actualPath = basePath.replace('object', '');
        
        const currentValue = getProperty(object, actualPath + '.value');
        const newValue = Math.max(0, currentValue - amount);
        
        return this._updateObjectValue(object, actualPath + '.value', newValue);
    }



    /**
     * Refund single value resource
     * @private
     * @param {Object} object - The object to modify
     * @param {Object} pathConfig - Path configuration
     * @param {number} amount - Amount to refund
     * @returns {boolean} Success status
     */
    _refundSingleResource(object, pathConfig, amount) {
        const basePath = resolveDataPath(pathConfig.basePath, this.objectType);
        const actualPath = basePath.replace('object', '');
        
        const currentValue = getProperty(object, actualPath + '.value');
        const maxValue = getProperty(object, actualPath + '.max') || Infinity;
        const newValue = Math.min(maxValue, currentValue + amount);
        
        return this._updateObjectValue(object, actualPath + '.value', newValue);
    }



    /**
     * Update a value on the object
     * @private
     * @param {Object} object - The object to modify
     * @param {string} path - The path to update
     * @param {*} newValue - The new value
     * @returns {boolean} Success status
     */
    _updateObjectValue(object, path, newValue) {
        try {
            setProperty(object, path, newValue);
            return true;
        } catch (error) {
            API.log('error', `Error updating object value: ${error.message}`);
            return false;
        }
    }

    /**
     * Update the new values in data.new after operations
     * @private
     * @param {Object} object - The current object
     * @param {Object} pathConfig - Path configuration
     */
    _updateNewValues(object, pathConfig) {
        const basePath = resolveDataPath(pathConfig.basePath, this.objectType);
        const actualPath = basePath.replace('object', '');
        
        this.data.new = {};
        
        // Store all available subpaths
        Object.entries(pathConfig.subpaths).forEach(([key, path]) => {
            this.data.new[key] = getProperty(object, actualPath + path);
        });
    }

        /**
     * Create a copy of this ResourceManager for a different object
     * @param {Object} newObject - New object to manage
     * @param {string} resourceCategory - Resource category for new manager
     * @param {string} resourceType - Resource type for new manager
     * @returns {ResourceManager} New ResourceManager instance
     */
    clone(newObject, resourceCategory = null, resourceType = null) {
        return new ResourceManager(
            newObject, 
            resourceCategory || this.resourceCategory, 
            resourceType || this.resourceType
        );
    }
}