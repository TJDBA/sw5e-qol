/**
 * Workflow Manager
 * Central system for executing workflows
 * Location: scripts/core/workflow/workflow-manager.js
 */

import { API } from '../../api.js';
import { getWorkflowConfig, getActionConfig, getActionValidationProperties } from './workflow-config.js';

const logThisFile = true;

/**
 * Workflow Manager Class
 * Manages the execution of different workflow types
 */
export class WorkflowManager {
    constructor() {
        if (logThisFile) API.log('debug', 'WorkflowManager: Constructor called');
    }

    /**
     * Execute a workflow
     * @param {string} workflowType - Type of workflow to execute
     * @param {Object} dialogState - Dialog state from the input handler
     * @returns {Object} Workflow execution result
     */
    async executeWorkflow(workflowType, dialogState) {
        try {
            if (logThisFile) {
                API.log('debug', `WorkflowManager: Starting ${workflowType} workflow`);
                API.log('info', '🎯 WorkflowManager called by roll button!');
                API.log('info', 'Workflow Type:', workflowType);
                API.log('info', 'Dialog State:', dialogState);
            }
            
            // Get workflow configuration
            const workflow = getWorkflowConfig(workflowType);
            if (!workflow) {
                throw new Error(`Workflow configuration not found for type: ${workflowType}`);
            }
            
            if (logThisFile) API.log('debug', `WorkflowManager: Workflow Config:`, workflow);

            // Initialize workflow state
            let workflowState = {
                workflowType: workflowType,
                dialogState: dialogState,
                startTime: Date.now(),
                currentAction: null,
                completedActions: [],
                errors: [],
                results: {}
            };

            // Loop through workflow actions
            for (const actionName of workflow.workflowActions) {
                try {
                    if (logThisFile) API.log('debug', `WorkflowManager: Processing action: ${actionName}`);
                    
                    // Get action configuration
                    const actionConfig = getActionConfig(workflowType, actionName);
                    if (logThisFile) API.log('debug', `WorkflowManager: Action Config:`, actionConfig);
                    
                    // Update current action in state
                    workflowState.currentAction = actionName;
                    
                    // Dynamically import and execute the action
                    const actionModule = await import(`./actions/${actionName}-action.js`);
                    const ActionClass = actionModule[`${actionName.charAt(0).toUpperCase() + actionName.slice(1)}Action`];
                    
                    if (!ActionClass) {
                        throw new Error(`Action class not found: ${actionName.charAt(0).toUpperCase() + actionName.slice(1)}Action`);
                    }
                    
                    // Create action instance and execute
                    const actionInstance = new ActionClass();
                    workflowState = await actionInstance.execute(workflowState);
                    
                    // Mark action as completed
                    workflowState.completedActions.push(actionName);
                    
                    if (logThisFile) API.log('debug', `WorkflowManager: Action ${actionName} completed successfully`);
                    
                } catch (error) {
                    API.log('error', `WorkflowManager: Failed to execute action ${actionName}:`, error);
                    workflowState.errors.push({
                        action: actionName,
                        error: error.message,
                        timestamp: Date.now()
                    });
                }
            }
            
            // Prepare result response
            const result = {
                success: workflowState.errors.length === 0,
                workflowType: workflowType,
                message: `WorkflowManager successfully executed ${workflowType} workflow`,
                timestamp: Date.now(),
                dialogState: dialogState,
                workflowState: workflowState,
                completedActions: workflowState.completedActions,
                errors: workflowState.errors
            };
            
            if (logThisFile) API.log('debug', `WorkflowManager: Completed ${workflowType} workflow`);
            return result;
            
        } catch (error) {
            API.log('error', 'WorkflowManager: Failed to execute workflow:', error);
            throw error;
        }
    }
}
