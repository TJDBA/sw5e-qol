// SW5E QoL - State Management
// Handles workflow state flow through the system

import { getWorkflow } from '../config/workflows.js';

export class State {
  constructor(workflowName, actorID, targets = [], additionalData = {}) {
    // Get workflow configuration
    this.workflow = getWorkflow(workflowName);
    
    // Validate workflow
    if (!this.workflow || this.workflow.workflowSteps.length < 3) {
      throw new Error(`Invalid workflow: ${workflowName}`);
    }
    
    this.actorID = actorID;
    this.targets = targets; // Initialize empty, populated when dialog submits
    this.chainNumber = 0; // Always start at first element (start)
    this.chainLength = this.workflow.workflowSteps.length;
    this.data = additionalData;
    this.timestamp = Date.now();
  }

  /**
   * Get current step
   * @returns {string} Current workflow step
   */
  getCurrentStep() {
    return this.workflow.workflowSteps[this.chainNumber];
  }

  /**
   * Get next step
   * @returns {string} Next workflow step
   */
  getNextStep() {
    return this.workflow.workflowSteps[this.chainNumber + 1];
  }

  /**
   * Check if workflow is complete
   * @returns {boolean} True if complete
   */
  isComplete() {
    return this.getCurrentStep() === 'complete';
  }

  /**
   * Check if more workflows in chain
   * @returns {boolean} True if more workflows
   */
  hasMoreWorkflows() {
    return this.chainNumber < this.chainLength - 1;
  }

  /**
   * Move to next step
   */
  nextStep() {
    if (this.hasMoreWorkflows()) {
      this.chainNumber++;
    }
  }

  /**
   * Add data to state
   * @param {Object} data - Data to add
   */
  addData(data) {
    this.data = { ...this.data, ...data };
  }

  /**
   * Get data from state
   * @param {string} key - Data key
   * @returns {*} Data value
   */
  getData(key) {
    return this.data[key];
  }

  /**
   * Set targets (called when dialog submits)
   * @param {Array} targetIDs - Array of target IDs
   */
  setTargets(targetIDs) {
    this.targets = targetIDs;
  }

  /**
   * Update target information
   * @param {string} targetID - Target identifier
   * @param {Object} updates - Updates to apply
   */
  updateTarget(targetID, updates) {
    const targetIndex = this.targets.findIndex(t => t === targetID);
    if (targetIndex >= 0) {
      // For now, just store the targetID
      // Later we'll add a core function to look up target data
      this.targets[targetIndex] = targetID;
    }
  }
}
