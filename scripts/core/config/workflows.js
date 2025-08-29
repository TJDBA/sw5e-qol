// SW5E QoL - Workflow Configuration
// Static workflow definitions loaded when module initializes

export const WORKFLOW_CONFIGS = [
  { workflow: "attack", workflowSteps: ["start", "attack", "complete"] },
  { workflow: "attack-damage", workflowSteps: ["start", "attack", "damage", "complete"] },
  { workflow: "attack-save", workflowSteps: ["start", "attack", "save", "complete"] },
  { workflow: "damage-save-applyDamage", workflowSteps: ["start", "damage", "save", "applyDamage", "complete"] }
];

/**
 * Get workflow configuration by name
 * @param {string} workflowName - Name of workflow
 * @returns {Object|null} Workflow configuration or null if not found
 */
export function getWorkflow(workflowName) {
  return WORKFLOW_CONFIGS.find(w => w.workflow === workflowName) || null;
}

/**
 * Get all available workflow names
 * @returns {Array} Array of workflow names
 */
export function getAvailableWorkflows() {
  return WORKFLOW_CONFIGS.map(w => w.workflow);
}
