/**
 * SW5E QoL - Workflow Orchestrator
 * Main workflow controller that manages action workflows
 * Based on planning documents: workflow-orchestrator.js - Main workflow controller
 */

import { StateManager } from '../core/state/state-manager.js';

export class WorkflowOrchestrator {
	constructor() {
		// State management
		this.stateManager = new StateManager();
		
		// Workflow registry
		this.workflows = new Map();
		
		// Active workflows
		this.activeWorkflows = new Map();
		
		// Workflow history
		this.workflowHistory = [];
		
		// Initialize workflows
		this.initializeWorkflows();
	}
	
	/**
	 * Initialize all available workflows
	 */
	async initializeWorkflows() {
		try {
			// Import workflow modules
			const { AttackAction } = await import('./actions/attack-action.js');
			const { DamageAction } = await import('./actions/damage-action.js');
			const { SaveAction } = await import('./actions/save-action.js');
			const { EffectApplicator } = await import('./actions/effect-applicator.js');
			
			// Register workflows
			this.registerWorkflow('attack', new AttackAction(this.stateManager));
			this.registerWorkflow('damage', new DamageAction(this.stateManager));
			this.registerWorkflow('save', new SaveAction(this.stateManager));
			this.registerWorkflow('effect', new EffectApplicator(this.stateManager));
			
			console.log('SW5E QoL | Workflows initialized successfully');
		} catch (error) {
			console.error('SW5E QoL | Error initializing workflows:', error);
		}
	}
	
	/**
	 * Register a workflow
	 * @param {string} name - Workflow name
	 * @param {Object} workflow - Workflow instance
	 */
	registerWorkflow(name, workflow) {
		this.workflows.set(name, workflow);
		console.log(`SW5E QoL | Registered workflow: ${name}`);
	}
	
	/**
	 * Start a new workflow
	 * @param {string} workflowType - Type of workflow to start
	 * @param {Object} seedData - Initial data for the workflow
	 * @returns {Promise<Object>} - Promise resolving to workflow result
	 */
	async startWorkflow(workflowType, seedData) {
		try {
			// Validate workflow type
			if (!this.workflows.has(workflowType)) {
				throw new Error(`Unknown workflow type: ${workflowType}`);
			}
			
			// Get workflow instance
			const workflow = this.workflows.get(workflowType);
			
			// Create new workflow state
			const workflowState = this.stateManager.createWorkflowState(seedData);
			
			// Start workflow
			const result = await workflow.start(workflowState, seedData);
			
			// Track active workflow
			this.activeWorkflows.set(workflowState.workflowId, {
				type: workflowType,
				state: workflowState,
				startTime: Date.now(),
				workflow: workflow
			});
			
			// Add to history
			this.addToHistory(workflowState.workflowId, workflowType, 'started');
			
			console.log(`SW5E QoL | Started ${workflowType} workflow: ${workflowState.workflowId}`);
			
			return result;
		} catch (error) {
			console.error('SW5E QoL | Workflow start error:', error);
			throw error;
		}
	}
	
	/**
	 * Continue an existing workflow
	 * @param {string} workflowId - ID of workflow to continue
	 * @param {Object} continuationData - Data for workflow continuation
	 * @returns {Promise<Object>} - Promise resolving to workflow result
	 */
	async continueWorkflow(workflowId, continuationData) {
		try {
			// Get active workflow
			const activeWorkflow = this.activeWorkflows.get(workflowId);
			if (!activeWorkflow) {
				throw new Error(`Workflow not found: ${workflowId}`);
			}
			
			// Continue workflow
			const result = await activeWorkflow.workflow.continue(workflowId, continuationData);
			
			// Update history
			this.addToHistory(workflowId, activeWorkflow.type, 'continued');
			
			console.log(`SW5E QoL | Continued workflow: ${workflowId}`);
			
			return result;
		} catch (error) {
			console.error('SW5E QoL | Workflow continuation error:', error);
			throw error;
		}
	}
	
