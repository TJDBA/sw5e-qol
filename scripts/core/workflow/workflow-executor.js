/**
 * Workflow Executor
 * Central system for executing workflows
 * Location: scripts/core/workflow/workflow-executor.js
 */

import { API } from '../../api.js';
import { AttackAction } from './actions/attack-action.js';

/**
 * Workflow Executor Class
 * Manages the execution of different workflow types
 */
export class WorkflowExecutor {
    constructor() {
        this.actions = new Map();
        this.activeWorkflows = new Map();
        this.initializeActions();
    }

    /**
     * Initialize available workflow actions
     */
    initializeActions() {
        // Register attack action
        this.actions.set('attack', new AttackAction());
        
        // Future workflow types can be registered here
        // this.actions.set('damage', new DamageAction());
        // this.actions.set('save', new SaveAction());
        // this.actions.set('skill', new SkillAction());
    }

    /**
     * Execute a workflow
     * @param {string} workflowType - Type of workflow to execute
     * @param {Object} dialogState - Dialog state from the input handler
     * @returns {Object} Workflow execution result
     */
    async executeWorkflow(workflowType, dialogState) {
        try {
            API.log('info', `WorkflowExecutor: Starting ${workflowType} workflow`);
            
            // Get the appropriate action
            const action = this.actions.get(workflowType);
            if (!action) {
                throw new Error(`Unknown workflow type: ${workflowType}`);
            }

            // Create initial workflow state
            const state = this.createInitialState(workflowType, dialogState);
            
            // Store active workflow
            this.activeWorkflows.set(state.workflowId, state);
            
            // Execute the workflow
            const result = await action.execute(state);
            
            // Clean up active workflow
            this.activeWorkflows.delete(state.workflowId);
            
            API.log('info', `WorkflowExecutor: Completed ${workflowType} workflow`);
            return result;
            
        } catch (error) {
            API.log('error', `WorkflowExecutor: Failed to execute ${workflowType} workflow:`, error);
            throw error;
        }
    }

    /**
     * Create initial workflow state
     * @param {string} workflowType - Type of workflow
     * @param {Object} dialogState - Dialog state from input handler
     * @returns {Object} Initial workflow state
     */
    createInitialState(workflowType, dialogState) {
        const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        return {
            workflowId: workflowId,
            workflowType: workflowType,
            dialogState: dialogState,
            stepIndex: 0,
            stepName: 'start',
            startTime: Date.now(),
            workflowComplete: false,
            errors: [],
            results: {},
            targets: [],
            dicePools: {}
        };
    }

    /**
     * Get active workflow by ID
     * @param {string} workflowId - Workflow ID
     * @returns {Object|null} Active workflow state or null
     */
    getActiveWorkflow(workflowId) {
        return this.activeWorkflows.get(workflowId) || null;
    }

    /**
     * Resume a workflow from a chat message
     * @param {string} workflowId - Workflow ID from chat message
     * @returns {Object} Workflow execution result
     */
    async resumeWorkflow(workflowId) {
        try {
            // Find the chat message with this workflow ID
            const message = game.messages.find(m => 
                m.flags?.['sw5e-qol']?.workflowState?.workflowId === workflowId
            );
            
            if (!message) {
                throw new Error(`Workflow ${workflowId} not found in chat messages`);
            }

            const state = message.flags['sw5e-qol'].workflowState;
            
            // Get the appropriate action
            const action = this.actions.get(state.workflowType);
            if (!action) {
                throw new Error(`Unknown workflow type: ${state.workflowType}`);
            }

            // Resume the workflow
            const result = await action.execute(state);
            
            API.log('info', `WorkflowExecutor: Resumed ${state.workflowType} workflow`);
            return result;
            
        } catch (error) {
            API.log('error', `WorkflowExecutor: Failed to resume workflow ${workflowId}:`, error);
            throw error;
        }
    }

    /**
     * Get all active workflows
     * @returns {Array} Array of active workflow states
     */
    getActiveWorkflows() {
        return Array.from(this.activeWorkflows.values());
    }

    /**
     * Cancel an active workflow
     * @param {string} workflowId - Workflow ID to cancel
     * @returns {boolean} True if workflow was cancelled
     */
    cancelWorkflow(workflowId) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (workflow) {
            workflow.cancelled = true;
            this.activeWorkflows.delete(workflowId);
            API.log('info', `WorkflowExecutor: Cancelled workflow ${workflowId}`);
            return true;
        }
        return false;
    }
}