/**
 * SW5E QoL - Public API
 * Provides public interface for other modules to interact with SW5E QoL
 */

// API instance (will be set when module initializes)
let apiInstance = null;

/**
 * Set the API instance (called by module initialization)
 * @param {Object} instance - Module instance
 */
export function setAPIInstance(instance) {
	apiInstance = instance;
}

/**
 * Get the API instance
 * @returns {Object|null} - API instance or null if not initialized
 */
export function getAPIInstance() {
	return apiInstance;
}

/**
 * Public API object
 */
export const SW5EQoL = {
	/**
	 * Check if the module is ready
	 * @returns {boolean} - True if module is ready
	 */
	isReady() {
		return apiInstance !== null && apiInstance.initialized;
	},
	
	/**
	 * Start a workflow
	 * @param {string} workflowType - Type of workflow to start
	 * @param {Object} seedData - Initial data for the workflow
	 * @returns {Promise<Object>} - Promise resolving to workflow result
	 */
	async startWorkflow(workflowType, seedData) {
		if (!this.isReady()) {
			throw new Error('SW5E QoL module is not ready');
		}
		
		return await apiInstance.workflowOrchestrator.startWorkflow(workflowType, seedData);
	},
	
	/**
	 * Continue a workflow
	 * @param {string} workflowId - ID of workflow to continue
	 * @param {Object} continuationData - Data for workflow continuation
	 * @returns {Promise<Object>} - Promise resolving to workflow result
	 */
	async continueWorkflow(workflowId, continuationData) {
		if (!this.isReady()) {
			throw new Error('SW5E QoL module is not ready');
		}
		
		return await apiInstance.workflowOrchestrator.continueWorkflow(workflowId, continuationData);
	},
	
	/**
	 * Chain to next workflow
	 * @param {string} currentWorkflowId - Current workflow ID
	 * @param {string} nextWorkflowType - Type of next workflow
	 * @param {Object} chainData - Data to pass to next workflow
	 * @returns {Promise<Object>} - Promise resolving to new workflow result
	 */
	async chainToNextWorkflow(currentWorkflowId, nextWorkflowType, chainData) {
		if (!this.isReady()) {
			throw new Error('SW5E QoL module is not ready');
		}
		
		return await apiInstance.workflowOrchestrator.chainToNextWorkflow(currentWorkflowId, nextWorkflowType, chainData);
	},
	
	/**
	 * Get workflow status
	 * @param {string} workflowId - Workflow ID
	 * @returns {Object|null} - Workflow status or null if not found
	 */
	getWorkflowStatus(workflowId) {
		if (!this.isReady()) {
			return null;
		}
		
		return apiInstance.workflowOrchestrator.getWorkflowStatus(workflowId);
	},
	
	/**
	 * Get all active workflows
	 * @returns {Array} - Array of active workflow statuses
	 */
	getActiveWorkflows() {
		if (!this.isReady()) {
			return [];
		}
		
		return apiInstance.workflowOrchestrator.getActiveWorkflows();
	},
	
	/**
	 * Get available workflow types
	 * @returns {Array} - Array of available workflow type names
	 */
	getAvailableWorkflowTypes() {
		if (!this.isReady()) {
			return [];
		}
		
		return apiInstance.workflowOrchestrator.getAvailableWorkflowTypes();
	},
	
	/**
	 * Get module setting
	 * @param {string} key - Setting key
	 * @returns {any} - Setting value
	 */
	getSetting(key) {
		if (!this.isReady()) {
			return null;
		}
		
		return apiInstance.getSetting(key);
	},
	
	/**
	 * Check if a feature is enabled
	 * @param {string} feature - Feature name
	 * @returns {boolean} - True if feature is enabled
	 */
	isFeatureEnabled(feature) {
		if (!this.isReady()) {
			return false;
		}
		
		return apiInstance.isFeatureEnabled(feature);
	},
	
	/**
	 * Get current state
	 * @returns {Object|null} - Current state object or null if not ready
	 */
	getCurrentState() {
		if (!this.isReady()) {
			return null;
		}
		
		return apiInstance.stateManager.getCurrentState();
	},
	
	/**
	 * Get state by workflow ID
	 * @param {string} workflowId - Workflow ID
	 * @returns {Object|null} - State object or null if not found
	 */
	getStateByWorkflowId(workflowId) {
		if (!this.isReady()) {
			return null;
		}
		
		return apiInstance.stateManager.getStateByWorkflowId(workflowId);
	},
	
	/**
	 * Execute a dice roll
	 * @param {string} formula - Dice formula
	 * @param {Object} options - Roll options
	 * @returns {Promise<Object>} - Promise resolving to roll result
	 */
	async executeRoll(formula, options = {}) {
		if (!this.isReady()) {
			throw new Error('SW5E QoL module is not ready');
		}
		
		// This will be implemented when we create the dice engine instance
		throw new Error('Dice rolling not yet implemented');
	},
	
	/**
	 * Execute a d20 roll
	 * @param {string} formula - Dice formula
	 * @param {Object} options - Roll options
	 * @returns {Promise<Object>} - Promise resolving to roll result
	 */
	async executeD20Roll(formula, options = {}) {
		if (!this.isReady()) {
			throw new Error('SW5E QoL module is not ready');
		}
		
		// This will be implemented when we create the d20 engine instance
		throw new Error('D20 rolling not yet implemented');
	},
	
	/**
	 * Get module version
	 * @returns {string} - Module version
	 */
	getVersion() {
		return '0.1.0';
	},
	
	/**
	 * Get module information
	 * @returns {Object} - Module information object
	 */
	getModuleInfo() {
		return {
			name: 'SW5E Quality of Life',
			version: this.getVersion(),
			ready: this.isReady(),
			features: this.getAvailableWorkflowTypes()
		};
	}
};

// Export the API object
export default SW5EQoL;
