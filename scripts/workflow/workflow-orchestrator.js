// scripts/workflow/workflow-orchestrator.js
// SW5E QoL - Workflow Orchestration System
// Manages workflow lifecycle and action execution

export class WorkflowOrchestrator {
  constructor() {
    this.workflows = new Map();
    this.activeWorkflows = new Map();
    this.workflowHistory = [];
  }

  /**
   * Initialize available workflows
   */
  async initializeWorkflows() {
    try {
      // Import and register basic action workflows
      const { AttackAction } = await import('./actions/attack-action.js');
      const { DamageAction } = await import('./actions/damage-action.js');
      const { SaveAction } = await import('./actions/save-action.js');
      const { EffectApplicator } = await import('./actions/effect-applicator.js');

      // Register workflows
      this.registerWorkflow('attack', AttackAction);
      this.registerWorkflow('damage', DamageAction);
      this.registerWorkflow('save', SaveAction);
      this.registerWorkflow('effect', EffectApplicator);

      console.log('SW5E QoL | Workflows registered:', Array.from(this.workflows.keys()));
    } catch (error) {
      console.error('SW5E QoL | Error registering workflows:', error);
      // Don't fail completely - basic functionality can still work
    }
  }

  /**
   * Register a new workflow type
   * @param {string} workflowType - Type identifier
   * @param {Class} workflowClass - Workflow class
   */
  registerWorkflow(workflowType, workflowClass) {
    if (!workflowType || !workflowClass) {
      console.error('SW5E QoL | Invalid workflow registration:', { workflowType, workflowClass });
      return;
    }

    this.workflows.set(workflowType, workflowClass);
    console.log(`SW5E QoL | Registered workflow: ${workflowType}`);
  }

  /**
   * Start a new workflow
   * @param {string} workflowType - Type of workflow to start
   * @param {Object} context - Workflow context data
   * @returns {Object|null} Workflow instance or null if failed
   */
  startWorkflow(workflowType, context = {}) {
    try {
      const WorkflowClass = this.workflows.get(workflowType);
      if (!WorkflowClass) {
        console.error(`SW5E QoL | Unknown workflow type: ${workflowType}`);
        return null;
      }

      const workflow = new WorkflowClass(context);
      const workflowId = this.generateWorkflowId();
      
      this.activeWorkflows.set(workflowId, workflow);
      
      console.log(`SW5E QoL | Started workflow: ${workflowType} (ID: ${workflowId})`);
      
      return {
        id: workflowId,
        type: workflowType,
        instance: workflow,
        context
      };
    } catch (error) {
      console.error(`SW5E QoL | Error starting workflow ${workflowType}:`, error);
      return null;
    }
  }

  /**
   * Continue an existing workflow
   * @param {string} workflowId - Workflow ID to continue
   * @param {Object} data - Data for the next step
   * @returns {Object|null} Updated workflow state or null if failed
   */
  continueWorkflow(workflowId, data = {}) {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      console.error(`SW5E QoL | Workflow not found: ${workflowId}`);
      return null;
    }

    try {
      const result = workflow.continue(data);
      return result;
    } catch (error) {
      console.error(`SW5E QoL | Error continuing workflow ${workflowId}:`, error);
      return null;
    }
  }

  /**
   * Complete a workflow
   * @param {string} workflowId - Workflow ID to complete
   * @returns {boolean} True if completed successfully
   */
  completeWorkflow(workflowId) {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      console.error(`SW5E QoL | Workflow not found: ${workflowId}`);
      return false;
    }

    try {
      const result = workflow.complete();
      
      // Move to history
      this.workflowHistory.push({
        id: workflowId,
        type: workflow.type,
        completedAt: Date.now(),
        result
      });
      
      // Remove from active
      this.activeWorkflows.delete(workflowId);
      
      console.log(`SW5E QoL | Completed workflow: ${workflowId}`);
      return true;
    } catch (error) {
      console.error(`SW5E QoL | Error completing workflow ${workflowId}:`, error);
      return false;
    }
  }

  /**
   * Cancel a workflow
   * @param {string} workflowId - Workflow ID to cancel
   * @returns {boolean} True if cancelled successfully
   */
  cancelWorkflow(workflowId) {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      console.error(`SW5E QoL | Workflow not found: ${workflowId}`);
      return false;
    }

    try {
      workflow.cancel();
      this.activeWorkflows.delete(workflowId);
      
      console.log(`SW5E QoL | Cancelled workflow: ${workflowId}`);
      return true;
    } catch (error) {
      console.error(`SW5E QoL | Error cancelling workflow ${workflowId}:`, error);
      return false;
    }
  }

  /**
   * Get workflow status
   * @param {string} workflowId - Workflow ID
   * @returns {Object|null} Workflow status or null if not found
   */
  getWorkflowStatus(workflowId) {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) return null;

    return {
      id: workflowId,
      type: workflow.type,
      status: workflow.getStatus(),
      context: workflow.context
    };
  }

  /**
   * Get all active workflows
   * @returns {Array} Array of active workflow statuses
   */
  getActiveWorkflows() {
    return Array.from(this.activeWorkflows.entries()).map(([id, workflow]) => ({
      id,
      type: workflow.type,
      status: workflow.getStatus()
    }));
  }

  /**
   * Get workflow history
   * @param {number} limit - Maximum number of entries to return
   * @returns {Array} Array of workflow history entries
   */
  getWorkflowHistory(limit = 10) {
    return this.workflowHistory.slice(-limit);
  }

  /**
   * Generate a unique workflow ID
   * @returns {string} Unique workflow ID
   */
  generateWorkflowId() {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get available workflow types
   * @returns {Array} Array of available workflow type names
   */
  getAvailableWorkflowTypes() {
    return Array.from(this.workflows.keys());
  }

  /**
   * Get workflow configuration
   * @param {string} workflowType - Workflow type
   * @returns {Object|null} Workflow configuration or null if not found
   */
  getWorkflowConfig(workflowType) {
    const WorkflowClass = this.workflows.get(workflowType);
    if (!WorkflowClass) return null;

    return WorkflowClass.getConfig ? WorkflowClass.getConfig() : null;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Cancel all active workflows
    for (const [id, workflow] of this.activeWorkflows.entries()) {
      try {
        workflow.cancel();
      } catch (error) {
        console.warn(`SW5E QoL | Error cancelling workflow ${id} during cleanup:`, error);
      }
    }

    this.activeWorkflows.clear();
    this.workflowHistory = [];
    
    console.log('SW5E QoL | Workflow orchestrator cleaned up');
  }
}
