import { 
    getAllWorkflowConfigs, 
    getWorkflowConfig, 
    getStepConfig, 
    getStepValidationProperties, 
    validateStepState 
} from './workflow-config.js';

/**
 * WorkflowManager - Handles sequential step-based workflows for game actions
 * Simple state tracking and step management for FoundryVTT module
 */
export class WorkflowManager {
    constructor() {
        this.workflows = getAllWorkflowConfigs();
        this.currentWorkflowId = null;
        this.currentStepIndex = 0;
    }

    /**
     * Get all workflow definitions
     * @returns {Object} All workflow configurations
     */
    getAllWorkflows() {
        return this.workflows;
    }

    /**
     * Get specific workflow definition by ID
     * @param {string} id - Workflow ID
     * @returns {Object|null} Workflow configuration or null if not found
     */
    getWorkflow(id) {
        return getWorkflowConfig(id);
    }

    /**
     * Set active workflow and reset to start step
     * @param {string} id - Workflow ID
     * @returns {boolean} True if workflow was set successfully, false if not found
     */
    setWorkflow(id) {
        const workflow = getWorkflowConfig(id);
        if (!workflow) {
            console.warn(`WorkflowManager: Workflow "${id}" not found`);
            return false;
        }

        this.currentWorkflowId = id;
        this.currentStepIndex = 0; // Reset to start step
        return true;
    }

    /**
     * Get current step index
     * @returns {number} Current step index (0 = start, length-1 = complete)
     */
    getCurrentStep() {
        return this.currentStepIndex;
    }

    /**
     * Get current step name
     * @returns {string|null} Current step name or null if no active workflow
     */
    getCurrentStepName() {
        if (!this.currentWorkflowId) return null;
        const workflow = getWorkflowConfig(this.currentWorkflowId);
        return workflow ? workflow.workflowSteps[this.currentStepIndex] : null;
    }

    /**
     * Advance to next step in workflow
     * @returns {string|null} Next step name or null if at end of workflow
     */
    getNextStep() {
        if (!this.currentWorkflowId) return null;
        
        const workflow = getWorkflowConfig(this.currentWorkflowId);
        if (!workflow) return null;

        // Check if we can advance
        if (this.currentStepIndex < workflow.workflowSteps.length - 1) {
            this.currentStepIndex++;
            return workflow.workflowSteps[this.currentStepIndex];
        }

        return null; // Already at complete step
    }

    /**
     * Check if workflow is complete
     * @returns {boolean} True if at complete step
     */
    isComplete() {
        if (!this.currentWorkflowId) return false;
        const workflow = getWorkflowConfig(this.currentWorkflowId);
        return workflow && this.currentStepIndex === workflow.workflowSteps.length - 1;
    }

    /**
     * Get step actions for a specific step
     * This is a placeholder - actual implementation would return function calls/actions
     * @param {string} stepId - Step identifier
     * @returns {Array} Array of function calls/actions for the step
     */
    getStepActions(stepId) {
        // Placeholder implementation
        // In a real implementation, this would return actual function calls/actions
        // based on the step ID and current context
        return [];
    }

    /**
     * Get current step configuration
     * @returns {Object|null} Current step configuration or null if no active workflow
     */
    getCurrentStepConfig() {
        if (!this.currentWorkflowId) return null;
        const stepName = this.getCurrentStepName();
        return stepName ? getStepConfig(this.currentWorkflowId, stepName) : null;
    }

    /**
     * Get validation properties for current step
     * @returns {Array} Array of validation property names for current step
     */
    getCurrentStepValidationProperties() {
        if (!this.currentWorkflowId) return [];
        const stepName = this.getCurrentStepName();
        return stepName ? getStepValidationProperties(this.currentWorkflowId, stepName) : [];
    }

    /**
     * Validate state against current step requirements
     * @param {Object} state - State object to validate
     * @returns {Object} Validation result with isValid and missingProperties
     */
    validateCurrentStepState(state) {
        if (!this.currentWorkflowId) {
            return { isValid: false, missingProperties: [], requiredProperties: [] };
        }
        const stepName = this.getCurrentStepName();
        return stepName ? validateStepState(this.currentWorkflowId, stepName, state) : 
                         { isValid: false, missingProperties: [], requiredProperties: [] };
    }

    /**
     * Get workflow state for saving to chat card flags
     * @returns {Object|null} State object or null if no active workflow
     */
    getState() {
        if (!this.currentWorkflowId) return null;
        
        return {
            workflowId: this.currentWorkflowId,
            stepIndex: this.currentStepIndex,
            stepName: this.getCurrentStepName()
        };
    }

    /**
     * Restore workflow state from chat card flags
     * @param {Object} state - State object from chat card flags
     * @returns {boolean} True if state was restored successfully
     */
    restoreState(state) {
        if (!state || !state.workflowId || typeof state.stepIndex !== 'number') {
            return false;
        }

        const workflow = getWorkflowConfig(state.workflowId);
        if (!workflow) {
            console.warn(`WorkflowManager: Cannot restore state for unknown workflow "${state.workflowId}"`);
            return false;
        }

        // Validate step index
        if (state.stepIndex < 0 || state.stepIndex >= workflow.workflowSteps.length) {
            console.warn(`WorkflowManager: Invalid step index ${state.stepIndex} for workflow "${state.workflowId}"`);
            return false;
        }

        this.currentWorkflowId = state.workflowId;
        this.currentStepIndex = state.stepIndex;
        return true;
    }

    /**
     * Reset workflow manager to initial state
     */
    reset() {
        this.currentWorkflowId = null;
        this.currentStepIndex = 0;
    }
}