	/**
	 * Chain to next workflow
	 * @param {string} currentWorkflowId - Current workflow ID
	 * @param {string} nextWorkflowType - Type of next workflow
	 * @param {Object} chainData - Data to pass to next workflow
	 * @returns {Promise<Object>} - Promise resolving to new workflow result
	 */
	async chainToNextWorkflow(currentWorkflowId, nextWorkflowType, chainData) {
		try {
			// Get current workflow state
			const currentState = this.stateManager.getStateByWorkflowId(currentWorkflowId);
			if (!currentState) {
				throw new Error(`Current workflow not found: ${currentWorkflowId}`);
			}
			
			// Prepare seed data for next workflow
			const seedData = {
				...chainData,
				previousResults: currentState.workflowState.chainData?.previousResults || [],
				carriedModifiers: currentState.workflowState.chainData?.carriedModifiers || [],
				weaponUsed: currentState.workflowState.chainData?.weaponUsed || null,
				hitStatus: currentState.workflowState.chainData?.hitStatus || []
			};
			
			// Start next workflow
			const result = await this.startWorkflow(nextWorkflowType, seedData);
			
			// Update history
			this.addToHistory(currentWorkflowId, 'unknown', 'chained', { nextWorkflow: nextWorkflowType });
			
			console.log(`SW5E QoL | Chained from ${currentWorkflowId} to ${nextWorkflowType}`);
			
			return result;
		} catch (error) {
			console.error('SW5E QoL | Workflow chaining error:', error);
			throw error;
		}
	}
	
	/**
	 * Complete a workflow
	 * @param {string} workflowId - ID of workflow to complete
	 * @param {Object} finalData - Final data for workflow completion
	 * @returns {Promise<Object>} - Promise resolving to completion result
	 */
	async completeWorkflow(workflowId, finalData) {
		try {
			// Get active workflow
			const activeWorkflow = this.activeWorkflows.get(workflowId);
			if (!activeWorkflow) {
				throw new Error(`Workflow not found: ${workflowId}`);
			}
			
			// Complete workflow
			const result = await activeWorkflow.workflow.complete(workflowId, finalData);
			
			// Remove from active workflows
			this.activeWorkflows.delete(workflowId);
			
			// Update history
			this.addToHistory(workflowId, activeWorkflow.type, 'completed');
			
			console.log(`SW5E QoL | Completed workflow: ${workflowId}`);
			
			return result;
		} catch (error) {
			console.error('SW5E QoL | Workflow completion error:', error);
			throw error;
		}
	}
	
	/**
	 * Cancel a workflow
	 * @param {string} workflowId - ID of workflow to cancel
	 * @param {string} reason - Reason for cancellation
	 * @returns {Promise<Object>} - Promise resolving to cancellation result
	 */
	async cancelWorkflow(workflowId, reason = 'User cancelled') {
		try {
			// Get active workflow
			const activeWorkflow = this.activeWorkflows.get(workflowId);
			if (!activeWorkflow) {
				throw new Error(`Workflow not found: ${workflowId}`);
			}
			
			// Cancel workflow
			const result = await activeWorkflow.workflow.cancel(workflowId, reason);
			
			// Remove from active workflows
			this.activeWorkflows.delete(workflowId);
			
			// Update history
			this.addToHistory(workflowId, activeWorkflow.type, 'cancelled', { reason });
			
			console.log(`SW5E QoL | Cancelled workflow: ${workflowId} - ${reason}`);
			
			return result;
		} catch (error) {
			console.error('SW5E QoL | Workflow cancellation error:', error);
			throw error;
		}
	}
	
	/**
	 * Undo a workflow
	 * @param {string} workflowId - ID of workflow to undo
	 * @returns {Promise<Object>} - Promise resolving to undo result
	 */
	async undoWorkflow(workflowId) {
		try {
			// Get workflow state
			const state = this.stateManager.getStateByWorkflowId(workflowId);
			if (!state) {
				throw new Error(`Workflow not found: ${workflowId}`);
			}
			
			// Check if undo is enabled
			if (!state.workflowState.undoState) {
				throw new Error('No undo state available for this workflow');
			}
			
			// Apply undo
			this.stateManager.applyUndoState(state.workflowState.undoState);
			
			// Update history
			this.addToHistory(workflowId, 'unknown', 'undone');
			
			console.log(`SW5E QoL | Undone workflow: ${workflowId}`);
			
			return { success: true, workflowId };
		} catch (error) {
			console.error('SW5E QoL | Workflow undo error:', error);
			throw error;
		}
	}
	
	/**
	 * Get workflow status
	 * @param {string} workflowId - Workflow ID
	 * @returns {Object|null} - Workflow status or null if not found
	 */
	getWorkflowStatus(workflowId) {
		const activeWorkflow = this.activeWorkflows.get(workflowId);
		if (activeWorkflow) {
			return {
				id: workflowId,
				type: activeWorkflow.type,
				status: 'active',
				startTime: activeWorkflow.startTime,
				duration: Date.now() - activeWorkflow.startTime,
				state: this.stateManager.getCurrentState()
			};
		}
		
		// Check history
		const historyEntry = this.workflowHistory.find(entry => entry.workflowId === workflowId);
		if (historyEntry) {
			return {
				id: workflowId,
				type: historyEntry.type,
				status: historyEntry.status,
				startTime: historyEntry.timestamp,
				endTime: historyEntry.endTimestamp,
				duration: historyEntry.endTimestamp ? historyEntry.endTimestamp - historyEntry.timestamp : null
			};
		}
		
		return null;
	}
	
	/**
	 * Get all active workflows
	 * @returns {Array} - Array of active workflow statuses
	 */
	getActiveWorkflows() {
		const activeWorkflows = [];
		
		for (const [workflowId, workflow] of this.activeWorkflows) {
			activeWorkflows.push(this.getWorkflowStatus(workflowId));
		}
		
		return activeWorkflows;
	}
	
	/**
	 * Get workflow history
	 * @param {number} limit - Maximum number of entries to return
	 * @returns {Array} - Array of workflow history entries
	 */
	getWorkflowHistory(limit = 50) {
		return this.workflowHistory.slice(-limit);
	}
	
	/**
	 * Add entry to workflow history
	 * @param {string} workflowId - Workflow ID
	 * @param {string} type - Workflow type
	 * @param {string} status - Workflow status
	 * @param {Object} metadata - Additional metadata
	 */
	addToHistory(workflowId, type, status, metadata = {}) {
		const entry = {
			workflowId,
			type,
			status,
			timestamp: Date.now(),
			endTimestamp: status === 'completed' || status === 'cancelled' ? Date.now() : null,
			metadata
		};
		
		this.workflowHistory.push(entry);
		
		// Limit history size
		if (this.workflowHistory.length > 100) {
			this.workflowHistory.shift();
		}
	}
	
	/**
	 * Get available workflow types
	 * @returns {Array} - Array of available workflow type names
	 */
	getAvailableWorkflowTypes() {
		return Array.from(this.workflows.keys());
	}
	
	/**
	 * Get workflow configuration
	 * @param {string} workflowType - Workflow type
	 * @returns {Object|null} - Workflow configuration or null if not found
	 */
	getWorkflowConfig(workflowType) {
		const workflow = this.workflows.get(workflowType);
		return workflow ? workflow.getConfig() : null;
	}
	
	/**
	 * Validate workflow data
	 * @param {string} workflowType - Workflow type
	 * @param {Object} data - Data to validate
	 * @returns {Object} - Validation result
	 */
	validateWorkflowData(workflowType, data) {
		const workflow = this.workflows.get(workflowType);
		return workflow ? workflow.validateData(data) : { valid: false, errors: ['Unknown workflow type'] };
	}
	
	/**
	 * Cleanup orchestrator
	 */
	cleanup() {
		// Cancel all active workflows
		for (const [workflowId] of this.activeWorkflows) {
			this.cancelWorkflow(workflowId, 'Module cleanup');
		}
		
		// Clear workflows
		this.workflows.clear();
		this.activeWorkflows.clear();
		this.workflowHistory = [];
		
		// Cleanup state manager
		this.stateManager.cleanup();
		
		console.log('SW5E QoL | Workflow orchestrator cleaned up');
	}
}
